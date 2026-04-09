'use client'

import { useState } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import type { RemediationItem } from '@/types/aegis'
import { useStreamingAI } from '@/hooks/useAegis'

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

    await streamQuery(
      `ID: ${item.id}\nTarget: ${item.target}\nAction: ${item.action}\nRisk: ${item.risk}\nGenerate a step-by-step remediation plan.`,
      (chunk) =>
        setPlans((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? '') + chunk })),
      () => setExecuting(null)
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id}>
          <div className="group flex items-center justify-between rounded-xl border border-slate-800/40 bg-slate-950/40 p-4 transition-all hover:border-violet-500/30">
            <div className="flex items-center gap-6">
              <span className="font-mono text-[10px] text-violet-500">{item.id}</span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-200">{item.target}</span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wide">
                  {item.action}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleExecute(item)}
              disabled={isStreaming}
              className="flex items-center gap-2 rounded bg-violet-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {executing === item.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              Execute
            </button>
          </div>

          {plans[item.id] !== undefined && (
            <div className="mt-2 rounded-xl border border-slate-800/40 bg-slate-950/60 px-4 py-3">
              <p className="text-[10px] font-mono text-violet-300 leading-relaxed whitespace-pre-wrap">
                {plans[item.id] || (executing === item.id ? '▋' : '—')}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
