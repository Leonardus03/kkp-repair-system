import { useEffect, useState } from "react";
import api from "../../api/client.js";
import PageLoader from "../../components/PageLoader.jsx";
import Badge from "../../components/Badge.jsx";

function hoursSince(date) {
  return (Date.now() - new Date(date).getTime()) / 36e5;
}

const fmtDate = (s) => (s ? s.split("-").reverse().join("/") : "-");

function Step({ label, done, text, sub, danger }) {
  const color = danger
    ? "text-red-400"
    : done
      ? "text-emerald-400"
      : "text-slate-500";
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`text-sm font-semibold ${color}`}>
        {danger ? "✕ " : done ? "✓ " : "… "}
        {text}
      </p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "unsupplied", label: "Belum Disuplai" },
  { key: "process", label: "Dalam Proses" },
  { key: "done", label: "Selesai" },
];

export default function FullReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api
      .get("/leader/full-report")
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Memuat laporan lengkap..." />;

  const isUnsupplied = (r) => r.status === "closed" && !r.supplied_to_line;
  const isDone = (r) => r.status === "closed" && r.supplied_to_line;
  const isProcess = (r) => r.status !== "closed";

  const unsuppliedCount = rows.filter(isUnsupplied).length;
  const processCount = rows.filter(isProcess).length;
  const doneCount = rows.filter(isDone).length;

  const filtered = rows.filter((r) => {
    if (filter === "unsupplied") return isUnsupplied(r);
    if (filter === "process") return isProcess(r);
    if (filter === "done") return isDone(r);
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
      <h2 className="font-industrial font-bold tracking-wide text-white">
        LAPORAN LENGKAP
      </h2>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#131b2e] border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono-data text-blue-400">
            {processCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">Dalam Proses</p>
        </div>
        <div
          className={`bg-[#131b2e] border rounded-xl p-4 text-center ${unsuppliedCount > 0 ? "border-red-500/40" : "border-white/10"}`}
        >
          <p className="text-2xl font-bold font-mono-data text-red-400">
            {unsuppliedCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">Belum Disuplai</p>
        </div>
        <div className="bg-[#131b2e] border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono-data text-emerald-400">
            {doneCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">Selesai</p>
        </div>
      </div>

      <div className="bg-[#131b2e] border border-white/10 rounded-xl p-1 flex gap-1 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${
              filter === f.key
                ? "bg-red-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => {
          const waitH =
            r.returned_at && !r.supplied_to_line
              ? hoursSince(r.returned_at)
              : null;
          const lateSupply = waitH !== null && waitH >= 4;
          const qtyMismatch =
            r.qty_repaired != null && r.qty_repaired !== r.qty_input;
          const lotMismatch =
            !!r.mp_lot_number &&
            !!r.pic_lot_number &&
            r.mp_lot_number !== r.pic_lot_number;

          return (
            <div
              key={r.id}
              className={`bg-[#131b2e] border rounded-xl p-4 ${lateSupply ? "border-red-500/40" : "border-white/10"}`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="font-bold text-white font-mono-data truncate">
                    {r.part_code}
                  </span>
                  <span className="text-slate-400 text-sm truncate">
                    {r.part_name}
                  </span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {qtyMismatch && <Badge color="amber">Qty beda</Badge>}
                  {lotMismatch && <Badge color="amber">Lot beda</Badge>}
                  {lateSupply && (
                    <Badge color="red">Nunggu {waitH.toFixed(1)} jam</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Step
                  label="1. PIC Input"
                  done
                  text={`${r.pic_name || "-"} • Qty ${r.qty_input}`}
                  sub={`${r.pic_line || "-"}${r.pic_shift ? ` • Shift ${r.pic_shift}` : ""} • Lot ${r.pic_lot_number || "-"}`}
                />
                <Step
                  label="2. MP Repair"
                  done={r.qty_repaired != null}
                  text={
                    r.qty_repaired != null
                      ? `${r.mp_name || "-"} • Qty ${r.qty_repaired}`
                      : "Belum selesai direpair"
                  }
                  sub={
                    r.qty_repaired != null
                      ? `${r.mp_line || "-"} • Lot ${r.mp_lot_number || "-"} • In ${fmtDate(r.date_in)} → Out ${fmtDate(r.date_out)}`
                      : null
                  }
                />
                <Step
                  label="3. QC"
                  done={r.qc_approved === true}
                  danger={r.qc_approved === false}
                  text={
                    r.qc_approved === true
                      ? "Sudah diverifikasi (lolos)"
                      : r.qc_approved === false
                        ? "Ditolak, repair ulang"
                        : "Belum diverifikasi"
                  }
                  sub={
                    r.qc_verified_at
                      ? new Date(r.qc_verified_at).toLocaleString("id-ID")
                      : null
                  }
                />
                <Step
                  label="4. Admin"
                  done={!!r.returned_at}
                  text={
                    r.returned_at ? "Sudah di-ACC (Closed)" : "Belum di-ACC"
                  }
                  sub={
                    r.returned_at
                      ? new Date(r.returned_at).toLocaleString("id-ID")
                      : null
                  }
                />
                <div className="col-span-2">
                  <Step
                    label="5. Suplai ke Line Produksi"
                    done={r.supplied_to_line}
                    danger={lateSupply}
                    text={
                      r.supplied_to_line
                        ? "Sudah disuplai ke line"
                        : r.returned_at
                          ? "Belum disuplai — risiko karat lagi kalau didiamkan"
                          : "Menunggu tahap sebelumnya"
                    }
                    sub={
                      r.supplied_at
                        ? new Date(r.supplied_at).toLocaleString("id-ID")
                        : null
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-10">
            Tidak ada data
          </p>
        )}
      </div>
    </div>
  );
}
