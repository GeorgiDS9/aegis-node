interface AegisCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function AegisCard({ children, className = "", noPadding = false }: AegisCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-xl shadow-lg transition-all hover:border-slate-700/60 ${noPadding ? "" : "p-6"} ${className}`}
    >
      {children}
    </div>
  );
}
