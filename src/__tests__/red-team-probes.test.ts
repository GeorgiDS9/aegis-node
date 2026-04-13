import { describe, it, expect, vi } from 'vitest'
import {
  probeWafRules,
  probeAuthBoundary,
  probePorts,
  probeFileExposure,
  probeSecurityHeaders,
  formatProbeResult,
  type ProbeResult,
} from '@/lib/red-team-probes'

// ── Helpers ───────────────────────────────────────────────────────
function makeResponse(status: number, headers: Record<string, string> = {}): Response {
  return new Response(null, { status, headers })
}

// ── formatProbeResult ─────────────────────────────────────────────
describe('formatProbeResult', () => {
  it('formats pass with ✓', () => {
    const r: ProbeResult = { label: 'WAF-SQLi', status: 'pass', detail: 'enforced' }
    expect(formatProbeResult(r)).toBe('[SCOUT] WAF-SQLi: enforced ✓')
  })

  it('formats fail with ✗', () => {
    const r: ProbeResult = { label: '.env file', status: 'fail', detail: 'EXPOSED' }
    expect(formatProbeResult(r)).toBe('[SCOUT] .env file: EXPOSED ✗')
  })

  it('formats warn with ⚠', () => {
    const r: ProbeResult = { label: 'WAF-RATE', status: 'warn', detail: 'disabled' }
    expect(formatProbeResult(r)).toBe('[SCOUT] WAF-RATE: disabled ⚠')
  })

  it('formats info with →', () => {
    const r: ProbeResult = { label: 'Port 3000 (App)', status: 'info', detail: 'OPEN' }
    expect(formatProbeResult(r)).toBe('[SCOUT] Port 3000 (App): OPEN →')
  })
})

// ── probeWafRules ─────────────────────────────────────────────────
describe('probeWafRules', () => {
  it('always returns 5 results (one per rule)', () => {
    expect(probeWafRules([])).toHaveLength(5)
    expect(probeWafRules(['WAF-SQLi', 'WAF-XSS'])).toHaveLength(5)
  })

  it('marks all rules as warn when nothing is enabled', () => {
    const results = probeWafRules([])
    expect(results.every((r) => r.status === 'warn')).toBe(true)
  })

  it('marks enabled rules as pass', () => {
    const results = probeWafRules(['WAF-SQLi', 'WAF-PATH'])
    const sqli = results.find((r) => r.detail.includes('WAF-SQLi'))!
    const path = results.find((r) => r.detail.includes('WAF-PATH'))!
    expect(sqli.status).toBe('pass')
    expect(path.status).toBe('pass')
  })

  it('marks disabled rules as warn', () => {
    const results = probeWafRules(['WAF-SQLi'])
    const xss = results.find((r) => r.detail.includes('WAF-XSS'))!
    expect(xss.status).toBe('warn')
  })

  it('marks all rules as pass when all enabled', () => {
    const all = ['WAF-SQLi', 'WAF-XSS', 'WAF-PATH', 'WAF-BOT', 'WAF-RATE']
    const results = probeWafRules(all)
    expect(results.every((r) => r.status === 'pass')).toBe(true)
  })

  it('detail string includes the rule id', () => {
    const [sqli] = probeWafRules(['WAF-SQLi'])
    expect(sqli.detail).toContain('WAF-SQLi')
  })
})

// ── probeAuthBoundary ─────────────────────────────────────────────
describe('probeAuthBoundary', () => {
  it('returns 3 results (one per endpoint)', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResponse(200))
    const results = await probeAuthBoundary('http://localhost:3000', fetcher)
    expect(results).toHaveLength(3)
  })

  it('marks heartbeat 200 as pass', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResponse(200))
    const results = await probeAuthBoundary('http://localhost:3000', fetcher)
    const hb = results.find((r) => r.label === 'Heartbeat endpoint')!
    expect(hb.status).toBe('pass')
    expect(hb.detail).toContain('200')
  })

  it('marks AI stream GET returning 405 as pass (expected guard)', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(makeResponse(200))  // heartbeat
      .mockResolvedValueOnce(makeResponse(405))  // ai/stream GET guard
      .mockResolvedValueOnce(makeResponse(200))  // console
    const results = await probeAuthBoundary('http://localhost:3000', fetcher)
    const ai = results.find((r) => r.label === 'AI stream (GET guard)')!
    expect(ai.status).toBe('pass')
  })

  it('marks AI stream GET returning 200 as warn (unexpected access)', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(makeResponse(200))  // heartbeat
      .mockResolvedValueOnce(makeResponse(200))  // ai/stream — unexpected
      .mockResolvedValueOnce(makeResponse(200))  // console
    const results = await probeAuthBoundary('http://localhost:3000', fetcher)
    const ai = results.find((r) => r.label === 'AI stream (GET guard)')!
    expect(ai.status).toBe('warn')
  })

  it('marks unreachable endpoint as warn', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))
    const results = await probeAuthBoundary('http://localhost:3000', fetcher)
    expect(results.every((r) => r.status === 'warn')).toBe(true)
    expect(results[0].detail).toContain('unreachable')
  })

  it('detail string contains the HTTP method and path', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResponse(200))
    const results = await probeAuthBoundary('http://localhost:3000', fetcher)
    expect(results[0].detail).toContain('GET')
    expect(results[0].detail).toContain('/api/heartbeat')
  })
})

// ── probePorts ────────────────────────────────────────────────────
describe('probePorts', () => {
  it('returns one result per target', async () => {
    const connector = vi.fn().mockResolvedValue(false)
    const results = await probePorts(
      [{ port: 22, label: 'SSH' }, { port: 3000, label: 'App' }],
      connector,
    )
    expect(results).toHaveLength(2)
  })

  it('marks open port as info', async () => {
    const connector = vi.fn().mockResolvedValue(true)
    const [result] = await probePorts([{ port: 3000, label: 'App' }], connector)
    expect(result.status).toBe('info')
    expect(result.detail).toContain('OPEN')
  })

  it('marks closed port as pass', async () => {
    const connector = vi.fn().mockResolvedValue(false)
    const [result] = await probePorts([{ port: 22, label: 'SSH' }], connector)
    expect(result.status).toBe('pass')
    expect(result.detail).toBe('CLOSED')
  })

  it('label includes port number and service name', async () => {
    const connector = vi.fn().mockResolvedValue(false)
    const [result] = await probePorts([{ port: 5432, label: 'Postgres' }], connector)
    expect(result.label).toContain('5432')
    expect(result.label).toContain('Postgres')
  })

  it('calls connector with 127.0.0.1 and the correct port', async () => {
    const connector = vi.fn().mockResolvedValue(false)
    await probePorts([{ port: 6379, label: 'Redis' }], connector)
    expect(connector).toHaveBeenCalledWith('127.0.0.1', 6379)
  })

  it('probes all ports concurrently (all connector calls happen)', async () => {
    const connector = vi.fn().mockResolvedValue(false)
    const targets = [
      { port: 22,   label: 'SSH' },
      { port: 80,   label: 'HTTP' },
      { port: 3000, label: 'App' },
    ]
    await probePorts(targets, connector)
    expect(connector).toHaveBeenCalledTimes(3)
  })
})

// ── probeFileExposure ─────────────────────────────────────────────
describe('probeFileExposure', () => {
  it('returns 3 results (env, git, package.json)', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResponse(404))
    const results = await probeFileExposure('http://localhost:3000', fetcher)
    expect(results).toHaveLength(3)
  })

  it('marks 200 response as fail (file exposed)', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResponse(200))
    const results = await probeFileExposure('http://localhost:3000', fetcher)
    expect(results.every((r) => r.status === 'fail')).toBe(true)
    expect(results[0].detail).toContain('EXPOSED')
  })

  it('marks 404 response as pass (file protected)', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResponse(404))
    const results = await probeFileExposure('http://localhost:3000', fetcher)
    expect(results.every((r) => r.status === 'pass')).toBe(true)
  })

  it('marks network error as pass (file unreachable)', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network error'))
    const results = await probeFileExposure('http://localhost:3000', fetcher)
    expect(results.every((r) => r.status === 'pass')).toBe(true)
    expect(results[0].detail).toBe('Not reachable')
  })

  it('checks /.env path', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResponse(404))
    await probeFileExposure('http://localhost:3000', fetcher)
    const urls = fetcher.mock.calls.map((c) => c[0] as string)
    expect(urls.some((u) => u.endsWith('/.env'))).toBe(true)
  })

  it('checks /.git/HEAD path', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResponse(404))
    await probeFileExposure('http://localhost:3000', fetcher)
    const urls = fetcher.mock.calls.map((c) => c[0] as string)
    expect(urls.some((u) => u.endsWith('/.git/HEAD'))).toBe(true)
  })
})

// ── probeSecurityHeaders ──────────────────────────────────────────
describe('probeSecurityHeaders', () => {
  it('returns 5 results (one per expected header)', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResponse(200))
    const results = await probeSecurityHeaders('http://localhost:3000', fetcher)
    expect(results).toHaveLength(5)
  })

  it('marks present headers as pass', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      makeResponse(200, {
        'x-frame-options':        'DENY',
        'x-content-type-options': 'nosniff',
        'x-xss-protection':       '1; mode=block',
        'strict-transport-security': 'max-age=31536000',
        'content-security-policy':   "default-src 'self'",
      }),
    )
    const results = await probeSecurityHeaders('http://localhost:3000', fetcher)
    expect(results.every((r) => r.status === 'pass')).toBe(true)
  })

  it('marks absent headers as warn', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResponse(200))
    const results = await probeSecurityHeaders('http://localhost:3000', fetcher)
    expect(results.every((r) => r.status === 'warn')).toBe(true)
    expect(results[0].detail).toBe('Absent')
  })

  it('marks all as warn on network failure', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))
    const results = await probeSecurityHeaders('http://localhost:3000', fetcher)
    expect(results.every((r) => r.status === 'warn')).toBe(true)
    expect(results[0].detail).toBe('Probe failed')
  })

  it('detail includes header value when present', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      makeResponse(200, { 'x-frame-options': 'SAMEORIGIN' }),
    )
    const results = await probeSecurityHeaders('http://localhost:3000', fetcher)
    const framesResult = results.find((r) => r.label.includes('x-frame-options'))!
    expect(framesResult.detail).toContain('SAMEORIGIN')
  })

  it('probes the /console path', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeResponse(200))
    await probeSecurityHeaders('http://localhost:3000', fetcher)
    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3000/console',
      expect.any(Object),
    )
  })
})
