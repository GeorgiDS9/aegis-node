import { Shield, Activity, Zap } from 'lucide-react'
import { getHardwareMetrics } from '@/app/actions/metrics'
import RemediationQueue from './RemediationQueue'
import DefenseLog from './DefenseLog'
import { REMEDIATION_QUEUE } from './aegis.constants'
import type { HardwareMetrics } from './aegis.types'

export const dynamic = 'force-dynamic'

export default async function AegisPage() {
  const metrics = await getHardwareMetrics()

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono">
      <header className="sticky top-0 z-50 border-b border-violet-500/20 bg-[#020617]/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-violet-500" size={20} />
          <span className="text-sm font-semibold tracking-widest text-violet-400 uppercase">
            Aegis Node — Defense Console
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
          ACTIVE DEFENSE
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            icon={<Shield size={15} className="text-violet-400" />}
            label="Shield Integrity"
            value={`${metrics.cpuUsagePercent}%`}
            sub="CPU Utilization"
            percent={metrics.cpuUsagePercent}
            status={metrics.cpuUsagePercent < 70 ? 'nominal' : 'elevated'}
          />
          <MetricCard
            icon={<Activity size={15} className="text-violet-400" />}
            label="Adaptive Response"
            value={`${metrics.memoryUsedGB} / ${metrics.totalMemoryGB} GB`}
            sub="Unified Memory"
            percent={metrics.memoryUsedPercent}
            status={metrics.memoryUsedPercent < 80 ? 'nominal' : 'elevated'}
          />
          <MetricCard
            icon={<Zap size={15} className="text-violet-400" />}
            label="Threat Surface"
            value={`${REMEDIATION_QUEUE.length} ACTIVE`}
            sub="Remediation Queue"
            percent={100}
            status="critical"
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7">
            <RemediationQueue items={REMEDIATION_QUEUE} />
          </div>
          <div className="col-span-5">
            <DefenseLog />
          </div>
        </div>
      </div>
    </main>
  )
}

type Status = 'nominal' | 'elevated' | 'critical'

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  percent: number
  status: Status
}

const STATUS_BAR: Record<Status, string> = {
  nominal:  'bg-violet-500',
  elevated: 'bg-amber-500',
  critical: 'bg-red-500',
}

const STATUS_BADGE: Record<Status, string> = {
  nominal:  'text-violet-400 bg-violet-500/10',
  elevated: 'text-amber-400 bg-amber-500/10',
  critical: 'text-red-400 bg-red-500/10',
}

function MetricCard({ icon, label, value, sub, percent, status }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-violet-500/20 bg-slate-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider">
          {icon}
          {label}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[status]}`}>
          {status.toUpperCase()}
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-100 tabular-nums">{value}</div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{sub}</span>
          <span>{percent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${STATUS_BAR[status]}`}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
