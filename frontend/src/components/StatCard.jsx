const THEME = {
  amber: {
    text: "text-amber-400",
    bar: "bg-amber-500",
    border: "border-amber-500/20",
  },
  blue: {
    text: "text-blue-400",
    bar: "bg-blue-500",
    border: "border-blue-500/20",
  },
  emerald: {
    text: "text-emerald-400",
    bar: "bg-emerald-500",
    border: "border-emerald-500/20",
  },
};

export default function StatCard({ value, max, label, color }) {
  const t = THEME[color];
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 6 : 0) : 0;
  return (
    <div
      className={`bg-[#131b2e] border ${t.border} rounded-xl p-5 text-center`}
    >
      <p className={`text-3xl font-bold font-mono-data ${t.text}`}>{value}</p>
      <div className="h-1.5 bg-white/5 rounded-full mt-3 mb-3 overflow-hidden">
        <div
          className={`h-full ${t.bar} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
