'use client'

import { useState } from 'react'
import { ChevronRight, Loader2, Terminal } from 'lucide-react'
import type { RemediationItem } from './types'
import { SEVERITY_STYLES } from './constants'
import { useStreamingAI } from './hooks'

interface Props {
  items: RemediationItem[]
}

export default function RemediationQueue({ items }: Props) {
  const [plans, setPlans] = useState<Record<string, string>>({})
  const [executing, setExecuting] = useState<string | null>(null)
  const { isStreaming, streamQuery } = useStreamingAI()

  const handleExecute = async (item: RemediationItem) => {
    if (isStreaming) return
    setExecuting(item.id)
    setPlans((prev) => ({ ...prev, [item.id]: '' }))

    const prompt = [
      `CVE: ${item.cve}`,
      `Target: ${item.target}`,
      `Description: ${item.description}`,
      '',
      'Generate a concise step-by-step remediation plan. Be technical and actionable.',
    ].join('\n')

    await streamQuery(
      prompt,
      (chunk) =>
        setPlans((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? '') + chunk })),
      () => setExecuting(null)
    )
  }

  return (
    <section className="rounded-xl border border-violet-500/20 bg-slate-900/50 overflow-hidden">
      <div className="px-5 py-3 border-b border-violet-500/20 flex items-center gap-2">
        <Terminal size={14} className="text-violet-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
          Remediation Queue
        </span>
        <span className="ml-auto text-xs text-slate-500">{items.length} PENDING</span>
      </div>

      <div className="divide-y divide-slate-800/60">
        {items.map((item) => (
          <div key={item.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded border font-mono ${SEVERITY_STYLES[item.severity]}`}
                  >
                    {item.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{item.cve}</span>
                </div>
                <p className="text-sm text-slate-200">{item.description}</p>
                <p className="text-xs text-slate-500 font-mono">target: {item.target}</p>
              </div>

              <button
                onClick={() => handleExecute(item)}
                disabled={isStreaming}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-violet-500/40 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {executing === item.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ChevronRight size={12} />
                )}
                Execute
              </button>
            </div>

            {plans[item.id] !== undefined && (
              <div className="rounded-lg bg-slate-950/80 border border-slate-700/40 p-3">
                <p className="text-xs font-mono text-violet-300 leading-relaxed whitespace-pre-wrap">
                  {plans[item.id] || (executing === item.id ? '▋' : '—')}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
