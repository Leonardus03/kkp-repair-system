import { useEffect, useState } from "react";
import api from "../../api/client.js";
import PageLoader from "../../components/PageLoader.jsx";
import Badge from "../../components/Badge.jsx";
import { useNotification } from "../../context/NotificationContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function ApprovalList() {
  const [items, setItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const { notify } = useNotification();
  const { showToast } = useToast();

  async function loadItems() {
    const res = await api.get("/qc/pending");
    setItems(res.data);
  }

  useEffect(() => {
    loadItems().finally(() => setPageLoading(false));
  }, []);

  async function handleVerify(partId, partCode, approved) {
    let notes = "";

    if (approved) {
      const confirmed = await notify({
        variant: "warning",
        code: "KONFIRMASI",
        title: "Setujui Hasil Repair?",
        message: `Part ${partCode} akan berpindah status jadi Ready to Return dan siap diproses Admin.`,
        primaryLabel: "Ya, Setujui",
        cancelLabel: "Batal",
      });
      if (!confirmed) return;
    } else {
      const result = await notify({
        variant: "warning",
        code: "KONFIRMASI",
        title: "Alasan Part Ditolak",
        message:
          "Part ini akan dikembalikan ke antrian repair untuk dikerjakan ulang. Tuliskan alasan penolakan (opsional).",
        input: { placeholder: "Contoh: masih ada karat di bagian sisi kiri" },
        primaryLabel: "Kirim Penolakan",
        cancelLabel: "Batal",
      });
      if (result === false) return;
      notes = result || "";
    }

    setVerifyingId(partId);
    try {
      await api.post(`/qc/${partId}/verify`, { approved, notes });
      showToast(
        "success",
        approved
          ? "Part disetujui -> Ready to Return"
          : "Part dikembalikan ke antrian repair",
      );
      await loadItems();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Gagal verifikasi");
    } finally {
      setVerifyingId(null);
    }
  }

  if (pageLoading) return <PageLoader label="Memuat daftar verifikasi..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-industrial font-bold tracking-wide text-white">
          VERIFIKASI HASIL PERBAIKAN
        </h2>
        <Badge color="amber">{items.length} menunggu</Badge>
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
            <Badge
              color={
                p.severity === "berat"
                  ? "red"
                  : p.severity === "sedang"
                    ? "amber"
                    : "emerald"
              }
            >
              {p.severity}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Tindakan: <span className="text-slate-300">{p.action_taken}</span>{" "}
              • Oleh: <span className="text-slate-300">{p.mp_name}</span>
            </span>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleVerify(p.id, p.part_code, true)}
                disabled={verifyingId === p.id}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:opacity-90 disabled:opacity-60"
              >
                {verifyingId === p.id ? "..." : "Approve"}
              </button>
              <button
                onClick={() => handleVerify(p.id, p.part_code, false)}
                disabled={verifyingId === p.id}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:opacity-90 disabled:opacity-60"
              >
                {verifyingId === p.id ? "..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-center text-slate-500 text-sm py-10">
          Tidak ada yang perlu diverifikasi
        </p>
      )}
    </div>
  );
}
