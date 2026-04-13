import { describe, it, expect } from 'vitest'
import { buildKineticCommands } from '@/lib/kinetic-bridge'
import type { VanguardAlert } from '@/types/aegis'

function makeAlert(overrides: Partial<VanguardAlert> = {}): VanguardAlert {
  return {
    id:        'alert-001',
    type:      'high',
    category:  'ip_threat',
    source_ip: '10.0.0.1',
    message:   'Suspicious activity',
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

describe('buildKineticCommands', () => {
  // ── Filtering ────────────────────────────────────────────────
  it('filters out info-level alerts — no command generated', () => {
    const result = buildKineticCommands([makeAlert({ type: 'info' })])
    expect(result).toHaveLength(0)
  })

  it('includes critical, high, and medium alerts', () => {
    const alerts = [
      makeAlert({ id: 'a1', type: 'critical' }),
      makeAlert({ id: 'a2', type: 'high' }),
      makeAlert({ id: 'a3', type: 'medium' }),
    ]
    expect(buildKineticCommands(alerts)).toHaveLength(3)
  })

  // ── Risk mapping ──────────────────────────────────────────────
  it('maps critical → CRITICAL risk', () => {
    const [cmd] = buildKineticCommands([makeAlert({ type: 'critical' })])
    expect(cmd.risk).toBe('CRITICAL')
  })

  it('maps high → HIGH risk', () => {
    const [cmd] = buildKineticCommands([makeAlert({ type: 'high' })])
    expect(cmd.risk).toBe('HIGH')
  })

  it('maps medium → MEDIUM risk', () => {
    const [cmd] = buildKineticCommands([makeAlert({ type: 'medium' })])
    expect(cmd.risk).toBe('MEDIUM')
  })

  // ── HITL safety default ───────────────────────────────────────
  it('all commands default to authorized: false', () => {
    const cmds = buildKineticCommands([
      makeAlert({ id: 'a1', type: 'critical' }),
      makeAlert({ id: 'a2', type: 'high' }),
    ])
    expect(cmds.every((c) => c.authorized === false)).toBe(true)
  })

  it('alertId matches the source alert id', () => {
    const [cmd] = buildKineticCommands([makeAlert({ id: 'vg-abc123' })])
    expect(cmd.alertId).toBe('vg-abc123')
  })

  // ── Command derivation: blocklist ─────────────────────────────
  it('ip_threat + source_ip → pfctl blocklist add', () => {
    const [cmd] = buildKineticCommands([makeAlert({ category: 'ip_threat', source_ip: '192.168.1.50' })])
    expect(cmd.command).toBe('pfctl -t aegis_blocklist -T add 192.168.1.50')
  })

  it('port_scan + source_ip → pfctl blocklist add', () => {
    const [cmd] = buildKineticCommands([makeAlert({ category: 'port_scan', source_ip: '172.16.0.5' })])
    expect(cmd.command).toBe('pfctl -t aegis_blocklist -T add 172.16.0.5')
  })

  it('auth_failure + source_ip → pfctl blocklist add', () => {
    const [cmd] = buildKineticCommands([makeAlert({ category: 'auth_failure', source_ip: '10.10.10.10' })])
    expect(cmd.command).toBe('pfctl -t aegis_blocklist -T add 10.10.10.10')
  })

  // ── Command derivation: quarantine ────────────────────────────
  it('malware + source_ip → pfctl quarantine add', () => {
    const [cmd] = buildKineticCommands([makeAlert({ type: 'high', category: 'malware', source_ip: '10.0.0.5' })])
    expect(cmd.command).toBe('pfctl -t aegis_quarantine -T add 10.0.0.5')
  })

  it('malware with no source_ip falls back to target', () => {
    const [cmd] = buildKineticCommands([
      makeAlert({ type: 'high', category: 'malware', source_ip: undefined, target: 'malware-host' }),
    ])
    expect(cmd.command).toBe('pfctl -t aegis_quarantine -T add malware-host')
  })

  // ── Command derivation: manual review ─────────────────────────
  it('ip_threat without source_ip → manual review comment', () => {
    const [cmd] = buildKineticCommands([makeAlert({ category: 'ip_threat', source_ip: undefined })])
    expect(cmd.command).toMatch(/^# Manual review:/)
  })

  it('unknown category → manual review comment', () => {
    const [cmd] = buildKineticCommands([makeAlert({ type: 'medium', category: 'anomaly', source_ip: undefined })])
    expect(cmd.command).toMatch(/^# Manual review:/)
  })

  // ── Description ───────────────────────────────────────────────
  it('description includes the source IP for blocklist commands', () => {
    const [cmd] = buildKineticCommands([makeAlert({ category: 'ip_threat', source_ip: '1.2.3.4' })])
    expect(cmd.description).toContain('1.2.3.4')
  })
})
