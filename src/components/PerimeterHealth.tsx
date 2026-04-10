import { ShieldCheck, ShieldOff, Lock } from 'lucide-react'
import type { FirewallStatus } from '@/types/aegis'

interface Props {
  status: FirewallStatus
}

export default function PerimeterHealth({ status }: Props) {
  const isError = Boolean(status.error)

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Lock className="h-4 w-4 text-violet-400" />
          <span className="text-[11px] font-black tracking-widest uppercase text-white">
            Perimeter Health
          </span>
        </div>
        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
          isError
            ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
            : 'text-slate-500 border-slate-700/60 bg-slate-800/40'
        }`}>
          Read-Only Auditor
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border flex-shrink-0 ${
          isError
            ? 'border-blue-500/30 bg-blue-500/10'
            : status.enabled
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : 'border-red-500/30 bg-red-500/10'
        }`}>
          {isError ? (
            <Lock className="h-5 w-5 text-blue-400" />
          ) : status.enabled ? (
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          ) : (
            <ShieldOff className="h-5 w-5 text-red-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-sm font-black uppercase tracking-widest ${
              isError ? 'text-blue-400' : status.enabled ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {isError ? 'Auditor Mode' : status.enabled ? 'PF Firewall Active' : 'PF Firewall Inactive'}
            </p>
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
              isError
                ? 'text-blue-500 bg-blue-500/10'
                : status.enabled
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : 'text-red-500 bg-red-500/10'
            }`}>
              {isError ? 'RESTRICTED' : status.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>

          <p className="text-[9px] font-mono text-slate-600 truncate">
            {isError
              ? status.error
              : status.interfaces.length > 0
                ? `Interfaces: ${status.interfaces.join(', ')}`
                : 'pfctl -s info — no write access issued'}
          </p>
        </div>
      </div>
    </div>
  )
}
