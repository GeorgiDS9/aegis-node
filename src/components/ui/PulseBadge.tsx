interface PulseBadgeProps {
  status: "nominal" | "elevated" | "critical";
}

export function PulseBadge({ status }: PulseBadgeProps) {
  const styles = {
    nominal: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
    elevated: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
    critical: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
  };

  return (
    <div className="flex items-center gap-2 group cursor-default">
      <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${styles[status]}`} />
      <span
        className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
          status === "nominal"
            ? "text-emerald-500/80 group-hover:text-emerald-400"
            : status === "elevated"
              ? "text-amber-500/80 group-hover:text-amber-400"
              : "text-red-500/80 group-hover:text-red-400"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
