'use client'

import { useRef, memo } from 'react'
import { Terminal } from 'lucide-react'
import type { DefenseLogEntry } from '@/types/aegis'
import { useDefenseLog, useStreamingAI } from '@/hooks/useAegis'

const INITIAL_ENTRIES: DefenseLogEntry[] = [
  { id: '1', timestamp: '2 min ago',  type: 'success', source: 'EDGE',  message: 'WAF Rule Update' },
  { id: '2', timestamp: '14 min ago', type: 'warning', source: 'EDGE',  message: 'Library Isolated' },
  { id: '3', timestamp: '1 hour ago', type: 'info',    source: 'CLOUD', message: 'Patch Verified'   },
]

const SOURCE_TAG: Record<'EDGE' | 'CLOUD', string> = {
  EDGE:  'text-violet-400 bg-violet-500/10',
  CLOUD: 'text-blue-400 bg-blue-500/10',
}

function DefenseLog() {
  const { entries, addEntry } = useDefenseLog(INITIAL_ENTRIES)
  const { isStreaming, streamQuery } = useStreamingAI()
  const liveRef        = useRef('')
  const liveDisplayRef = useRef<HTMLParagraphElement>(null)

  const runThreatScan = async () => {
    if (isStreaming) return
    liveRef.current = ''

    await streamQuery(
      'Perform a rapid threat surface analysis of this M4 edge node. Summarize findings in 3 bullet points.',
      (chunk) => {
        liveRef.current += chunk
        if (liveDisplayRef.current) {
          liveDisplayRef.current.textContent = liveRef.current + '▋'
        }
      },
      () => {
        addEntry({ type: 'ai', source: 'EDGE', message: liveRef.current || 'Threat scan complete.' })
        liveRef.current = ''
        if (liveDisplayRef.current) liveDisplayRef.current.textContent = ''
      }
    )
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-8 lg:sticky lg:top-24">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-violet-400" />
          <h2 className="text-[12px] font-black tracking-widest uppercase text-white">
            Aegis Pulse
          </h2>
        </div>
        <button
          onClick={runThreatScan}
          disabled={isStreaming}
          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isStreaming ? 'Scanning…' : 'Scan Threats'}
        </button>
      </div>

      <div className="space-y-6 relative">
        <div className="absolute left-2.5 top-2 h-[90%] w-px border-l border-dashed border-slate-800/60" />

        {isStreaming && (
          <div className="relative pl-9">
            <div className="absolute left-[-2px] top-1 h-5 w-5 rounded-full border border-violet-500/50 bg-[#020617] flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[11px] font-black tracking-widest text-violet-300 uppercase">
                AI Threat Analysis
              </p>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded text-violet-400 bg-violet-500/10">
                [EDGE]
              </span>
            </div>
            <p
              ref={liveDisplayRef}
              className="text-[9px] font-mono text-violet-400 mt-0.5 normal-case tracking-normal leading-relaxed"
            />
          </div>
        )}

        {entries.map((entry) => (
          <div key={entry.id} className="relative pl-9 group">
            <div className="absolute left-[-2px] top-1 h-5 w-5 rounded-full border border-slate-700 bg-[#020617] flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            </div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[11px] font-black tracking-widest text-slate-200 uppercase">
                {entry.message}
              </p>
              {entry.source && (
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${SOURCE_TAG[entry.source]}`}>
                  [{entry.source}]
                </span>
              )}
            </div>
            <p className="text-[9px] font-bold text-slate-600 uppercase">
              {entry.timestamp}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(DefenseLog)
