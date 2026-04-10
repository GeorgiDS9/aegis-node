'use server'

import path from 'path'
import type { RemediationSignature, VaultSearchResult } from '@/types/aegis'

const DB_PATH     = path.resolve(process.cwd(), 'data/vault')
const TABLE_NAME  = 'remediation_signatures'
const EMBED_DIM   = 4096  // llama3:8b-instruct-q4_K_M output dimension

// ── Lazy singleton connection ─────────────────────────────────────
let _db: import('@lancedb/lancedb').Connection | null = null

async function getDb() {
  if (!_db) {
    const lancedb = await import('@lancedb/lancedb')
    _db = await lancedb.connect(DB_PATH)
  }
  return _db
}

// ── Initialize vault and ensure table exists ──────────────────────
export async function initVault(): Promise<{ initialized: boolean; error?: string }> {
  try {
    const db = await getDb()
    const tables = await db.tableNames()

    if (!tables.includes(TABLE_NAME)) {
      await db.createTable(TABLE_NAME, [
        {
          id: 'VAULT-INIT',
          vector: Array<number>(EMBED_DIM).fill(0),
          cve_id: 'INIT',
          target: 'vault-bootstrap',
          action: 'Schema initialization',
          risk: 'NONE',
          outcome: 'success',
          source: 'EDGE',
          timestamp: new Date().toISOString(),
        },
      ])
    }

    return { initialized: true }
  } catch (err) {
    console.error('[VAULT] Init failed:', err)
    return { initialized: false, error: String(err) }
  }
}

// ── Log a remediation to the vault ───────────────────────────────
export async function logRemediation(
  entry: Omit<RemediationSignature, 'vector'>
): Promise<{ logged: boolean; error?: string }> {
  try {
    const db = await getDb()
    const table = await db.openTable(TABLE_NAME)

    const vector = await generateEmbedding(
      `${entry.cve_id} ${entry.target} ${entry.action} ${entry.outcome}`
    )

    await table.add([{ ...entry, vector }])
    return { logged: true }
  } catch (err) {
    console.error('[VAULT] Log failed:', err)
    return { logged: false, error: String(err) }
  }
}

// ── Vector search: query past remediations ────────────────────────
export async function searchRemediations(
  query: string
): Promise<VaultSearchResult[]> {
  try {
    const db = await getDb()
    const table = await db.openTable(TABLE_NAME)
    const queryVector = await generateEmbedding(query)

    type RawRow = Record<string, unknown>
    const raw = (await table.vectorSearch(queryVector).limit(5).toArray()) as RawRow[]

    return raw
      .filter((r) => r['id'] !== 'VAULT-INIT')
      .map((r) => ({
        id:        r['id']        as string,
        cve_id:    r['cve_id']    as string,
        target:    r['target']    as string,
        action:    r['action']    as string,
        risk:      r['risk']      as string,
        outcome:   r['outcome']   as string,
        source:    r['source']    as 'EDGE' | 'CLOUD',
        timestamp: r['timestamp'] as string,
        score:     1 - ((r['_distance'] as number) ?? 0),
      }))
  } catch (err) {
    console.error('[VAULT] Search failed:', err)
    return []
  }
}

export async function getDefenseLogs(): Promise<VaultSearchResult[]> {
  try {
    const db = await getDb()
    const table = await db.openTable(TABLE_NAME)
    
    type RawRow = Record<string, unknown>
    const raw = (await table.query().limit(50).toArray()) as RawRow[]

    return raw
      .filter((r) => r['id'] !== 'VAULT-INIT')
      .map((r) => ({
        id:        r['id']        as string,
        cve_id:    r['cve_id']    as string,
        target:    r['target']    as string,
        action:    r['action']    as string,
        risk:      r['risk']      as string,
        outcome:   r['outcome']   as string,
        source:    r['source']    as 'EDGE' | 'CLOUD',
        timestamp: r['timestamp'] as string,
        score:     1, // Full relevance for raw history
      }))
  } catch (err) {
    console.error('[VAULT] Retrieval failed:', err)
    return []
  }
}

// ── Generate embedding via Ollama ─────────────────────────────────
async function generateEmbedding(text: string): Promise<number[]> {
  const base  = process.env.OLLAMA_API_URL || process.env.OLLAMA_API || 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL || process.env.PRIMARY_MODEL || 'llama3:8b-instruct-q4_K_M'

  try {
    const res = await fetch(`${base}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text }),
    })

    if (!res.ok) throw new Error(`Ollama /api/embeddings returned ${res.status}`)
    const data = await res.json()

    const embedding = data.embedding as number[] | undefined
    if (!embedding || embedding.length === 0) throw new Error('Empty embedding returned')

    // Pad or truncate to EMBED_DIM for schema consistency
    if (embedding.length < EMBED_DIM) {
      return [...embedding, ...Array<number>(EMBED_DIM - embedding.length).fill(0)]
    }
    return embedding.slice(0, EMBED_DIM)
  } catch {
    // Fallback: zero vector when Ollama is offline
    return Array<number>(EMBED_DIM).fill(0)
  }
}
