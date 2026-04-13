'use client'

import { memo, useEffect, useRef } from 'react'
import { ShieldAlert, Loader2, ChevronRight } from 'lucide-react'
import { AegisCard } from '@/components/ui/AegisCard'
import { AegisButton } from '@/components/ui/AegisButton'
import { CardHeader } from '@/components/ui/CardHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useRedTeam } from '@/hooks/useAegis'

function RedTeamPanel() {
  const { output, running, commence } = useRedTeam()
  const scrollRef = useRef<HTMLPreElement>(null)

  // Auto-scroll to bottom as output streams in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [output])

  const statusLabel = running ? 'Active' : output ? 'Complete' : 'Standby'
  const statusType  = running ? 'emerald' : 'default'

  return (
    <AegisCard className="flex flex-col min-h-[400px]">
      <CardHeader
        title="Red Team: Probe Sequence"
        icon={ShieldAlert}
        rightElement={
          <StatusBadge
            label={statusLabel}
            type={statusType}
            pulse={running}
          />
        }
      />

      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-[260px]">
          Scout → Attack → Audit. Read-only probes against this edge node.
          No writes, no exploits, no network egress.
        </p>
        <AegisButton
          label={running ? 'Running...' : 'Commence Probe'}
          icon={running ? Loader2 : ChevronRight}
          loading={running}
          disabled={running}
          onClick={commence}
          size="md"
        />
      </div>

      {output && (
        <div className="mt-2 rounded-lg border border-violet-500/30 bg-[#0c1222] shadow-[0_0_25px_-12px_rgba(139,92,246,0.2)] flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-violet-500/10 sticky top-0 bg-[#0c1222] z-10 flex-shrink-0">
            <div className={`h-2 w-2 rounded-full bg-violet-400 ${running ? 'animate-pulse' : ''}`} />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-400">
              RED_TEAM_REPORT
            </span>
          </div>
          <pre
            ref={scrollRef}
            className="px-5 pb-5 pt-3 text-[11px] font-mono font-medium text-slate-300 leading-relaxed whitespace-pre-wrap overflow-y-auto custom-scrollbar max-h-[420px]"
          >
            {output}
            {running && <span className="animate-pulse text-violet-400">▋</span>}
          </pre>
        </div>
      )}
    </AegisCard>
  )
}

export default memo(RedTeamPanel)
