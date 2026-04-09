// ── Core hardware metrics ─────────────────────────────────────────
export interface HardwareMetrics {
  cpuUsagePercent: number
  memoryUsedPercent: number
  memoryUsedGB: number
  totalMemoryGB: number
}

// ── Static cloud remediation items ───────────────────────────────
export interface RemediationItem {
  id: string
  target: string
  action: string
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM'
}

// ── Defense log entry (Aegis Pulse) ──────────────────────────────
export interface DefenseLogEntry {
  id: string
  timestamp: string
  type: 'info' | 'warning' | 'success' | 'ai'
  source?: 'EDGE' | 'CLOUD'
  message: string
}

// ── AI query result ───────────────────────────────────────────────
export interface AIQueryResult {
  response?: string
  error?: string
}

// ── Edge scanner alert ────────────────────────────────────────────
export interface ScanAlert {
  id: string
  file: string
  type: 'info' | 'warning' | 'critical'
  message: string
  timestamp: string
}

// ── Vault: Remediation Signature (stored in LanceDB) ─────────────
export interface RemediationSignature {
  id: string
  vector: number[]       // Ollama embedding (llama3:8b-instruct-q4_K_M → 4096-dim)
  cve_id: string
  target: string
  action: string
  risk: string
  outcome: string
  source: 'EDGE' | 'CLOUD'
  timestamp: string
}

// ── Vault search result (with similarity score) ───────────────────
export interface VaultSearchResult {
  id: string
  cve_id: string
  target: string
  action: string
  risk: string
  outcome: string
  source: 'EDGE' | 'CLOUD'
  timestamp: string
  score: number
}

// ── Static cloud queue ────────────────────────────────────────────
export const REMEDIATION_QUEUE: RemediationItem[] = [
  { id: 'AE-2026-01', target: 'Nginx 1.18',  action: 'Patch: CVE-2024-22024', risk: 'CRITICAL' },
  { id: 'AE-2026-02', target: 'OpenSSL 3.0', action: 'Update: Library v3.1',  risk: 'HIGH'     },
]
