import { type LucideIcon } from 'lucide-react'

interface AegisButtonProps {
  label: string
  icon?: LucideIcon
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
  className?: string
}

export function AegisButton({ 
  label, 
  icon: Icon, 
  onClick, 
  disabled, 
  loading, 
  variant = 'primary', 
  size = 'sm',
  className = ''
}: AegisButtonProps) {
  const base = "flex-shrink-0 flex items-center justify-center gap-2 rounded font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] disabled:hover:bg-violet-600 disabled:hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-violet-400/20",
    outline: "bg-slate-900/40 border border-slate-700 text-slate-400 hover:border-violet-500/40 hover:text-violet-400 disabled:hover:border-slate-700 disabled:hover:text-slate-400 shadow-sm",
    ghost: "bg-transparent text-slate-500 hover:text-white"
  }

  const sizes = {
    sm: "px-3 py-2 text-[10px]",
    md: "px-4 py-2.5 text-[11px]"
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${loading ? 'animate-spin' : ''}`} />}
      {label}
    </button>
  )
}
