import { memo } from 'react'
import { twMerge } from 'tailwind-merge'

interface SystemLabelProps {
  children: React.ReactNode
  type?: 'metadata' | 'empty-header'
  className?: string
}

function SystemLabel({ children, type = 'metadata', className = '' }: SystemLabelProps) {
  const styles = {
    metadata:     'text-[10px] font-mono text-slate-600',
    'empty-header': 'text-[11px] font-black text-slate-600',
  }

  return (
    <p className={twMerge(styles[type], 'uppercase tracking-widest leading-relaxed', className)}>
      {children}
    </p>
  )
}

export default memo(SystemLabel)
