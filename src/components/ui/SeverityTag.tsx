interface SeverityTagProps {
  level: string
  size?: 'sm' | 'md'
}

export function SeverityTag({ level, size = 'md' }: SeverityTagProps) {
  const norm = level.toLowerCase()
  
  const styles: Record<string, string> = {
    critical: "text-red-400 border-red-500/30 bg-red-500/10",
    high:     "text-orange-400 border-orange-500/30 bg-orange-500/10",
    medium:   "text-amber-400 border-amber-500/30 bg-amber-500/10",
    nominal:  "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    low:      "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    info:     "text-slate-500 border-slate-700/30 bg-slate-700/10",
  }

  const selectedStyle = styles[norm] || styles.info
  const sizeStyle     = size === 'sm' ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-0.5"

  return (
    <span className={`font-black uppercase rounded border tracking-widest ${selectedStyle} ${sizeStyle}`}>
      {level.toUpperCase()}
    </span>
  )
}
