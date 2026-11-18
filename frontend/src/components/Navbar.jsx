import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const MENU_BY_ROLE = {
  pic_area: [
    { to: "/pic/input", label: "Input Barang" },
    { to: "/pic/queue", label: "Antrian Repair" },
  ],
  mp_repair: [{ to: "/mp/tasks", label: "Task Saya" }],
  qc: [{ to: "/qc/approval", label: "Verifikasi QC" }],
  admin: [{ to: "/admin/ready-to-return", label: "Ready to Return" }],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold">Repair Part System</Link>
        {(MENU_BY_ROLE[user.role] || []).map((item) => (
          <Link key={item.to} to={item.to} className="text-sm text-slate-200 hover:text-white">
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span>{user.full_name} ({user.role})</span>
        <button onClick={logout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">
          Logout
        </button>
      </div>
    </nav>
  );
}
