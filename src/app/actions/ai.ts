'use server'

import { queryAegisAI } from '@/lib/ollama'
import type { AIQueryResult } from '@/app/aegis/aegis.types'

export async function executeRemediation(
  cve: string,
  description: string,
  target: string
): Promise<AIQueryResult> {
  const prompt = [
    `CVE: ${cve}`,
    `Target: ${target}`,
    `Description: ${description}`,
    '',
    'Generate a concise step-by-step remediation plan. Be technical and actionable.',
  ].join('\n')

  return queryAegisAI(prompt)
}
