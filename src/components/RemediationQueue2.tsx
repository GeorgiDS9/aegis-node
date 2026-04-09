'use client'

import { useState } from 'react'
import { Cpu, Cloud, Loader2 } from 'lucide-react'
import type { ScanAlert, RemediationItem } from '@/types/aegis'
import { useStreamingAI } from '@/hooks/useAegis'

interface Props {
  edgeAlerts: ScanAlert[]
  cloudItems: RemediationItem[]
}

export default function RemediationQueue2({ edgeAlerts, cloudItems }: Props) {
  const [plans, setPlans]         = useState<Record<string, string>>({})
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
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">

      {/* ── LEFT PANEL: EDGE ASSETS (MAC M4) ─────────────────────── */}
      <div className="rounded-2xl border border-violet-500/20 bg-slate-900/30 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between border-b border-slate-800/60 pb-4">
          <div className="flex items-center gap-3">
            <Cpu className="h-4 w-4 text-violet-400" />
            <h3 className="text-xs font-black tracking-widest uppercase text-white">
              Edge: Mac M4
            </h3>
          </div>
          <span className="text-[9px] font-bold text-emerald-500 uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            Local-Only
          </span>
        </div>

        <div className="space-y-3">
          {edgeAlerts.length === 0 ? (
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center py-8">
              Watch Folder Nominal
            </p>
          ) : (
            edgeAlerts.map((alert) => (
              <div key={alert.id}>
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex justify-between items-center group hover:border-violet-500/30 transition-all">
                  <div className="min-w-0 pr-3">
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">
                      {alert.type === 'critical' ? 'FILE_DRIFT_CRITICAL' : alert.type === 'warning' ? 'FILE_DRIFT_WARNING' : 'SYSTEM_NOMINAL'}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5 truncate">
                      {alert.message}
                    </p>
                    <p className="text-[8px] font-mono text-slate-700 mt-0.5 truncate">
                      {alert.file.split('/').slice(-3).join('/')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleExecute(alert)}
                    disabled={isStreaming}
                    className="flex-shrink-0 flex items-center gap-1.5 text-[9px] font-black uppercase text-violet-400 group-hover:text-violet-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {executing === alert.id
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : null}
                    Execute
                  </button>
                </div>

                {plans[alert.id] !== undefined && (
                  <div className="mt-1.5 rounded-lg border border-slate-800/40 bg-slate-950/60 px-4 py-3">
                    <p className="text-[10px] font-mono text-violet-300 leading-relaxed whitespace-pre-wrap">
                      {plans[alert.id] || (executing === alert.id ? '▋' : '—')}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: CLOUD ASSETS (VANGUARD) ─────────────────── */}
      <div className="rounded-2xl border border-blue-500/20 bg-slate-900/30 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between border-b border-slate-800/60 pb-4">
          <div className="flex items-center gap-3">
            <Cloud className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-black tracking-widest uppercase text-white">
              Cloud: Vanguard App
            </h3>
          </div>
          <span className="text-[9px] font-bold text-blue-400 uppercase px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
            Global Asset
          </span>
        </div>

        {cloudItems.length === 0 ? (
          <div className="space-y-3 text-slate-400 text-[10px] italic flex items-center justify-center h-24 border border-dashed border-slate-800 rounded-lg">
            Awaiting signals from Vanguard Orchestrator...
          </div>
        ) : (
          <div className="space-y-3">
            {/* Ghosted cloud items — upstream not yet connected */}
            {cloudItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex justify-between items-center opacity-30 pointer-events-none"
              >
                <div>
                  <p className="text-[10px] font-black text-slate-200">
                    {item.target}
                  </p>
                  <p className="text-[9px] text-slate-500">{item.action}</p>
                </div>
                <span className="text-[9px] font-black uppercase text-slate-500">
                  {item.risk}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-center h-10 border border-dashed border-slate-800 rounded-lg mt-2">
              <p className="text-slate-600 text-[9px] italic">
                Awaiting signals from Vanguard Orchestrator...
              </p>
            </div>
          </div>
        )}
      </div>

    </section>
  )
}
