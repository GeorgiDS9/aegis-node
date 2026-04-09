'use server'

import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import type { ScanAlert } from '@/types/aegis'

const WATCH_FOLDER    = path.resolve(process.cwd(), 'data/watch')
const BASELINE_FILE   = path.resolve(process.cwd(), 'data/.scan-baseline.json')

interface FileEntry {
  path: string
  size: number
  mtime: number
}

// ── Public: scan the watch folder for drift ───────────────────────
export async function scanWatchFolder(): Promise<ScanAlert[]> {
  await fs.mkdir(WATCH_FOLDER, { recursive: true })

  const current = await snapshotFolder(WATCH_FOLDER)
  const alerts: ScanAlert[] = []

  // First run — save baseline and report clean
  let baseline: FileEntry[] = []
  try {
    const raw = await fs.readFile(BASELINE_FILE, 'utf-8')
    baseline = JSON.parse(raw) as FileEntry[]
  } catch {
    await saveBaseline(current)
    return [
      {
        id: randomUUID(),
        file: WATCH_FOLDER,
        type: 'info',
        message: `Watch folder initialized — ${current.length} file(s) indexed`,
        timestamp: new Date().toISOString(),
      },
    ]
  }

  const baselineMap = new Map(baseline.map((e) => [e.path, e]))
  const currentMap  = new Map(current.map((e) => [e.path, e]))

  // New or modified files
  for (const [filePath, entry] of currentMap) {
    const base = baselineMap.get(filePath)
    if (!base) {
      alerts.push({
        id:        randomUUID(),
        file:      filePath,
        type:      'warning',
        message:   `New file detected: ${path.basename(filePath)}`,
        timestamp: new Date().toISOString(),
      })
    } else if (base.size !== entry.size || base.mtime !== entry.mtime) {
      alerts.push({
        id:        randomUUID(),
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
        id:        randomUUID(),
        file:      filePath,
        type:      'critical',
        message:   `File removed: ${path.basename(filePath)}`,
        timestamp: new Date().toISOString(),
      })
    }
  }

  await saveBaseline(current)

  if (alerts.length === 0) {
    return [
      {
        id:        randomUUID(),
        file:      WATCH_FOLDER,
        type:      'info',
        message:   'Watch folder nominal — no drift detected',
        timestamp: new Date().toISOString(),
      },
    ]
  }

  return alerts
}

// ── Recursively snapshot a folder ─────────────────────────────────
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
      if (item.startsWith('.')) continue        // skip hidden/baseline files
      const full = path.join(dir, item)
      try {
        const stat = await fs.stat(full)
        if (stat.isDirectory()) {
          await walk(full)
        } else {
          entries.push({ path: full, size: stat.size, mtime: stat.mtimeMs })
        }
      } catch {
        // skip inaccessible
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
