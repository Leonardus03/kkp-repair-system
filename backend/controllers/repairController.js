import pool from "../config/db.js";

export async function getMyTodaySummary(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*)::int AS total_part,
         COALESCE(SUM(qty_repaired), 0)::int AS total_qty
       FROM repair_logs
       WHERE mp_id = $1 AND finished_at IS NOT NULL AND finished_at::date = CURRENT_DATE`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil ringkasan hari ini" });
  }
}

export async function getMyTasks(req, res) {
  try {
    const result = await pool.query(
      `SELECT p.*, rl.id AS log_id, rl.severity, rl.action_taken, rl.started_at,
              fin.date_in::text AS date_in, fin.date_out::text AS date_out,
              fin.lot_number AS mp_lot_number
       FROM parts p
       LEFT JOIN repair_logs rl ON rl.part_id = p.id AND rl.mp_id = $1 AND rl.finished_at IS NULL
       LEFT JOIN LATERAL (
         SELECT date_in, date_out, lot_number FROM repair_logs
         WHERE part_id = p.id AND finished_at IS NOT NULL
         ORDER BY finished_at DESC LIMIT 1
       ) fin ON true
       WHERE p.status IN ('waiting_repair', 'on_progress_repair')
       ORDER BY p.input_at ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil task list" });
  }
}

export async function startRepair(req, res) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const part = await client.query("SELECT status FROM parts WHERE id = $1 FOR UPDATE", [req.params.partId]);
    if (part.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Part tidak ditemukan" });
    }
    if (part.rows[0].status !== "waiting_repair") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Part tidak dalam status waiting_repair" });
    }

    await client.query("UPDATE parts SET status = 'on_progress_repair' WHERE id = $1", [req.params.partId]);
    const log = await client.query(
      `INSERT INTO repair_logs (part_id, mp_id, severity, action_taken, notes)
       VALUES ($1, $2, 'belum dinilai', 'belum dikerjakan', NULL) RETURNING *`,
      [req.params.partId, req.user.id]
    );
    await client.query("COMMIT");
    res.status(201).json(log.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Gagal memulai repair" });
  } finally {
    client.release();
  }
}

export async function submitRepairLog(req, res) {
  const { severity, action_taken, notes, qty_repaired, operator_name, operator_line, lot_number, date_in, date_out } = req.body;
  if (!severity || !action_taken) {
    return res.status(400).json({ message: "severity dan action_taken wajib diisi" });
  }
  const qty = Number(qty_repaired);
  if (!qty || qty < 1) {
    return res.status(400).json({ message: "qty_repaired wajib diisi, minimal 1" });
  }
  if (!operator_name || !operator_line) {
    return res.status(400).json({ message: "Nama dan Line yang dipegang wajib diisi" });
  }
  const lot = String(lot_number || "").trim();
  if (!lot) {
    return res.status(400).json({ message: "Nomor Lot wajib diisi" });
  }
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDate.test(date_in || "") || !isoDate.test(date_out || "")) {
    return res.status(400).json({ message: "Tanggal In dan Tanggal Out wajib diisi" });
  }
  if (date_out < date_in) {
    return res.status(400).json({ message: "Tanggal Out tidak boleh lebih awal dari Tanggal In" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const log = await client.query(
      `UPDATE repair_logs
       SET severity = $1, action_taken = $2, notes = $3, qty_repaired = $4,
           operator_name = $5, operator_line = $6, lot_number = $7,
           date_in = $8, date_out = $9, finished_at = NOW()
       WHERE id = $10 AND mp_id = $11 RETURNING *`,
      [severity, action_taken, notes || null, qty, operator_name, operator_line, lot, date_in, date_out, req.params.logId, req.user.id]
    );
    if (log.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Log tidak ditemukan atau bukan milik Anda" });
    }
    await client.query("COMMIT");
    res.json(log.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan log pengerjaan" });
  } finally {
    client.release();
  }
}