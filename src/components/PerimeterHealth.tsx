import { ShieldCheck, ShieldOff, Lock } from 'lucide-react'
import type { FirewallStatus } from '@/types/aegis'
import { AegisCard } from './ui/AegisCard'
import { CardHeader } from './ui/CardHeader'
import { StatusBadge } from './ui/StatusBadge'

interface Props {
  status: FirewallStatus
}

export default function PerimeterHealth({ status }: Props) {
  const isError = Boolean(status.error)

  return (
    <AegisCard>
      <CardHeader 
        title="Perimeter Health" 
        icon={Lock}
        rightElement={
          <StatusBadge 
            label="Read-Only Auditor" 
            type="default" 
          />
        }
      />

      <div className="flex items-center gap-5 mt-2">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border flex-shrink-0 transition-all ${
          isError
            ? 'border-blue-500/30 bg-blue-500/10'
            : status.enabled
              ? 'border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              : 'border-red-500/30 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
        }`}>
          {isError ? (
            <Lock className="h-6 w-6 text-blue-400" />
          ) : status.enabled ? (
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          ) : (
            <ShieldOff className="h-6 w-6 text-red-400" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <p className={`text-[12px] font-black uppercase tracking-widest ${
              isError ? 'text-blue-400/80 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : status.enabled ? 'text-emerald-400/80' : 'text-red-400/80'
            }`}>
              {isError ? 'Auditor Mode' : status.enabled ? 'PF Firewall Active' : 'PF Firewall Inactive'}
            </p>
            {isError && (
              <StatusBadge label="Restricted" type="blue" size="xs" />
            )}
            {!isError && (
              <StatusBadge 
                label={status.enabled ? 'Enabled' : 'Disabled'} 
                type={status.enabled ? 'emerald' : 'red'} 
                size="xs" 
              />
            )}
          </div>

          <p className="text-[10px] font-mono text-slate-500 truncate uppercase tracking-widest">
            {isError
              ? status.error
              : status.interfaces.length > 0
                ? `Interfaces: ${status.interfaces.join(', ')}`
                : 'pfctl -s info // no write access issued'}
          </p>
        </div>
      </div>
    </AegisCard>
  )
}
