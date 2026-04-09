export interface HardwareMetrics {
  cpuUsagePercent: number
  memoryUsedPercent: number
  memoryUsedGB: number
  totalMemoryGB: number
}

export interface RemediationItem {
  id: string
  target: string
  action: string
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM'
}

export interface DefenseLogEntry {
  id: string
  timestamp: string
  type: 'info' | 'warning' | 'success' | 'ai'
  message: string
}

export interface AIQueryResult {
  response?: string
  error?: string
}

export const REMEDIATION_QUEUE: RemediationItem[] = [
  { id: 'AE-2026-01', target: 'Nginx 1.18',   action: 'Patch: CVE-2024-22024', risk: 'CRITICAL' },
  { id: 'AE-2026-02', target: 'OpenSSL 3.0',  action: 'Update: Library v3.1',  risk: 'HIGH'     },
]
