import type { RemediationItem } from './types'

export const REMEDIATION_QUEUE: RemediationItem[] = [
  {
    id: 'AE-2026-01',
    cve: 'AE-2026-01',
    severity: 'critical',
    description: 'Remote Code Execution via Kernel Module',
    target: 'kernel-module-v2.3.1',
  },
  {
    id: 'AE-2026-02',
    cve: 'AE-2026-02',
    severity: 'high',
    description: 'Privilege Escalation in Auth Subsystem',
    target: 'auth-service-v1.7.0',
  },
  {
    id: 'AE-2026-03',
    cve: 'AE-2026-03',
    severity: 'medium',
    description: 'Memory Leak in WebSocket Handler',
    target: 'ws-handler-v3.1.2',
  },
]

export const SEVERITY_STYLES: Record<RemediationItem['severity'], string> = {
  critical: 'text-red-400 border-red-500/30 bg-red-500/10',
  high: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  medium: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
}
