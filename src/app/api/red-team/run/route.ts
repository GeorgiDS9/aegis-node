import { type NextRequest } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import {
  probeWafRules,
  probeAuthBoundary,
  probePorts,
  probeFileExposure,
  probeSecurityHeaders,
  formatProbeResult,
  type ProbeResult,
} from '@/lib/red-team-probes'

export const runtime = 'nodejs'

const SCAN_PORTS = [
  { port: 22,    label: 'SSH' },
  { port: 80,    label: 'HTTP' },
  { port: 443,   label: 'HTTPS' },
  { port: 3000,  label: 'App' },
  { port: 5432,  label: 'Postgres' },
  { port: 6379,  label: 'Redis' },
  { port: 8080,  label: 'Alt-HTTP' },
  { port: 27017, label: 'MongoDB' },
]

async function readEnabledWafRules(): Promise<string[]> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), 'data', '.waf-config.json'),
      'utf-8',
    )
    const cfg = JSON.parse(raw) as Record<string, boolean>
    return Object.entries(cfg).filter(([, v]) => v).map(([k]) => k)
  } catch {
    return []
  }
}

function buildAiPrompt(findings: ProbeResult[]): string {
  const passCount = findings.filter((r) => r.status === 'pass').length
  const warnCount = findings.filter((r) => r.status === 'warn').length
  const failCount = findings.filter((r) => r.status === 'fail').length
  const infoCount = findings.filter((r) => r.status === 'info').length

  const lines = findings
    .map((r) => `${r.status.toUpperCase().padEnd(4)} | ${r.label}: ${r.detail}`)
    .join('\n')

  return `RED TEAM PROBE FINDINGS (Read-Only, Aegis Edge Node):

${lines}

Summary: ${passCount} pass, ${warnCount} advisory, ${failCount} failure, ${infoCount} open port

TASK: Perform a rapid posture assessment of this M4 edge node based on the above probe results. Summarize in 3 concise bullet points. DO NOT include any headers, bold titles, or intros. Start immediately with the first bullet.`
}

export async function GET(req: NextRequest): Promise<Response> {
  const host  = req.headers.get('host') ?? 'localhost:3000'
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${proto}://${host}`

  const enabledRules = await readEnabledWafRules()

  const enc = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (line: string) =>
        controller.enqueue(enc.encode(line + '\n'))

      // ── Phase 1: SCOUT ─────────────────────────────────────────
      emit('[SCOUT] Initiating red team probe sequence...')
      emit('[SCOUT] ──────────────────────────────────────────────')
      emit('[SCOUT] Phase 1/5 — WAF Coverage Audit')

      const wafResults = probeWafRules(enabledRules)
      for (const r of wafResults) emit(formatProbeResult(r))

      emit('[SCOUT] Phase 2/5 — Auth Boundary Sweep')

      const authResults = await probeAuthBoundary(baseUrl)
      for (const r of authResults) emit(formatProbeResult(r))

      emit('[SCOUT] Phase 3/5 — Port Survey')

      const portResults = await probePorts(SCAN_PORTS)
      for (const r of portResults) emit(formatProbeResult(r))

      emit('[SCOUT] Phase 4/5 — Sensitive File Exposure')

      const fileResults = await probeFileExposure(baseUrl)
      for (const r of fileResults) emit(formatProbeResult(r))

      emit('[SCOUT] Phase 5/5 — Security Header Audit')

      const headerResults = await probeSecurityHeaders(baseUrl)
      for (const r of headerResults) emit(formatProbeResult(r))

      emit('[SCOUT] ──────────────────────────────────────────────')
      emit('[SCOUT] Scout sequence complete.')
      emit('')

      // ── Phase 2: ATTACK (AI posture assessment) ─────────────────
      emit('[ATTACK] ─────────────────────────────────────────────')
      emit('[ATTACK] Forwarding findings to AI analyst...')
      emit('')

      const allFindings: ProbeResult[] = [
        ...wafResults,
        ...authResults,
        ...portResults,
        ...fileResults,
        ...headerResults,
      ]

      const ollamaBase =
        process.env.OLLAMA_BASE_URL ?? 'http://host.docker.internal:11434'

      try {
        const ollamaRes = await fetch(`${ollamaBase}/api/generate`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model:  'llama3:8b-instruct-q4_K_M',
            prompt: buildAiPrompt(allFindings),
            stream: true,
          }),
          signal: AbortSignal.timeout(60000),
        })

        if (!ollamaRes.ok || !ollamaRes.body) {
          emit('[ATTACK] AI analyst offline — Ollama unreachable. Manual review required.')
        } else {
          const reader = ollamaRes.body.getReader()
          const dec    = new TextDecoder()

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = dec.decode(value, { stream: true })
            for (const line of chunk.split('\n').filter(Boolean)) {
              try {
                const parsed = JSON.parse(line) as { response?: string; done?: boolean }
                if (parsed.response) {
                  controller.enqueue(enc.encode(parsed.response))
                }
              } catch {
                // skip malformed JSON chunk
              }
            }
          }
        }
      } catch {
        emit('\n[ATTACK] AI analyst offline — Ollama unreachable. Manual review required.')
      }

      emit('')
      emit('')

      // ── Phase 3: AUDIT ─────────────────────────────────────────
      const failCount = allFindings.filter((r) => r.status === 'fail').length
      const warnCount = allFindings.filter((r) => r.status === 'warn').length
      const passCount = allFindings.filter((r) => r.status === 'pass').length

      emit('[AUDIT] ──────────────────────────────────────────────')
      emit('[AUDIT] Probe sequence complete.')
      emit(`[AUDIT] ${passCount} controls verified | ${warnCount} advisories | ${failCount} failures`)
      emit('[AUDIT] All probes read-only. No system state was modified.')

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':      'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control':     'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
