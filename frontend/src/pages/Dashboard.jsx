import { useEffect, useState } from "react";
import api from "../api/client.js";
import PageLoader from "../components/PageLoader.jsx";
import StatCard from "../components/StatCard.jsx";
import Badge from "../components/Badge.jsx";

export default function Dashboard() {
  const [statusCounts, setStatusCounts] = useState({});
  const [leadTime, setLeadTime] = useState({
    average_lead_time_hours: 0,
    parts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api
        .get("/dashboard/status-monitor")
        .then((res) => setStatusCounts(res.data)),
      api.get("/dashboard/lead-time").then((res) => setLeadTime(res.data)),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Memuat dashboard..." />;

  const maxValue = Math.max(
    statusCounts.waiting_repair || 0,
    statusCounts.on_progress_repair || 0,
    statusCounts.ready_to_return || 0,
    1,
  );

  function durationColor(p) {
    if (p.returned_at) return "blue";
    return Number(p.total_hours) < 24 ? "emerald" : "red";
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="bg-[#131b2e] border border-red-600/40 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="font-industrial font-bold tracking-wide text-white text-sm">
              REAL-TIME STATUS MONITOR
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono-data">
            Live Sync
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            value={statusCounts.waiting_repair || 0}
            max={maxValue}
            label="Waiting for Repair"
            color="amber"
          />
          <StatCard
            value={statusCounts.on_progress_repair || 0}
            max={maxValue}
            label="On Progress Repair"
            color="blue"
          />
          <StatCard
            value={statusCounts.ready_to_return || 0}
            max={maxValue}
            label="Ready to Return"
            color="emerald"
          />
        </div>
      </div>

      <div className="bg-[#131b2e] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-white text-sm tracking-wide">
              LEAD TIME TRACKING
            </h2>
            <p className="text-xs text-slate-500">
              Monitoring perbaikan komponen
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Rata-rata</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-lg bg-red-600/10 border border-red-600/40 text-red-400 font-mono-data font-bold text-sm">
              {leadTime.average_lead_time_hours} jam
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {leadTime.parts.map((p) => (
            <div
              key={p.id}
              className="bg-white/[0.03] border border-white/5 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="font-bold text-white font-mono-data truncate">
                    {p.part_code}
                  </span>
                  <span className="text-slate-400 text-sm truncate">
                    {p.part_name}
                  </span>
                </div>
                <Badge color={durationColor(p)}>
                  {Number(p.total_hours).toFixed(1)} jam
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Masuk:{" "}
                  <span className="text-white font-semibold">
                    {new Date(p.input_at).toLocaleDateString("id-ID")}
                  </span>
                </span>
                <span>
                  Selesai:{" "}
                  <span
                    className={
                      p.returned_at
                        ? "text-blue-400 font-semibold"
                        : "text-amber-400 font-semibold"
                    }
                  >
                    {p.returned_at
                      ? new Date(p.returned_at).toLocaleDateString("id-ID")
                      : "Dalam proses (-)"}
                  </span>
                </span>
              </div>
            </div>
          ))}
          {leadTime.parts.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-6">
              Belum ada data
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
