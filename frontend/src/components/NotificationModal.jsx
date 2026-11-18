const VARIANT = {
  error: {
    dot: "bg-red-500",
    label: "SECURITY ALERT • ACCESS RESTRICTION",
    iconBg: "bg-red-600/10 border-red-600/30",
    iconColor: "text-red-500",
    badgeColor: "bg-red-600/15 text-red-400 border-red-600/30",
    primaryBtn: "bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90",
  },
  warning: {
    dot: "bg-amber-500",
    label: "KONFIRMASI TINDAKAN",
    iconBg: "bg-amber-500/10 border-amber-500/30",
    iconColor: "text-amber-400",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    primaryBtn: "bg-gradient-to-r from-amber-600 to-amber-500 hover:opacity-90",
  },
  success: {
    dot: "bg-emerald-500",
    label: "STATUS SISTEM",
    iconBg: "bg-emerald-500/10 border-emerald-500/30",
    iconColor: "text-emerald-400",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    primaryBtn:
      "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:opacity-90",
  },
  info: {
    dot: "bg-blue-500",
    label: "INFORMASI SISTEM",
    iconBg: "bg-blue-500/10 border-blue-500/30",
    iconColor: "text-blue-400",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    primaryBtn: "bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90",
  },
};

const ICONS = {
  error: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-7 w-7"
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
  warning: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-7 w-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4M12 17h.01M10.3 3.9L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
      />
    </svg>
  ),
  success: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-7 w-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  info: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-7 w-7"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16v-4M12 8h.01"
      />
    </svg>
  ),
};

const DEFAULT_PRIMARY = {
  error: "Mengerti",
  warning: "Ya, Lanjutkan",
  success: "Mengerti",
  info: "Mengerti",
};

export default function NotificationModal({
  variant = "info",
  code,
  title,
  message,
  details,
  input,
  inputValue,
  onInputChange,
  primaryLabel,
  cancelLabel,
  secondaryLabel,
  onPrimary,
  onCancel,
  onSecondary,
  onBackdrop,
}) {
  const v = VARIANT[variant] || VARIANT.info;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onBackdrop}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0d0d10] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
          <span className="flex items-center gap-2 text-xs font-mono-data text-slate-400 tracking-wide">
            <span
              className={`h-1.5 w-1.5 rounded-full ${v.dot} animate-pulse`}
            />
            {v.label}
          </span>
          {code && (
            <span className="hidden sm:inline text-xs font-mono-data text-slate-500 border border-white/10 bg-white/5 px-2.5 py-1 rounded-lg">
              SAI-SRV-PPIC01
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="flex gap-4">
            <div
              className={`shrink-0 h-14 w-14 rounded-xl border flex items-center justify-center ${v.iconBg} ${v.iconColor}`}
            >
              {ICONS[variant]}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h2 className="font-bold text-white text-lg">{title}</h2>
                {code && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${v.badgeColor}`}
                  >
                    {code}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {details && details.length > 0 && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/5 text-sm font-mono-data">
              {details.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-slate-500">{d.label}:</span>
                  <span className={v.iconColor}>{d.value}</span>
                </div>
              ))}
            </div>
          )}

          {input && (
            <textarea
              autoFocus
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={input.placeholder}
              rows={3}
              className="mt-5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-red-600 text-sm"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-black/20">
          {cancelLabel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5"
            >
              {cancelLabel}
            </button>
          )}
          {secondaryLabel && (
            <button
              onClick={onSecondary}
              className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            onClick={onPrimary}
            className={`px-5 py-2 rounded-lg text-white text-sm font-bold shadow-lg transition-opacity ${v.primaryBtn}`}
          >
            {primaryLabel || DEFAULT_PRIMARY[variant]}
          </button>
        </div>
      </div>
    </div>
  );
}
