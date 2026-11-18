import { useEffect, useState } from "react";
import api from "../../api/client.js";
import PageLoader from "../../components/PageLoader.jsx";
import Badge from "../../components/Badge.jsx";
import Spinner from "../../components/Spinner.jsx";
import { useNotification } from "../../context/NotificationContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

function hoursSince(date) {
  return (Date.now() - new Date(date).getTime()) / 36e5;
}

export default function SupplyToLine() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const { notify } = useNotification();
  const { showToast } = useToast();

  async function loadItems() {
    const res = await api.get("/parts/pending-supply");
    setItems(res.data);
  }

  useEffect(() => {
    loadItems().finally(() => setLoading(false));
  }, []);

  async function handleSupply(p) {
    const confirmed = await notify({
      variant: "warning",
      code: "KONFIRMASI",
      title: "Part Sudah Sampai di Line Produksi?",
      message: `Part ${p.part_code} akan ditandai sudah disuplai balik ke line produksi. Pastikan fisiknya beneran sudah diterima di line.`,
      primaryLabel: "Ya, Sudah Disuplai",
      cancelLabel: "Batal",
    });
    if (!confirmed) return;

    setBusyId(p.id);
    try {
      await api.post(`/parts/${p.id}/mark-supplied`);
      showToast(
        "success",
        `Part ${p.part_code} ditandai sudah disuplai ke line`,
      );
      await loadItems();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Gagal menandai part");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <PageLoader label="Memuat daftar suplai..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-industrial font-bold tracking-wide text-white">
            SUPPLY KE LINE PRODUKSI
          </h2>
          <p className="text-xs text-slate-500">
            Part sudah Closed, tinggal dikirim balik ke line biar nggak karat
            lagi
          </p>
        </div>
        <Badge color={items.length > 0 ? "red" : "emerald"}>
          {items.length} belum disuplai
        </Badge>
      </div>

      {items.map((p) => {
        const h = hoursSince(p.returned_at);
        const late = h >= 4;
        return (
          <div
            key={p.id}
            className={`bg-[#131b2e] border rounded-xl p-4 ${late ? "border-red-500/40" : "border-white/10"}`}
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
              <Badge color={late ? "red" : "amber"}>
                Nunggu {h.toFixed(1)} jam
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Closed:{" "}
                <span className="text-slate-300">
                  {new Date(p.returned_at).toLocaleString("id-ID")}
                </span>
              </span>
              <button
                onClick={() => handleSupply(p)}
                disabled={busyId === p.id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:opacity-90 disabled:opacity-60"
              >
                {busyId === p.id && (
                  <Spinner
                    size="sm"
                    className="border-white border-t-transparent"
                  />
                )}
                {busyId === p.id ? "Memproses..." : "Tandai Sudah Disuplai"}
              </button>
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <p className="text-center text-slate-500 text-sm py-10">
          Semua part sudah disuplai ke line 👍
        </p>
      )}
    </div>
  );
}
