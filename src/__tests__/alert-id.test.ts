import { describe, it, expect } from 'vitest'
import { stableVanguardId, stableShortHash, stableFullHash, buildAlertId } from '@/lib/alert-id'

describe('stableVanguardId', () => {
  it('returns the same ID for identical input', () => {
    const item = { source_ip: '10.0.0.1', type: 'ip_threat', detail: 'Port scan detected' }
    expect(stableVanguardId(item)).toBe(stableVanguardId(item))
  })

  it('returns different IDs for different source IPs', () => {
    const a = stableVanguardId({ source_ip: '10.0.0.1', type: 'ip_threat', detail: 'test' })
    const b = stableVanguardId({ source_ip: '10.0.0.2', type: 'ip_threat', detail: 'test' })
    expect(a).not.toBe(b)
  })

  it('returns different IDs for different message content', () => {
    const a = stableVanguardId({ source_ip: '1.2.3.4', type: 'ip_threat', detail: 'message A' })
    const b = stableVanguardId({ source_ip: '1.2.3.4', type: 'ip_threat', detail: 'message B' })
    expect(a).not.toBe(b)
  })

  it('prefixes ID with vg- and produces 12-char hex', () => {
    const id = stableVanguardId({ source_ip: '1.2.3.4' })
    expect(id).toMatch(/^vg-[0-9a-f]{12}$/)
  })

  it('handles missing fields without throwing', () => {
    expect(() => stableVanguardId({})).not.toThrow()
    expect(stableVanguardId({})).toMatch(/^vg-[0-9a-f]{12}$/)
  })

  it('is immutable — timestamp exclusion means re-fetch produces same ID', () => {
    const base = { source_ip: '1.2.3.4', type: 'critical', detail: 'Scan detected' }
    const first  = stableVanguardId({ ...base, timestamp: '2024-01-01T00:00:00Z' })
    const second = stableVanguardId({ ...base, timestamp: '2024-06-01T12:00:00Z' })
    expect(first).toBe(second)
  })
})

describe('stableShortHash', () => {
  it('returns a 12-character hex string', () => {
    expect(stableShortHash('/watch/file.ts')).toMatch(/^[0-9a-f]{12}$/)
  })

  it('is deterministic for the same path', () => {
    expect(stableShortHash('/watch/file.ts')).toBe(stableShortHash('/watch/file.ts'))
  })

  it('returns different hashes for different paths', () => {
    expect(stableShortHash('/watch/a.ts')).not.toBe(stableShortHash('/watch/b.ts'))
  })
})

describe('stableFullHash', () => {
  it('returns a 64-character hex string', () => {
    expect(stableFullHash('/watch/file.ts')).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic', () => {
    expect(stableFullHash('/watch/file.ts')).toBe(stableFullHash('/watch/file.ts'))
  })
})

describe('buildAlertId', () => {
  it('formats as prefix-hash', () => {
    expect(buildAlertId('drift', '/watch/file.txt')).toMatch(/^drift-[0-9a-f]{12}$/)
    expect(buildAlertId('new',   '/watch/file.txt')).toMatch(/^new-[0-9a-f]{12}$/)
    expect(buildAlertId('del',   '/watch/file.txt')).toMatch(/^del-[0-9a-f]{12}$/)
  })

  it('different prefixes produce different IDs for the same path', () => {
    const drift = buildAlertId('drift', '/watch/file.txt')
    const newId = buildAlertId('new',   '/watch/file.txt')
    expect(drift).not.toBe(newId)
  })

  it('same prefix + same path always produces the same ID', () => {
    expect(buildAlertId('drift', '/watch/file.txt')).toBe(buildAlertId('drift', '/watch/file.txt'))
  })
})
