import { useEffect, useState } from "react";
import api from "../../api/client.js";
import PageLoader from "../../components/PageLoader.jsx";
import Badge from "../../components/Badge.jsx";

function ShiftCard({ title, data }) {
  return (
    <div className="bg-[#131b2e] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">{title}</h3>
        <Badge color="blue">Total Qty {data.total_qty}</Badge>
      </div>
      <div className="space-y-2">
        {data.mps.map((mp, i) => (
          <div
            key={`${mp.operator_name}-${mp.operator_line}-${i}`}
            className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5"
          >
            <div>
              <p className="text-sm text-white font-semibold">
                {mp.operator_name || "-"}
              </p>
              <p className="text-xs text-slate-500">
                {mp.operator_line || "-"} • {mp.total_part_dikerjakan} part
              </p>
            </div>
            <span className="font-mono-data font-bold text-emerald-400">
              {mp.total_qty_repair}
            </span>
          </div>
        ))}
        {data.mps.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-4">
            Belum ada yang repair di shift ini
          </p>
        )}
      </div>
    </div>
  );
}

export default function ShiftReport() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    setLoading(true);
    try {
      const res = await api.get(`/section-head/shift-report?date=${date}`);
      setReport(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, [date]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-industrial font-bold tracking-wide text-white">
          LAPORAN REPAIR PER SHIFT
        </h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-white outline-none focus:border-red-600"
        />
      </div>

      {loading && <PageLoader label="Memuat laporan shift..." />}

      {!loading && report && (
        <div className="grid md:grid-cols-2 gap-5">
          <ShiftCard title="Shift A" data={report.shift_a} />
          <ShiftCard title="Shift B" data={report.shift_b} />
        </div>
      )}
    </div>
  );
}
