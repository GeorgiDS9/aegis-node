/**
 * Stable, deterministic alert ID generation.
 *
 * IDs are derived from the SHA-256 hash of the normalized absolute file path.
 * This ensures the same file always produces the same ID across scanner runs,
 * heartbeat polls, and vault lookups — regardless of mtime or size changes.
 *
 * Format: <prefix>-<12-char hex truncation of SHA-256>
 *   prefix = "new" | "drift" | "del"
 *   12 hex chars = 48 bits of collision resistance (sufficient for a local scanner)
 *
 * Full hash stored separately when vault dedup precision is needed.
 */

import { createHash } from 'crypto'
import path from 'path'

export type AlertPrefix = 'new' | 'drift' | 'del'

/**
 * Returns a stable 12-character short-hash of the normalized absolute path.
 * Used in UI labels and vault cve_id fields.
 */
export function stableShortHash(filePath: string): string {
  const normalized = path.resolve(filePath)
  return createHash('sha256').update(normalized).digest('hex').slice(0, 12)
}

/**
 * Returns the full SHA-256 hex digest for a file path.
 * Used when full collision resistance is required (e.g. vault dedup queries).
 */
export function stableFullHash(filePath: string): string {
  const normalized = path.resolve(filePath)
  return createHash('sha256').update(normalized).digest('hex')
}

/**
 * Constructs the canonical alert ID used across the system.
 *   e.g. "drift-a3f9c2b1d4e8"
 */
export function buildAlertId(prefix: AlertPrefix, filePath: string): string {
  return `${prefix}-${stableShortHash(filePath)}`
}
