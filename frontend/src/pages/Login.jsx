import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import Spinner from "../components/Spinner.jsx";

// Ganti ke "/adw-logo.png" kalau mau pakai logo PT Summit Adyawinsa
const LOGO_SRC = "/ppic-logo.jpg";

export default function Login() {
  const [username, setUsername] = useState(() => localStorage.getItem("remembered_username") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("remembered_username"));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [latency] = useState(() => Math.floor(Math.random() * 20) + 6);
  const { login } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      if (rememberMe) localStorage.setItem("remembered_username", username);
      else localStorage.removeItem("remembered_username");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  function handleHelp() {
    notify({
      variant: "error",
      code: "403 FORBIDDEN",
      title: "Akses Sistem Dibatasi",
      message: (
        <>
          Akun Anda belum memiliki izin hak akses untuk modul ini. Silakan hubungi <b>admin sistem PPIC</b> untuk
          bantuan otorisasi akses kerja Anda.
        </>
      ),
      details: [
        { label: "Departemen", value: "PPIC • PT Summit Adyawinsa Indonesia" },
        { label: "Kontak Helpdesk", value: "admin.ppic@summit-adw.co.id" },
        { label: "Ext. Internal Plant", value: "Ext. 2404 (Ruang PPIC Karawang)" },
      ],
      secondaryLabel: "Kirim Tiket Akses",
      onSecondary: () =>
        (window.location.href = "mailto:admin.ppic@summit-adw.co.id?subject=Permintaan Akses Sistem PPIC"),
    });
  }

  return (
    <div className="relative min-h-screen bg-[#08090d] flex flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `repeating-linear-gradient(115deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 2px, transparent 2px, transparent 140px)`,
        }}
      />
      <div className="pointer-events-none absolute top-0 left-1/4 h-full w-96 bg-red-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-2/3 w-96 bg-red-900/20 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono-data font-semibold px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM ONLINE
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline text-slate-400 tracking-wide">
            PT SUMMIT ADYAWINSA INDONESIA • PPIC DIVISION
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-slate-400 font-mono-data">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-red-500">
              <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" />
            </svg>
            IATF 16949 / ISO 9001
          </span>
          <span>•</span>
          <span>Shift 1 • Active</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-[#0d0d10]/90 backdrop-blur-md border border-red-600/30 rounded-2xl p-8 shadow-2xl shadow-black/60"
        >
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full border border-red-600/40 bg-black flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.35)] overflow-hidden">
              <img src={LOGO_SRC} alt="Logo" className="h-full w-full rounded-full object-cover" />
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 border border-red-600/40 bg-red-600/10 px-3 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              PPIC REPAIR CONTROL SYSTEM
            </span>
            <div className="text-center">
              <h1 className="font-industrial text-2xl font-bold text-white">Sistem Repair Part Karat</h1>
              <p className="text-slate-300 text-sm mt-1">PT Summit Adyawinsa Indonesia</p>
              <p className="text-slate-500 text-xs">Automotive Stamping &amp; Welding Division</p>
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-md border border-red-600/40 bg-red-950/40 px-3 py-2 text-center text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Nomor Pokok Karyawan (NPK) / Username</label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
                <input
                  className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-3 py-2.5 text-white placeholder:text-slate-500 outline-none transition-colors focus:border-red-600"
                  placeholder="Masukkan NPK atau Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Password Sistem</label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-10 py-2.5 text-white placeholder:text-slate-500 outline-none transition-colors focus:border-red-600"
                  placeholder="Masukkan Kata Sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 5.5A9.5 9.5 0 0112 5c5 0 9 4 10 7-.4 1.2-1.2 2.5-2.3 3.7M6.5 6.6C4.4 8 3 10 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 mb-6 text-sm">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/40 accent-red-600"
              />
              Ingat NPK saya
            </label>
            <button type="button" onClick={handleHelp} className="text-red-500 hover:text-red-400">
              Bantuan Akses?
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 py-3 font-bold text-white shadow-lg shadow-red-900/40 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="border-white border-t-transparent" />
                Memproses...
              </>
            ) : (
              <>
                MASUK KE SISTEM
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>

          <div className="mt-6 pt-4 border-t border-white/10 text-center space-y-2">
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-mono-data">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Server: SAI-SRV-PPIC01 • Latency {latency}ms
            </p>
            <p className="text-xs text-slate-600">
              Akses terbatas hanya untuk personel otorisasi PPIC &amp; Quality Control Karawang Plant.
            </p>
          </div>
        </form>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6 py-4 border-t border-white/10 text-xs text-slate-500">
        <p>
          © 2025 <span className="text-slate-300 font-semibold">PT Summit Adyawinsa Indonesia</span>. Hak Cipta Dilindungi.
        </p>
        <p className="font-mono-data">
          ISO 14001 • OHSAS 18001 • <span className="text-red-500 font-semibold">PPIC Smart System v2.4</span>
        </p>
      </div>
    </div>
  );
}