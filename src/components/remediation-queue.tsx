'use client'

import { useState } from 'react'
import { FolderSearch, Cloud, ChevronRight, Loader2, AlertTriangle, Info, ShieldAlert } from 'lucide-react'
import type { ScanAlert, RemediationItem } from '@/types/aegis'
import { useStreamingAI } from '@/hooks/useAegis'

interface Props {
  edgeAlerts: ScanAlert[]
  cloudItems: RemediationItem[]
}

const ALERT_ICON = {
  info:     Info,
  warning:  AlertTriangle,
  critical: ShieldAlert,
} as const

const ALERT_COLOR = {
  info:     'text-slate-400',
  warning:  'text-amber-400',
  critical: 'text-red-400',
} as const

const ALERT_BORDER = {
  info:     'border-slate-700/40',
  warning:  'border-amber-500/20',
  critical: 'border-red-500/20',
} as const

export default function RemediationDualQueue({ edgeAlerts, cloudItems }: Props) {
  const [plans, setPlans] = useState<Record<string, string>>({})
  const [executing, setExecuting] = useState<string | null>(null)
  const { isStreaming, streamQuery } = useStreamingAI()

  const handleExecute = async (alert: ScanAlert) => {
    if (isStreaming) return
    setExecuting(alert.id)
    setPlans((prev) => ({ ...prev, [alert.id]: '' }))

    await streamQuery(
      `[EDGE ALERT]\nFile: ${alert.file}\nType: ${alert.type}\nMessage: ${alert.message}\n\nGenerate a concise remediation plan for this file system drift. Be technical and actionable.`,
      (chunk) =>
        setPlans((prev) => ({ ...prev, [alert.id]: (prev[alert.id] ?? '') + chunk })),
      () => setExecuting(null)
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6">

      {/* ── EDGE QUEUE ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <FolderSearch className="h-4 w-4 text-violet-400" />
            <span className="text-[11px] font-black tracking-widest uppercase text-white">
              Edge Queue
            </span>
            <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-[9px] font-black text-violet-400 tracking-widest">
              [EDGE]
            </span>
          </div>
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            {edgeAlerts.length} Alert{edgeAlerts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
          {edgeAlerts.length === 0 ? (
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center py-8">
              Watch Folder Nominal
            </p>
          ) : (
            edgeAlerts.map((alert) => {
              const Icon = ALERT_ICON[alert.type]
              return (
                <div key={alert.id}>
                  <div className={`flex items-start justify-between rounded-xl border ${ALERT_BORDER[alert.type]} bg-slate-950/40 p-3.5 gap-3`}>
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Icon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${ALERT_COLOR[alert.type]}`} />
                      <div className="min-w-0">
                        <p className={`text-[9px] font-black uppercase tracking-widest ${ALERT_COLOR[alert.type]}`}>
                          {alert.type}
                        </p>
                        <p className="text-xs font-bold text-slate-200 leading-snug mt-0.5">
                          {alert.message}
                        </p>
                        <p className="text-[9px] font-mono text-slate-600 mt-1 truncate">
                          {alert.file.split('/').slice(-3).join('/')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleExecute(alert)}
                      disabled={isStreaming}
                      className="flex-shrink-0 flex items-center gap-1.5 rounded bg-violet-600 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {executing === alert.id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <ChevronRight className="h-3 w-3" />}
                      Fix
                    </button>
                  </div>

                  {plans[alert.id] !== undefined && (
                    <div className="mt-1.5 rounded-xl border border-slate-800/40 bg-slate-950/60 px-4 py-3">
                      <p className="text-[10px] font-mono text-violet-300 leading-relaxed whitespace-pre-wrap">
                        {plans[alert.id] || (executing === alert.id ? '▋' : '—')}
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── CLOUD QUEUE (SHADOW STATE) ──────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-slate-500" />
            <span className="text-[11px] font-black tracking-widest uppercase text-white">
              Cloud Queue
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-700/30 text-[9px] font-black text-slate-500 tracking-widest">
              [CLOUD]
            </span>
          </div>
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            Shadow State
          </span>
        </div>

        <div className="flex flex-col items-center justify-center py-12 px-6 gap-5">
          <div className="h-14 w-14 rounded-full border border-slate-800 flex items-center justify-center">
            <Cloud className="h-6 w-6 text-slate-700" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-[11px] font-black tracking-widest uppercase text-slate-500">
              Awaiting Signals from Vanguard...
            </p>
            <p className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.2em]">
              Cloud feed offline — no upstream connection
            </p>
          </div>

          {/* Ghosted cloud items */}
          <div className="w-full space-y-2 mt-2">
            {cloudItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800/30 bg-slate-950/20 p-3 opacity-30 pointer-events-none"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-slate-500">{item.id}</span>
                  <span className="text-[10px] text-slate-500">{item.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
