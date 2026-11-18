import pool from "../config/db.js";

export async function getStatusMonitor(req, res) {
  try {
    const result = await pool.query(
      `SELECT status, COUNT(*)::int AS total
       FROM parts
       WHERE status != 'closed'
       GROUP BY status`,
    );
    const allStatuses = [
      "waiting_repair",
      "on_progress_repair",
      "ready_to_return",
    ];
    const counts = Object.fromEntries(allStatuses.map((s) => [s, 0]));
    result.rows.forEach((r) => (counts[r.status] = r.total));
    res.json(counts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil status monitor" });
  }
}

export async function getLeadTime(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        p.id, p.part_code, p.part_name,
        p.input_at,
        p.returned_at,
        EXTRACT(EPOCH FROM (COALESCE(p.returned_at, NOW()) - p.input_at)) / 3600 AS total_hours
      FROM parts p
      ORDER BY p.input_at DESC
      LIMIT 100
    `);

    const closedOnly = result.rows.filter((r) => r.returned_at);
    const avgHours =
      closedOnly.length > 0
        ? closedOnly.reduce((sum, r) => sum + Number(r.total_hours), 0) /
          closedOnly.length
        : 0;

    res.json({
      average_lead_time_hours: Number(avgHours.toFixed(2)),
      parts: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil lead time" });
  }
}
