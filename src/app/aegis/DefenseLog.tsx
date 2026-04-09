'use client'

import { useRef } from 'react'
import { Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import type { DefenseLogEntry } from './aegis.types'
import { useDefenseLog, useStreamingAI } from './aegis.hooks'

const INITIAL_ENTRIES: DefenseLogEntry[] = [
  { id: '1', timestamp: '00:00:01', type: 'success', message: 'WAF Rule Update — Layer 7 filter applied' },
  { id: '2', timestamp: '00:00:02', type: 'warning', message: 'Library Isolated — libc.so.6 quarantined' },
  { id: '3', timestamp: '00:00:03', type: 'info',    message: 'Patch Verified — Kernel module signed' },
]

const ICON_MAP = {
  info:    Info,
  warning: AlertTriangle,
  success: CheckCircle,
  ai:      Activity,
} as const

const COLOR_MAP = {
  info:    'text-slate-400',
  warning: 'text-amber-400',
  success: 'text-emerald-400',
  ai:      'text-violet-400',
} as const

export default function DefenseLog() {
  const { entries, addEntry } = useDefenseLog(INITIAL_ENTRIES)
  const { isStreaming, streamQuery } = useStreamingAI()
  const liveRef = useRef('')
  const liveDisplayRef = useRef<HTMLParagraphElement>(null)

  const runThreatScan = async () => {
    if (isStreaming) return
    liveRef.current = ''

    await streamQuery(
      'Perform a rapid threat surface analysis of this M4 edge node. Summarize findings in 3 concise bullet points.',
      (chunk) => {
        liveRef.current += chunk
        if (liveDisplayRef.current) {
          liveDisplayRef.current.textContent = liveRef.current + '▋'
        }
      },
      () => {
        addEntry({ type: 'ai', message: liveRef.current || 'Threat scan complete.' })
        liveRef.current = ''
        if (liveDisplayRef.current) liveDisplayRef.current.textContent = ''
      }
    )
  }

  return (
    <section className="rounded-xl border border-violet-500/20 bg-slate-900/50 overflow-hidden flex flex-col">
      <div className="px-5 py-3 border-b border-violet-500/20 flex items-center gap-2">
        <Activity size={14} className="text-violet-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
          Defense Log
        </span>
        <button
          onClick={runThreatScan}
          disabled={isStreaming}
          className="ml-auto text-xs px-2.5 py-1 rounded border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isStreaming ? 'Scanning…' : 'Scan Threats'}
        </button>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-96">
        {isStreaming && (
          <div className="flex gap-3 text-violet-400">
            <Activity size={13} className="mt-0.5 flex-shrink-0 animate-pulse" />
            <p
              ref={liveDisplayRef}
              className="text-xs font-mono text-violet-300 leading-relaxed whitespace-pre-wrap"
            />
          </div>
        )}

        {entries.map((entry) => {
          const Icon = ICON_MAP[entry.type]
          return (
            <div key={entry.id} className={`flex gap-3 ${COLOR_MAP[entry.type]}`}>
              <Icon size={13} className="mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-mono">{entry.message}</p>
                <p className="text-xs text-slate-600">{entry.timestamp}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
