// ── Core hardware metrics ─────────────────────────────────────────
export interface HardwareMetrics {
  cpuUsagePercent: number
  memoryUsedPercent: number
  memoryUsedGB: number
  totalMemoryGB: number
  chipModel: string
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

// ── Firewall status (read-only pfctl audit) ───────────────────────
export interface FirewallStatus {
  enabled: boolean
  interfaces: string[]
  rawOutput: string
  error?: string
}

// ── WAF enforcement event ─────────────────────────────────────────
export interface WafEvent {
  ruleId: string
  label: string
  enabled: boolean
  timestamp: string
}

// ── Vanguard threat feed ──────────────────────────────────────────
export interface VanguardAlert {
  id: string
  type: 'critical' | 'high' | 'medium' | 'info'
  category: 'ip_threat' | 'port_scan' | 'auth_failure' | 'malware' | 'anomaly'
  source_ip?: string
  target?: string
  message: string
  timestamp: string
}

export interface VanguardFeedResult {
  connected: boolean
  alerts: VanguardAlert[]
  error?: string
  fetchedAt: string
}

// ── Kinetic pfctl command (HITL gate) ─────────────────────────────
export interface KineticCommand {
  alertId: string
  command: string
  description: string
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  authorized: boolean
}

