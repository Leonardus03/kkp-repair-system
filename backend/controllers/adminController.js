import pool from "../config/db.js";

// GET /api/admin/ready-to-return  (Tahap 4 - daftar part siap masuk sistem utama perusahaan)
export async function getReadyToReturn(req, res) {
  try {
    const result = await pool.query(
      `SELECT p.*, qv.notes AS qc_notes, qv.verified_at
       FROM parts p
       JOIN qc_verifications qv ON qv.part_id = p.id AND qv.approved = true
       WHERE p.status = 'ready_to_return'
       ORDER BY qv.verified_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil daftar ready to return" });
  }
}

// POST /api/admin/:partId/mark-returned  (Tahap 4 - tombol Mark as Returned, tutup tiket)
export async function markAsReturned(req, res) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const part = await client.query("SELECT status FROM parts WHERE id = $1 FOR UPDATE", [req.params.partId]);
    if (part.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Part tidak ditemukan" });
    }
    if (part.rows[0].status !== "ready_to_return") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Part belum berstatus Ready to Return" });
    }

    await client.query(
      "UPDATE parts SET status = 'closed', returned_at = NOW() WHERE id = $1",
      [req.params.partId]
    );
    await client.query("COMMIT");
    res.json({ message: "Part ditutup (Closed) dan sudah di-return ke sistem utama" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Gagal menutup tiket" });
  } finally {
    client.release();
  }
}
