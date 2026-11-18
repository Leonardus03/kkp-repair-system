import pool from "../config/db.js";

export async function getShiftReport(req, res) {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  try {
    const result = await pool.query(
      `SELECT
         u.shift,
         rl.operator_name,
         rl.operator_line,
         COUNT(rl.id)::int AS total_part_dikerjakan,
         COALESCE(SUM(rl.qty_repaired), 0)::int AS total_qty_repair
       FROM repair_logs rl
       JOIN users u ON u.id = rl.mp_id
       WHERE rl.finished_at IS NOT NULL AND rl.finished_at::date = $1
       GROUP BY u.shift, rl.operator_name, rl.operator_line
       ORDER BY u.shift NULLS LAST, rl.operator_name ASC`,
      [date],
    );

    const shiftA = result.rows.filter((r) => r.shift === "A");
    const shiftB = result.rows.filter((r) => r.shift === "B");
    const unassigned = result.rows.filter((r) => !r.shift);
    const sumQty = (rows) => rows.reduce((s, r) => s + r.total_qty_repair, 0);

    res.json({
      date,
      shift_a: { mps: shiftA, total_qty: sumQty(shiftA) },
      shift_b: { mps: shiftB, total_qty: sumQty(shiftB) },
      unassigned,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil laporan shift" });
  }
}
