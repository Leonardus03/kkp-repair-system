import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const MENU_BY_ROLE = {
  pic_area: [
    { to: "/", label: "Dashboard" },
    { to: "/pic/input", label: "Input Barang" },
    { to: "/pic/queue", label: "Antrian" },
    { to: "/pic/supply", label: "Supply ke Line" },
  ],
  mp_repair: [
    { to: "/", label: "Dashboard" },
    { to: "/mp/tasks", label: "Task Saya" },
  ],
  qc: [
    { to: "/", label: "Dashboard" },
    { to: "/qc/approval", label: "Verifikasi" },
  ],
  admin: [
    { to: "/", label: "Dashboard" },
    { to: "/admin/ready-to-return", label: "Ready to Return" },
  ],
  section_head: [
    { to: "/", label: "Dashboard" },
    { to: "/sectionhead/report", label: "Shift" },
    { to: "/pic/queue", label: "Antrian" },
    { to: "/leader/report", label: "Laporan Lengkap" },
  ],
  leader: [
    { to: "/", label: "Dashboard" },
    { to: "/leader/report", label: "Laporan Lengkap" },
  ],
};

export default function TabNav() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;
  const menu = MENU_BY_ROLE[user.role] || [];

  return (
    <aside className="hidden md:block w-56 shrink-0 border-r border-white/10 bg-[#0b0f1a] px-3 py-4">
      <p className="px-3 mb-2 text-[11px] uppercase tracking-widest text-slate-500">Menu</p>
      <nav className="flex flex-col gap-1">
        {menu.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`block w-full px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                active
                  ? "bg-red-600 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}