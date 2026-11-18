import pool from "../config/db.js";

export async function getFullReport(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         p.id, p.part_code, p.part_name, p.status, p.input_at,
         p.qty_input, p.lot_number AS pic_lot_number,
         p.operator_name AS pic_name, p.operator_line AS pic_line, piu.shift AS pic_shift,
         rl.operator_name AS mp_name, rl.operator_line AS mp_line, rl.qty_repaired,
         rl.lot_number AS mp_lot_number,
         rl.date_in::text AS date_in, rl.date_out::text AS date_out,
         qv.approved AS qc_approved, qv.verified_at AS qc_verified_at,
         p.returned_at,
         p.supplied_to_line, p.supplied_at
       FROM parts p
       LEFT JOIN users piu ON piu.id = p.input_by
       LEFT JOIN LATERAL (
         SELECT * FROM repair_logs
         WHERE part_id = p.id AND finished_at IS NOT NULL
         ORDER BY finished_at DESC LIMIT 1
       ) rl ON true
       LEFT JOIN LATERAL (
         SELECT * FROM qc_verifications
         WHERE part_id = p.id
         ORDER BY verified_at DESC LIMIT 1
       ) qv ON true
       ORDER BY p.input_at DESC
       LIMIT 150`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil laporan lengkap" });
  }
}
