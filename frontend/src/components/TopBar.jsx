import { useAuth } from "../context/AuthContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";

export default function TopBar() {
  const { user, logout } = useAuth();
  const { notify } = useNotification();
  if (!user) return null;

  async function handleLogout() {
    const confirmed = await notify({
      variant: "warning",
      code: "KONFIRMASI",
      title: "Keluar dari Sistem?",
      message:
        "Kamu akan logout dari akun ini. Pastikan semua data yang kamu input sudah tersimpan.",
      primaryLabel: "Ya, Logout",
      cancelLabel: "Batal",
    });
    if (confirmed) logout();
  }

  return (
    <header className="bg-[#0b0f1a] border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-red-600 flex items-center justify-center text-white font-industrial font-bold text-sm shadow-lg shadow-red-900/40">
          RP
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-industrial font-bold text-white tracking-wide">
              REPAIR<span className="text-red-600">PART</span>
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500">Plant Floor Monitoring</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="font-bold text-white text-sm">{user.full_name}</p>
          <p className="text-xs text-red-500 font-mono-data">{user.role}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="h-10 w-10 rounded-full border border-red-600/50 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
