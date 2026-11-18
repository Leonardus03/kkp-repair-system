import { useState } from "react";
import api from "../../api/client.js";
import Spinner from "../../components/Spinner.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const input =
  "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-red-600";
const label = "block text-sm text-slate-300 mb-1.5";

const EMPTY = {
  part_code: "",
  part_name: "",
  lot_number: "",
  origin_location: "",
  qty_input: 1,
  operator_name: "",
  operator_line: "",
};

export default function InputForm() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/parts", form);
      showToast(
        "success",
        "Part berhasil diinput dengan status Waiting for Repair",
      );
      setForm(EMPTY);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Gagal input part");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-[#131b2e] border border-white/10 rounded-2xl p-5 space-y-4"
      >
        <h2 className="font-industrial font-bold tracking-wide text-white">
          INPUT BARANG MASUK REPAIR
        </h2>

        <div className="rounded-xl border border-red-600/30 bg-red-600/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-red-400">
            Wajib diisi — siapa yang piket
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Nama Kamu</label>
              <input
                className={input}
                placeholder="Nama lengkap"
                required
                value={form.operator_name}
                onChange={(e) =>
                  setForm({ ...form, operator_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className={label}>Line yang Dipegang</label>
              <input
                className={input}
                placeholder="Misal: Line 1"
                required
                value={form.operator_line}
                onChange={(e) =>
                  setForm({ ...form, operator_line: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div>
          <label className={label}>Part Number / Barcode</label>
          <input
            className={`${input} font-mono-data`}
            placeholder="Scan atau ketik part number"
            required
            value={form.part_code}
            onChange={(e) => setForm({ ...form, part_code: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Part Name</label>
          <input
            className={input}
            required
            value={form.part_name}
            onChange={(e) => setForm({ ...form, part_name: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Nomor Lot</label>
          <input
            className={`${input} font-mono-data`}
            placeholder="Nomor Lot sesuai label part"
            required
            value={form.lot_number}
            onChange={(e) => setForm({ ...form, lot_number: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Lokasi Asal</label>
            <input
              className={input}
              required
              value={form.origin_location}
              onChange={(e) =>
                setForm({ ...form, origin_location: e.target.value })
              }
            />
          </div>
          <div>
            <label className={label}>Qty Unit Dikirim</label>
            <input
              type="number"
              min="1"
              className={`${input} font-mono-data`}
              required
              value={form.qty_input}
              onChange={(e) => setForm({ ...form, qty_input: e.target.value })}
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 py-3 font-bold text-white shadow-lg shadow-red-900/40 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && (
            <Spinner size="sm" className="border-white border-t-transparent" />
          )}
          {loading ? "Menyimpan..." : "SIMPAN (WAITING FOR REPAIR)"}
        </button>
      </form>
    </div>
  );
}
