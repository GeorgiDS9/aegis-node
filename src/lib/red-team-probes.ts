import net from 'net'

export type ProbeStatus = 'pass' | 'fail' | 'warn' | 'info'

export interface ProbeResult {
  label:  string
  status: ProbeStatus
  detail: string
}

export function formatProbeResult(r: ProbeResult): string {
  const sym: Record<ProbeStatus, string> = {
    pass: '✓',
    fail: '✗',
    warn: '⚠',
    info: '→',
  }
  return `[PROBE] ${r.label}: ${r.detail} ${sym[r.status]}`
}

// ── WAF rule coverage ─────────────────────────────────────────────
const WAF_RULE_LABELS: Array<{ id: string; label: string }> = [
  { id: 'WAF-SQLi', label: 'SQL Injection filter' },
  { id: 'WAF-XSS',  label: 'XSS vector filter' },
  { id: 'WAF-PATH', label: 'Path traversal filter' },
  { id: 'WAF-BOT',  label: 'Bot signature filter' },
  { id: 'WAF-RATE', label: 'Rate limit (advisory)' },
]

export function probeWafRules(enabledRuleIds: string[]): ProbeResult[] {
  return WAF_RULE_LABELS.map(({ id, label }) => ({
    label,
    status: enabledRuleIds.includes(id) ? 'pass' : 'warn',
    detail: enabledRuleIds.includes(id) ? `${id} enforced` : `${id} disabled`,
  }))
}

// ── Auth boundary HTTP probes ─────────────────────────────────────
type Fetcher = (url: string, init?: RequestInit) => Promise<Response>

const AUTH_ENDPOINTS: Array<{
  path:   string
  method: string
  expect: number[]
  label:  string
}> = [
  { path: '/api/heartbeat', method: 'GET',  expect: [200],      label: 'Heartbeat endpoint' },
  { path: '/api/ai/stream', method: 'GET',  expect: [405, 404], label: 'AI stream (GET guard)' },
  { path: '/console',       method: 'GET',  expect: [200],      label: 'Console page' },
]

export async function probeAuthBoundary(
  baseUrl: string,
  fetcher: Fetcher = fetch,
): Promise<ProbeResult[]> {
  const results: ProbeResult[] = []

  for (const ep of AUTH_ENDPOINTS) {
    try {
      const res = await fetcher(`${baseUrl}${ep.path}`, {
        method: ep.method,
        signal: AbortSignal.timeout(3000),
      })
      const ok = ep.expect.includes(res.status)
      results.push({
        label:  ep.label,
        status: ok ? 'pass' : 'warn',
        detail: `${ep.method} ${ep.path} → ${res.status}`,
      })
    } catch {
      results.push({
        label:  ep.label,
        status: 'warn',
        detail: `${ep.method} ${ep.path} → unreachable`,
      })
    }
  }

  return results
}

// ── Port survey ───────────────────────────────────────────────────
export type Connector = (host: string, port: number) => Promise<boolean>

function defaultConnector(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = net.connect({ host, port, family: 4 })
    sock.setTimeout(1500)
    sock.on('connect', () => { sock.destroy(); resolve(true) })
    sock.on('error',   () => resolve(false))
    sock.on('timeout', () => { sock.destroy(); resolve(false) })
  })
}

export interface PortTarget {
  port:  number
  label: string
}

export async function probePorts(
  targets: PortTarget[],
  connector: Connector = defaultConnector,
): Promise<ProbeResult[]> {
  const results = await Promise.all(
    targets.map(async ({ port, label }): Promise<ProbeResult> => {
      const open = await connector('127.0.0.1', port)
      return {
        label:  `Port ${port} (${label})`,
        status: open ? 'info' : 'pass',
        detail: open ? `OPEN — ${label} listening` : 'CLOSED',
      }
    }),
  )
  return results
}

// ── Sensitive file exposure ───────────────────────────────────────
const FILE_TARGETS: Array<{ path: string; label: string }> = [
  { path: '/.env',         label: '.env file' },
  { path: '/.git/HEAD',    label: '.git directory' },
  { path: '/package.json', label: 'package.json' },
]

export async function probeFileExposure(
  baseUrl: string,
  fetcher: Fetcher = fetch,
): Promise<ProbeResult[]> {
  const results: ProbeResult[] = []

  for (const { path, label } of FILE_TARGETS) {
    try {
      const res = await fetcher(`${baseUrl}${path}`, { signal: AbortSignal.timeout(3000) })
      const exposed = res.status === 200
      results.push({
        label,
        status: exposed ? 'fail' : 'pass',
        detail: exposed ? `EXPOSED at ${path} (${res.status})` : `Not served (${res.status})`,
      })
    } catch {
      results.push({ label, status: 'pass', detail: 'Not reachable' })
    }
  }

  return results
}

// ── Security headers ──────────────────────────────────────────────
const SECURITY_HEADERS = [
  'x-frame-options',
  'x-content-type-options',
  'x-xss-protection',
  'strict-transport-security',
  'content-security-policy',
]

export async function probeSecurityHeaders(
  baseUrl: string,
  fetcher: Fetcher = fetch,
): Promise<ProbeResult[]> {
  try {
    const res = await fetcher(`${baseUrl}/console`, { signal: AbortSignal.timeout(3000) })
    return SECURITY_HEADERS.map((h): ProbeResult => {
      const val = res.headers.get(h)
      return {
        label:  `Header: ${h}`,
        status: val !== null ? 'pass' : 'warn',
        detail: val !== null ? `Present: ${val}` : 'Absent',
      }
    })
  } catch {
    return SECURITY_HEADERS.map((h): ProbeResult => ({
      label:  `Header: ${h}`,
      status: 'warn',
      detail: 'Probe failed',
    }))
  }
}
