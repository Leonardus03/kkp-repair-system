const VARIANT = {
  success: { border: "border-emerald-500/40", icon: "text-emerald-400" },
  error: { border: "border-red-500/40", icon: "text-red-400" },
};

const ICONS = {
  success: (
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
        d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  error: (
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
        d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11v2M12 16h.01"
      />
    </svg>
  ),
};

export default function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((t) => {
        const v = VARIANT[t.variant] || VARIANT.success;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 bg-[#0d0d10] border ${v.border} rounded-xl px-4 py-3 shadow-xl shadow-black/50`}
          >
            <span className={v.icon}>{ICONS[t.variant]}</span>
            <p className="text-sm text-slate-200 flex-1">{t.message}</p>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
