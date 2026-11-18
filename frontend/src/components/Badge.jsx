const COLORS = {
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
  slate: "bg-white/5 text-slate-300 border-white/10",
};

export default function Badge({ children, color = "slate", className = "" }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-mono-data font-semibold ${COLORS[color]} ${className}`}
    >
      {children}
    </span>
  );
}
