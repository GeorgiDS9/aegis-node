import type { DefenseLogEntry, VaultSearchResult, ScanAlert, FirewallStatus, HardwareMetrics } from '@/types/aegis'

export function mapOutcomeToType(outcome: string): DefenseLogEntry['type'] {
  if (outcome === 'success' || outcome === 'enforced') return 'success'
  if (outcome === 'suspended' || outcome === 'failed') return 'warning'
  return 'info'
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function mapVaultToLogEntries(logs: VaultSearchResult[]): DefenseLogEntry[] {
  const seen = new Set<string>()
  return logs
    .filter((r) => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    })
    .map((r) => ({
      id:        r.id,
      timestamp: formatRelativeTime(r.timestamp),
      type:      mapOutcomeToType(r.outcome),
      source:    r.source,
      message:   r.action,
    }))
}

export function buildScanContext(
  alerts: ScanAlert[],
  firewall: FirewallStatus,
  metrics: HardwareMetrics,
  vanguardAlertCount: number,
  recentLogs: DefenseLogEntry[],
): string {
  const edgeCritical = alerts.filter((a) => a.type === 'critical').length
  const edgeWarning  = alerts.filter((a) => a.type === 'warning').length
  const fwStatus     = firewall.error
    ? `Auditor mode — ${firewall.error}`
    : firewall.enabled ? 'Active' : 'Inactive'
  const recentActivity = recentLogs
    .slice(0, 3)
    .map((e) => `  - [${e.source ?? 'EDGE'}] ${e.message} (${e.timestamp})`)
    .join('\n') || '  - No recent activity'

  return `SYSTEM CONTEXT:
- CPU: ${metrics.cpuUsagePercent}% utilization
- Memory: ${metrics.memoryUsedGB} / ${metrics.totalMemoryGB} GB (${metrics.memoryUsedPercent}%)
- Firewall: ${fwStatus}
- Edge alerts: ${edgeCritical} critical, ${edgeWarning} warning
- Cloud alerts: ${vanguardAlertCount} active
- Recent vault activity:
${recentActivity}

TASK: Perform a rapid threat surface analysis of this M4 edge node based on the above system context. Summarize findings in 3 extremely concise bullet points. DO NOT include any headers, bold titles, or intros. Start immediately with the first bullet.`
}
