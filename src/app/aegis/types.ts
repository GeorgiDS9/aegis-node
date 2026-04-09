export interface HardwareMetrics {
  cpuUsagePercent: number
  memoryUsedPercent: number
  memoryUsedGB: number
  totalMemoryGB: number
}

export interface RemediationItem {
  id: string
  cve: string
  severity: 'critical' | 'high' | 'medium'
  description: string
  target: string
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
