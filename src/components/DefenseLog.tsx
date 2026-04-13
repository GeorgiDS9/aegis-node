import { useRef, memo } from 'react'
import { Terminal, Loader2, Zap } from 'lucide-react'
import type { DefenseLogEntry, VaultSearchResult, ScanAlert, FirewallStatus, HardwareMetrics } from '@/types/aegis'
import { mapVaultToLogEntries, buildScanContext } from './DefenseLog.utils'
import { useDefenseLog, useStreamingAI } from '@/hooks/useAegis'
import { AegisCard } from './ui/AegisCard'
import { CardHeader } from './ui/CardHeader'
import { AegisButton } from './ui/AegisButton'
import { SourceLabel } from './ui/SourceLabel'
import SystemLabel from './ui/SystemLabel'

interface Props {
  initialLogs: VaultSearchResult[]
  alerts: ScanAlert[]
  firewall: FirewallStatus
  metrics: HardwareMetrics
  vanguardAlertCount: number
}

function DefenseLog({ initialLogs, alerts, firewall, metrics, vanguardAlertCount }: Props) {
  const { entries, addEntry } = useDefenseLog(mapVaultToLogEntries(initialLogs))
  const { streamingIds, streamQuery } = useStreamingAI()
  const liveRef        = useRef<string>('')
  const liveDisplayRef = useRef<HTMLParagraphElement>(null)

  const isScanning = streamingIds.has('PULSE-SCAN')

  const runThreatScan = async () => {
    if (isScanning) return
    liveRef.current = ''

    const prompt = buildScanContext(alerts, firewall, metrics, vanguardAlertCount, entries)

    await streamQuery(
      'PULSE-SCAN',
      prompt,
      (chunk) => {
        liveRef.current += chunk
        if (liveDisplayRef.current) {
          liveDisplayRef.current.textContent = liveRef.current + '▋'
        }
      },
      () => {
        addEntry({ type: 'ai', source: 'EDGE', message: liveRef.current || 'Threat scan complete.' })
        if (liveDisplayRef.current) liveDisplayRef.current.textContent = ''
      }
    )
  }

  return (
    <AegisCard>
      <CardHeader
        title="Aegis Pulse"
        icon={Terminal}
        rightElement={
          <AegisButton
            label={isScanning ? "Scanning..." : "Scan Threats"}
            icon={isScanning ? Loader2 : Zap}
            loading={isScanning}
            variant="outline"
            size="sm"
            onClick={runThreatScan}
          />
        }
      />

      <div className="space-y-6 relative h-[250px] overflow-y-auto custom-scrollbar pr-2 pt-4">
        <div className="absolute left-2.5 top-2 h-[90%] w-px border-l border-dashed border-slate-800/60" />

        {isScanning && (
          <div className="relative pl-9">
            <div className="absolute left-[-2px] top-1 h-5 w-5 rounded-full border border-violet-500/50 bg-[#020617] flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[11px] font-black tracking-widest text-slate-300 uppercase">
                AI_THREAT_SCANNING...
              </p>
              <SourceLabel source="EDGE" />
            </div>
            <p
              ref={liveDisplayRef}
              className="text-[11px] font-mono text-slate-300 mt-0.5 leading-relaxed whitespace-pre-wrap"
            />
          </div>
        )}

        {entries.length === 0 && !isScanning && (
          <div className="relative pl-9">
            <SystemLabel>
              No vault activity yet — run a scan or deploy a remediation.
            </SystemLabel>
          </div>
        )}

        {entries.map((entry) => (
          <div key={entry.id} className="relative pl-9 group">
            <div className={`absolute left-[-2px] top-1 h-5 w-5 rounded-full border flex items-center justify-center ${
              entry.type === 'ai' ? 'border-violet-500/50 bg-[#020617]' : 'border-slate-700 bg-[#020617]'
            }`}>
              <div className={`h-1.5 w-1.5 rounded-full ${entry.type === 'ai' ? 'bg-violet-400' : 'bg-violet-500'}`} />
            </div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className={`text-[11px] font-black tracking-widest uppercase truncate ${
                entry.type === 'ai' ? 'text-slate-300' : 'text-slate-200'
              }`}>
                {entry.type === 'ai' ? 'THREAT_ANALYSIS_REPORT' : entry.message}
              </p>
              {entry.source && <SourceLabel source={entry.source} />}
            </div>
            {entry.type === 'ai' && (
              <p className="text-[11px] font-mono text-slate-300 mt-1 mb-2 leading-relaxed whitespace-pre-wrap">
                {entry.message}
              </p>
            )}
            <p className="text-[9px] font-bold text-slate-600 uppercase">
              {entry.timestamp}
            </p>
          </div>
        ))}
      </div>
    </AegisCard>
  )
}

export default memo(DefenseLog)
