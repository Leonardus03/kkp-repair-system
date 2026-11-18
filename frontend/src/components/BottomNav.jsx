import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const MENU_BY_ROLE = {
  pic_area: [
    { to: "/", label: "Monitor" },
    { to: "/pic/input", label: "Input" },
    { to: "/pic/queue", label: "Antrian" },
    { to: "/pic/supply", label: "Supply" },
  ],
  mp_repair: [
    { to: "/", label: "Monitor" },
    { to: "/mp/tasks", label: "Task" },
  ],
  qc: [
    { to: "/", label: "Monitor" },
    { to: "/qc/approval", label: "Verifikasi" },
  ],
  admin: [
    { to: "/", label: "Monitor" },
    { to: "/admin/ready-to-return", label: "Return" },
  ],
  section_head: [
    { to: "/", label: "Monitor" },
    { to: "/sectionhead/report", label: "Laporan" },
    { to: "/pic/queue", label: "Antrian" },
    { to: "/leader/report", label: "Lengkap" },
  ],
  leader: [
    { to: "/", label: "Monitor" },
    { to: "/leader/report", label: "Laporan" },
  ],
};

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;
  const menu = MENU_BY_ROLE[user.role] || [];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#0b0f1a] border-t border-white/10 flex">
      {menu.map((item) => {
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex-1 py-3 text-center text-xs font-bold ${active ? "text-red-500" : "text-slate-500"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
