import { useEffect, useState } from "react";
import api from "../../api/client.js";
import PageLoader from "../../components/PageLoader.jsx";
import Badge from "../../components/Badge.jsx";

export default function QueueDashboard() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/parts/queue")
      .then((res) => setParts(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Memuat antrian..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-industrial font-bold tracking-wide text-white">
          ANTRIAN REPAIR
        </h2>
        <Badge color="amber">{parts.length} part menunggu</Badge>
      </div>

      {parts.map((p) => (
        <div
          key={p.id}
          className="bg-[#131b2e] border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-bold text-white font-mono-data truncate">
                {p.part_code}
              </span>
              <span className="text-slate-400 text-sm truncate">
                {p.part_name}
              </span>
            </div>
            <Badge color="amber">Qty {p.qty_input}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              Lokasi:{" "}
              <span className="text-slate-300">{p.origin_location}</span>
            </span>
            <span>
              Diinput:{" "}
              <span className="text-slate-300">{p.operator_name || "-"}</span>
            </span>
            <span>
              Line:{" "}
              <span className="text-slate-300">{p.operator_line || "-"}</span>
            </span>
            <span>
              Shift:{" "}
              {p.input_shift ? (
                <span className="text-red-400 font-semibold">
                  Shift {p.input_shift}
                </span>
              ) : (
                "-"
              )}
            </span>
            <span className="col-span-2">
              Masuk:{" "}
              <span className="text-slate-300">
                {new Date(p.input_at).toLocaleString("id-ID")}
              </span>
            </span>
          </div>
        </div>
      ))}

      {parts.length === 0 && (
        <p className="text-center text-slate-500 text-sm py-10">
          Tidak ada antrian
        </p>
      )}
    </div>
  );
}
