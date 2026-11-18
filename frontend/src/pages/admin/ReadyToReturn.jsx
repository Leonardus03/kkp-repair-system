import { useEffect, useState } from "react";
import api from "../../api/client.js";
import PageLoader from "../../components/PageLoader.jsx";
import Badge from "../../components/Badge.jsx";
import { useNotification } from "../../context/NotificationContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function ReadyToReturn() {
  const [items, setItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [closingId, setClosingId] = useState(null);
  const { notify } = useNotification();
  const { showToast } = useToast();

  async function loadItems() {
    const res = await api.get("/admin/ready-to-return");
    setItems(res.data);
  }

  useEffect(() => {
    loadItems().finally(() => setPageLoading(false));
  }, []);

  async function handleMarkReturned(partId) {
    const confirmed = await notify({
      variant: "warning",
      code: "KONFIRMASI",
      title: "Tutup Tiket Repair?",
      message:
        "Pastikan sudah input manual ke sistem utama perusahaan sebelum menutup tiket ini. Part akan berstatus Closed.",
      primaryLabel: "Ya, Tutup Tiket",
      cancelLabel: "Batal",
    });
    if (!confirmed) return;

    setClosingId(partId);
    try {
      await api.post(`/admin/${partId}/mark-returned`);
      showToast("success", "Part ditutup (Closed)");
      await loadItems();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Gagal menutup tiket");
    } finally {
      setClosingId(null);
    }
  }

  if (pageLoading)
    return <PageLoader label="Memuat daftar ready to return..." />;

  const totalQty = items.reduce((sum, p) => sum + (p.qty_repaired || 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-industrial font-bold tracking-wide text-white">
          READY TO RETURN
        </h2>
        <div className="bg-[#131b2e] border border-emerald-500/20 rounded-xl px-4 py-2 text-center">
          <p className="text-2xl font-bold font-mono-data text-emerald-400">
            {totalQty}
          </p>
          <p className="text-xs text-slate-400">Total Qty Perlu Di-return</p>
        </div>
      </div>

      {items.map((p) => (
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
            <Badge color="emerald">Qty {p.qty_repaired ?? "-"}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
            <span>
              Direpair:{" "}
              <span className="text-slate-300">
                {p.mp_operator_name || "-"}
              </span>
            </span>
            <span>
              Line:{" "}
              <span className="text-slate-300">
                {p.mp_operator_line || "-"}
              </span>
            </span>
            <span className="col-span-2">
              Catatan QC:{" "}
              <span className="text-slate-300">{p.qc_notes || "-"}</span>
            </span>
            <span className="col-span-2">
              Diverifikasi:{" "}
              <span className="text-slate-300">
                {new Date(p.verified_at).toLocaleString("id-ID")}
              </span>
            </span>
          </div>
          <button
            onClick={() => handleMarkReturned(p.id)}
            disabled={closingId === p.id}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold hover:opacity-90 disabled:opacity-60"
          >
            {closingId === p.id ? "Menutup..." : "Mark as Returned"}
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-center text-slate-500 text-sm py-10">
          Belum ada part siap return
        </p>
      )}
    </div>
  );
}
