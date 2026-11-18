import pool from "../config/db.js";

export async function createPart(req, res) {
  const {
    part_code,
    part_name,
    origin_location,
    operator_name,
    operator_line,
    qty_input,
    lot_number,
  } = req.body;
  if (!part_code || !part_name || !origin_location) {
    return res
      .status(400)
      .json({ message: "part_code, part_name, origin_location wajib diisi" });
  }
  const lot = String(lot_number || "").trim();
  if (!lot) {
    return res.status(400).json({ message: "Nomor Lot wajib diisi" });
  }
  if (!operator_name || !operator_line) {
    return res
      .status(400)
      .json({ message: "Nama dan Line yang dipegang wajib diisi" });
  }
  const qty = Number(qty_input);
  if (!qty || qty < 1) {
    return res
      .status(400)
      .json({ message: "Qty unit dikirim wajib diisi, minimal 1" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO parts (part_code, part_name, origin_location, status, input_by, operator_name, operator_line, qty_input, lot_number)
       VALUES ($1, $2, $3, 'waiting_repair', $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        part_code,
        part_name,
        origin_location,
        req.user.id,
        operator_name,
        operator_line,
        qty,
        lot,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "part_code (barcode) sudah pernah diinput" });
    }
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan part" });
  }
}

export async function getQueue(req, res) {
  try {
    const result = await pool.query(
      `SELECT p.*, u.full_name AS input_by_name, u.shift AS input_shift
       FROM parts p
       LEFT JOIN users u ON u.id = p.input_by
       WHERE p.status = 'waiting_repair'
       ORDER BY p.input_at ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil antrian" });
  }
}

export async function getPendingSupply(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM parts
       WHERE status = 'closed' AND supplied_to_line = false
       ORDER BY returned_at ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Gagal mengambil daftar part siap disuplai" });
  }
}

export async function markSupplied(req, res) {
  try {
    const result = await pool.query(
      `UPDATE parts SET supplied_to_line = true, supplied_at = NOW(), supplied_by = $1
       WHERE id = $2 AND status = 'closed' AND supplied_to_line = false
       RETURNING *`,
      [req.user.id, req.params.id],
    );
    if (result.rows.length === 0) {
      return res
        .status(409)
        .json({ message: "Part tidak ditemukan atau sudah ditandai disuplai" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menandai part disuplai" });
  }
}

export async function getPartDetail(req, res) {
  try {
    const part = await pool.query("SELECT * FROM parts WHERE id = $1", [
      req.params.id,
    ]);
    if (part.rows.length === 0)
      return res.status(404).json({ message: "Part tidak ditemukan" });

    const logs = await pool.query(
      `SELECT rl.*, u.full_name AS mp_name FROM repair_logs rl
       JOIN users u ON u.id = rl.mp_id WHERE rl.part_id = $1 ORDER BY started_at DESC`,
      [req.params.id],
    );
    const verifications = await pool.query(
      `SELECT qv.*, u.full_name AS qc_name FROM qc_verifications qv
       JOIN users u ON u.id = qv.qc_id WHERE qv.part_id = $1 ORDER BY verified_at DESC`,
      [req.params.id],
    );
    const history = await pool.query(
      "SELECT * FROM status_history WHERE part_id = $1 ORDER BY changed_at ASC",
      [req.params.id],
    );

    res.json({
      ...part.rows[0],
      logs: logs.rows,
      verifications: verifications.rows,
      history: history.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil detail part" });
  }
}
