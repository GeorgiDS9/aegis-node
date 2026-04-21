interface SourceLabelProps {
  source: "EDGE" | "CLOUD";
}

export function SourceLabel({ source }: SourceLabelProps) {
  const isEdge = source === "EDGE";
  const styles = isEdge
    ? "text-violet-400 bg-violet-500/20 shadow-[0_0_4px_rgba(139,92,246,0.25)]"
    : "text-blue-400 bg-blue-500/20 shadow-[0_0_4px_rgba(59,130,246,0.25)]";

  return (
    <span
      className={`flex-shrink-0 text-[9px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded transition-all ${styles}`}
    >
      [{source}]
    </span>
  );
}
