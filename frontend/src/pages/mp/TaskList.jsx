import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Spinner from "../../components/Spinner.jsx";
import PageLoader from "../../components/PageLoader.jsx";
import Badge from "../../components/Badge.jsx";
import { useNotification } from "../../context/NotificationContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const input =
  "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-red-600";
const label = "block text-sm text-slate-300 mb-1.5";

const EMPTY_LOG = {
  severity: "ringan",
  action_taken: "brushing",
  qty_repaired: 1,
  operator_name: "",
  operator_line: "",
  lot_number: "",
  date_in: "",
  date_out: "",
  notes: "",
};

const fmtDate = (s) => (s ? s.split("-").reverse().join("/") : "-");

function Field({ name, value, mono }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {name}
      </p>
      <p
        className={`text-sm text-slate-200 truncate ${mono ? "font-mono-data" : ""}`}
      >
        {value === null || value === undefined || value === "" ? "-" : value}
      </p>
    </div>
  );
}

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [logForm, setLogForm] = useState(EMPTY_LOG);
  const [todaySummary, setTodaySummary] = useState({
    total_part: 0,
    total_qty: 0,
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useNotification();
  const { showToast } = useToast();

  async function loadTasks() {
    const res = await api.get("/repair/tasks");
    setTasks(res.data);
  }
  async function loadSummary() {
    const res = await api.get("/repair/my-today-summary");
    setTodaySummary(res.data);
  }

  useEffect(() => {
    Promise.all([loadTasks(), loadSummary()]).finally(() =>
      setPageLoading(false),
    );
  }, []);

  function openLog(logId, task) {
    setSelected({ id: logId, part: task });
    setLogForm({ ...EMPTY_LOG, lot_number: task.lot_number || "" });
  }

  async function handleStart(t) {
    const confirmed = await notify({
      variant: "warning",
      code: "KONFIRMASI",
      title: "Mulai Kerjakan Part Ini?",
      message: `Part ${t.part_code} akan berpindah status jadi On Progress Repair dan tercatat sebagai part yang sedang kamu kerjakan.`,
      primaryLabel: "Ya, Mulai",
      cancelLabel: "Batal",
    });
    if (!confirmed) return;

    setStartingId(t.id);
    try {
      const res = await api.post(`/repair/${t.id}/start`);
      openLog(res.data.id, t);
      await loadTasks();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Gagal memulai repair");
    } finally {
      setStartingId(null);
    }
  }

  async function handleSubmitLog(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/repair/logs/${selected.id}`, logForm);
      showToast("success", "Log pengerjaan tersimpan, menunggu verifikasi QC");
      setSelected(null);
      setLogForm(EMPTY_LOG);
      await loadTasks();
      await loadSummary();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Gagal simpan log");
    } finally {
      setSubmitting(false);
    }
  }

  if (pageLoading) return <PageLoader label="Memuat task list..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
      <h2 className="font-industrial font-bold tracking-wide text-white">
        TASK LIST SAYA
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#131b2e] border border-emerald-500/20 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold font-mono-data text-emerald-400">
            {todaySummary.total_part}
          </p>
          <p className="text-sm text-slate-400 mt-1">Part Selesai Hari Ini</p>
        </div>
        <div className="bg-[#131b2e] border border-blue-500/20 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold font-mono-data text-blue-400">
            {todaySummary.total_qty}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Total Qty Repair Hari Ini
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((t) => {
          const finished = t.status === "on_progress_repair" && !t.log_id;
          const canStart = t.status === "waiting_repair";
          const canLog = t.status === "on_progress_repair" && t.log_id;

          return (
            <div
              key={t.id}
              className="bg-[#131b2e] border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 flex-1 min-w-0">
                  <Field name="Part Number" value={t.part_code} mono />
                  <Field name="Part Name" value={t.part_name} />
                  <Field name="Nomor Lot" value={t.lot_number} mono />
                  <Field name="Qty Dikirim" value={t.qty_input} mono />
                  <Field
                    name="Tanggal In"
                    value={finished ? fmtDate(t.date_in) : "-"}
                    mono
                  />
                  <Field
                    name="Tanggal Out"
                    value={finished ? fmtDate(t.date_out) : "-"}
                    mono
                  />
                </div>
                <Badge color={t.status === "waiting_repair" ? "amber" : "blue"}>
                  {t.status === "waiting_repair" ? "Waiting" : "On Progress"}
                </Badge>
              </div>

              {(canStart || canLog) && (
                <div className="flex justify-end mt-3">
                  {canStart && (
                    <button
                      onClick={() => handleStart(t)}
                      disabled={startingId === t.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:opacity-90 disabled:opacity-60"
                    >
                      {startingId === t.id && (
                        <Spinner
                          size="sm"
                          className="border-white border-t-transparent"
                        />
                      )}
                      {startingId === t.id ? "Memulai..." : "Scan & Mulai"}
                    </button>
                  )}
                  {canLog && (
                    <button
                      onClick={() => openLog(t.log_id, t)}
                      className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:opacity-90"
                    >
                      Isi Digital Log
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {tasks.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-8">
            Tidak ada tugas
          </p>
        )}
      </div>

      {selected && (
        <form
          onSubmit={handleSubmitLog}
          className="bg-[#131b2e] border border-red-600/40 rounded-2xl p-5 space-y-4"
        >
          <h3 className="font-bold text-white">Digital Log Pengerjaan</h3>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 grid grid-cols-2 gap-3">
            <Field name="Part Number" value={selected.part?.part_code} mono />
            <Field name="Part Name" value={selected.part?.part_name} />
          </div>

          <div className="rounded-xl border border-red-600/30 bg-red-600/5 p-4 space-y-3">
            <p className="text-xs font-semibold text-red-400">
              Wajib diisi — siapa yang ngerjain
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Nama Kamu</label>
                <input
                  className={input}
                  placeholder="Nama lengkap"
                  required
                  value={logForm.operator_name}
                  onChange={(e) =>
                    setLogForm({ ...logForm, operator_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={label}>Line yang Dipegang</label>
                <input
                  className={input}
                  placeholder="Misal: Line 1"
                  required
                  value={logForm.operator_line}
                  onChange={(e) =>
                    setLogForm({ ...logForm, operator_line: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Tanggal In</label>
              <input
                type="date"
                required
                className={`${input} font-mono-data`}
                style={{ colorScheme: "dark" }}
                value={logForm.date_in}
                onChange={(e) =>
                  setLogForm({ ...logForm, date_in: e.target.value })
                }
              />
            </div>
            <div>
              <label className={label}>Tanggal Out</label>
              <input
                type="date"
                required
                min={logForm.date_in || undefined}
                className={`${input} font-mono-data`}
                style={{ colorScheme: "dark" }}
                value={logForm.date_out}
                onChange={(e) =>
                  setLogForm({ ...logForm, date_out: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Nomor Lot</label>
              <input
                className={`${input} font-mono-data`}
                required
                placeholder="Sesuai label part"
                value={logForm.lot_number}
                onChange={(e) =>
                  setLogForm({ ...logForm, lot_number: e.target.value })
                }
              />
            </div>
            <div>
              <label className={label}>Qty Hasil Repair</label>
              <input
                type="number"
                min="1"
                className={`${input} font-mono-data`}
                required
                value={logForm.qty_repaired}
                onChange={(e) =>
                  setLogForm({ ...logForm, qty_repaired: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Tingkat Keparahan Karat</label>
              <select
                className={input}
                value={logForm.severity}
                onChange={(e) =>
                  setLogForm({ ...logForm, severity: e.target.value })
                }
              >
                <option value="ringan">Ringan</option>
                <option value="sedang">Sedang</option>
                <option value="berat">Berat</option>
              </select>
            </div>
            <div>
              <label className={label}>Tindakan Perbaikan</label>
              <select
                className={input}
                value={logForm.action_taken}
                onChange={(e) =>
                  setLogForm({ ...logForm, action_taken: e.target.value })
                }
              >
                <option value="brushing">Brushing</option>
                <option value="coating">Coating</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Catatan</label>
            <textarea
              rows={3}
              className={input}
              value={logForm.notes}
              onChange={(e) =>
                setLogForm({ ...logForm, notes: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3">
            <button
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold disabled:opacity-60"
            >
              {submitting && (
                <Spinner
                  size="sm"
                  className="border-white border-t-transparent"
                />
              )}
              {submitting ? "Menyimpan..." : "Simpan Log"}
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="px-5 py-2.5 rounded-lg border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
