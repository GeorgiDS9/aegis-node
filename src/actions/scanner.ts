'use server'

import fs from 'fs/promises'
import path from 'path'
import type { ScanAlert } from '@/types/aegis'
import { buildAlertId, stableShortHash } from '@/lib/alert-id'

const WATCH_FOLDER  = process.env.AEGIS_WATCH_PATH
                      ? path.resolve(process.env.AEGIS_WATCH_PATH)
                      : path.resolve(process.cwd(), 'data/watch')
const BASELINE_FILE = path.resolve(process.cwd(), 'data/.scan-baseline.json')

interface FileEntry {
  path: string
  size: number
  mtime: number
}

// ── Scan: detect drift against baseline ──────────────────────────
export async function scanWatchFolder(): Promise<ScanAlert[]> {
  await fs.mkdir(WATCH_FOLDER, { recursive: true })

  const current = await snapshotFolder(WATCH_FOLDER)

  let baseline: FileEntry[] = []
  try {
    const raw = await fs.readFile(BASELINE_FILE, 'utf-8')
    baseline = JSON.parse(raw) as FileEntry[]
  } catch {
    // First run — write baseline and return info alert
    await saveBaseline(current)
    return [
      {
        id:        buildAlertId('new', WATCH_FOLDER),
        file:      WATCH_FOLDER,
        type:      'info',
        message:   `Watch folder initialized — ${current.length} file(s) indexed`,
        timestamp: new Date().toISOString(),
      },
    ]
  }

  const baselineMap = new Map(baseline.map((e) => [e.path, e]))
  const currentMap  = new Map(current.map((e) => [e.path, e]))
  const alerts: ScanAlert[] = []

  // New or modified files
  for (const [filePath, entry] of currentMap) {
    const base = baselineMap.get(filePath)
    if (!base) {
      alerts.push({
        id:        buildAlertId('new', filePath),
        file:      filePath,
        type:      'warning',
        message:   `New file detected: ${path.basename(filePath)}`,
        timestamp: new Date().toISOString(),
      })
    } else if (base.size !== entry.size || base.mtime !== entry.mtime) {
      alerts.push({
        id:        buildAlertId('drift', filePath),
        file:      filePath,
        type:      'critical',
        message:   `File drift detected: ${path.basename(filePath)}`,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Deleted files
  for (const [filePath] of baselineMap) {
    if (!currentMap.has(filePath)) {
      alerts.push({
        id:        buildAlertId('del', filePath),
        file:      filePath,
        type:      'critical',
        message:   `File removed: ${path.basename(filePath)}`,
        timestamp: new Date().toISOString(),
      })
    }
  }

  if (alerts.length === 0) {
    return [
      {
        id:        `nominal-${stableShortHash(WATCH_FOLDER)}`,
        file:      WATCH_FOLDER,
        type:      'info',
        message:   'Watch folder nominal — no drift detected',
        timestamp: new Date().toISOString(),
      },
    ]
  }

  return alerts
}

/**
 * Acknowledge an alert by synchronizing the baseline for that specific file.
 *
 * Safety order: baseline is updated ONLY after the caller has confirmed
 * vault logging succeeded. The file is re-stat'd at acknowledgement time
 * so the baseline reflects its current state, not the state at scan time.
 *
 * For deleted files, the path is removed from the baseline entirely.
 */
export async function acknowledgeAlert(
  filePath: string,
  prefix: 'new' | 'drift' | 'del'
): Promise<{ acknowledged: boolean; error?: string }> {
  try {
    let baseline: FileEntry[] = []
    try {
      const raw = await fs.readFile(BASELINE_FILE, 'utf-8')
      baseline = JSON.parse(raw) as FileEntry[]
    } catch {
      baseline = []
    }

    const normalized = path.resolve(filePath)

    if (prefix === 'del') {
      // Remove deleted file from baseline so it stops generating alerts
      const updated = baseline.filter((e) => e.path !== normalized)
      await saveBaseline(updated)
      return { acknowledged: true }
    }

    // For new/drift: re-stat the file and upsert into baseline
    const stat = await fs.stat(normalized)
    const updated = baseline.filter((e) => e.path !== normalized)
    updated.push({ path: normalized, size: stat.size, mtime: stat.mtimeMs })
    await saveBaseline(updated)
    return { acknowledged: true }
  } catch (err) {
    console.error('[SCANNER] Acknowledge failed:', err)
    return { acknowledged: false, error: String(err) }
  }
}

// ── Helpers ───────────────────────────────────────────────────────

async function snapshotFolder(folder: string): Promise<FileEntry[]> {
  const entries: FileEntry[] = []

  async function walk(dir: string) {
    let items: string[]
    try {
      items = await fs.readdir(dir)
    } catch {
      return
    }
    for (const item of items) {
      const full = path.join(dir, item)
      if (full === BASELINE_FILE) continue
      try {
        const stat = await fs.stat(full)
        if (stat.isDirectory()) {
          await walk(full)
        } else {
          entries.push({ path: full, size: stat.size, mtime: stat.mtimeMs })
        }
      } catch {
        // skip inaccessible files
      }
    }
  }

  await walk(folder)
  return entries
}

async function saveBaseline(entries: FileEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(BASELINE_FILE), { recursive: true })
  await fs.writeFile(BASELINE_FILE, JSON.stringify(entries, null, 2))
}
