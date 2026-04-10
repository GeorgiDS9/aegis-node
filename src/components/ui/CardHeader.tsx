import { type LucideIcon } from 'lucide-react'

interface CardHeaderProps {
  title: string
  icon?: LucideIcon
  iconColor?: string
  rightElement?: React.ReactNode
}

export function CardHeader({ title, icon: Icon, iconColor = 'text-violet-400', rightElement }: CardHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between border-b border-slate-800/60 pb-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
        <h3 className="text-[13px] font-black tracking-[0.15em] uppercase text-white">
          {title}
        </h3>
      </div>
      {rightElement}
    </div>
  )
}
