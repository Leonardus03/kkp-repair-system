import pool from "../config/db.js";

export async function getPendingVerification(req, res) {
  try {
    const result = await pool.query(
      `SELECT p.*, rl.severity, rl.action_taken, rl.notes AS repair_notes, u.full_name AS mp_name
       FROM parts p
       JOIN repair_logs rl ON rl.part_id = p.id AND rl.finished_at IS NOT NULL
       JOIN users u ON u.id = rl.mp_id
       WHERE p.status = 'on_progress_repair'
       ORDER BY rl.finished_at ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil daftar verifikasi" });
  }
}

export async function verifyPart(req, res) {
  const { approved, notes } = req.body;
  if (typeof approved !== "boolean") {
    return res
      .status(400)
      .json({ message: "Field approved (boolean) wajib diisi" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const part = await client.query(
      "SELECT status FROM parts WHERE id = $1 FOR UPDATE",
      [req.params.partId],
    );
    if (part.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Part tidak ditemukan" });
    }
    if (part.rows[0].status !== "on_progress_repair") {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ message: "Part belum siap untuk verifikasi" });
    }

    await client.query(
      `INSERT INTO qc_verifications (part_id, qc_id, approved, notes) VALUES ($1, $2, $3, $4)`,
      [req.params.partId, req.user.id, approved, notes || null],
    );

    const newStatus = approved ? "ready_to_return" : "waiting_repair";
    await client.query("UPDATE parts SET status = $1 WHERE id = $2", [
      newStatus,
      req.params.partId,
    ]);

    await client.query("COMMIT");
    res.json({
      message: approved
        ? "Part disetujui, status: Ready to Return"
        : "Part dikembalikan ke MP Repair",
      status: newStatus,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Gagal memproses verifikasi" });
  } finally {
    client.release();
  }
}
