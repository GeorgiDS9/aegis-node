'use server'

import type { VanguardAlert, VanguardFeedResult } from '@/types/aegis'

// Read from env — never exposed to the browser (Server Action)
const apiUrl = () => process.env.VANGUARD_API_URL ?? ''
const apiKey = () => process.env.VANGUARD_API_KEY ?? ''

/**
 * Lightweight reachability check. Used to show connection status
 * before attempting a full feed fetch.
 */
export async function heartbeatVanguard(): Promise<boolean> {
  const base = apiUrl()
  if (!base) return false
  try {
    const res = await fetch(`${base}/heartbeat`, {
      headers: { Authorization: `Bearer ${apiKey()}` },
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Fetch the global threat feed from Vanguard.
 * All auth is server-side — key never reaches the browser.
 */
export async function fetchThreatFeed(): Promise<VanguardFeedResult> {
  const base = apiUrl()
  const key  = apiKey()
  const fetchedAt = new Date().toISOString()

  if (!base || !key) {
    return {
      connected: false,
      alerts: [],
      error: 'VANGUARD_API_URL or VANGUARD_API_KEY not set in environment',
      fetchedAt,
    }
  }

  try {
    const res = await fetch(`${base}/threats`, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })

    if (!res.ok) {
      return {
        connected: false,
        alerts: [],
        error: `Vanguard responded with HTTP ${res.status}`,
        fetchedAt,
      }
    }

    const raw = (await res.json()) as unknown
    const alerts = parseAlerts(raw)
    return { connected: true, alerts, fetchedAt }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { connected: false, alerts: [], error: msg, fetchedAt }
  }
}

// ── Internal parsers ──────────────────────────────────────────────

function parseAlerts(raw: unknown): VanguardAlert[] {
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : typeof raw === 'object' && raw !== null && Array.isArray((raw as Record<string, unknown>)['alerts'])
      ? ((raw as Record<string, unknown>)['alerts'] as unknown[])
      : typeof raw === 'object' && raw !== null && Array.isArray((raw as Record<string, unknown>)['data'])
        ? ((raw as Record<string, unknown>)['data'] as unknown[])
        : []

  return list
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item, i) => ({
      id:        String(item['id']        ?? `VG-${i}-${Date.now()}`),
      type:      toAlertType(String(item['type'] ?? item['severity'] ?? 'info')),
      category:  toCategory(String(item['category'] ?? item['type'] ?? '')),
      source_ip: item['source_ip'] ? String(item['source_ip']) : item['ip'] ? String(item['ip']) : undefined,
      target:    item['target']    ? String(item['target'])    : undefined,
      message:   String(item['message'] ?? item['description'] ?? item['title'] ?? 'Unknown threat'),
      timestamp: String(item['timestamp'] ?? item['created_at'] ?? new Date().toISOString()),
    }))
}

function toAlertType(raw: string): VanguardAlert['type'] {
  switch (raw.toLowerCase()) {
    case 'critical': return 'critical'
    case 'high':     return 'high'
    case 'medium':   return 'medium'
    default:         return 'info'
  }
}

function toCategory(raw: string): VanguardAlert['category'] {
  const v = raw.toLowerCase()
  if (v.includes('ip') || v.includes('block'))              return 'ip_threat'
  if (v.includes('port') || v.includes('scan'))             return 'port_scan'
  if (v.includes('auth') || v.includes('login') || v.includes('fail')) return 'auth_failure'
  if (v.includes('malware') || v.includes('virus'))         return 'malware'
  return 'anomaly'
}
