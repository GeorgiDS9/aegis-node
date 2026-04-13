import { type LucideIcon } from 'lucide-react'

interface StatusBadgeProps {
  label: string
  icon?: LucideIcon
  type?: 'violet' | 'blue' | 'emerald' | 'red' | 'amber' | 'default'
  pulse?: boolean
  size?: 'xs' | 'sm' | 'md'
}

export function StatusBadge({ label, icon: Icon, type = 'violet', pulse = false, size = 'sm' }: StatusBadgeProps) {
  const styles = {
    violet:  'text-violet-400 border-violet-500/30 bg-violet-500/10 shadow-[0_0_10px_rgba(139,92,246,0.1)]',
    blue:    'text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    red:     'text-red-400 border-red-500/20 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
    amber:   'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    default: 'text-slate-500 border-slate-700/60 bg-slate-800/40',
  }

  const sizes = {
    xs: 'text-[8px] px-1.5 py-0.5',
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[10px] px-2.5 py-0.5',
  }

  const currentType = type;

  return (
    <span className={`font-black uppercase rounded border tracking-widest flex items-center gap-1.5 ${styles[currentType]} ${sizes[size]}`}>
      {pulse && <span className={`h-1 w-1 rounded-full animate-pulse ${currentType === 'emerald' ? 'bg-emerald-400' : 'bg-current'}`} />}
      {Icon && <Icon className={size === 'xs' ? "h-2 w-2" : "h-2.5 w-2.5"} />}
      {label}
    </span>
  )
}
