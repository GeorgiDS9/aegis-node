'use server'

import { queryAegisAI } from '../../lib/ollama'
import type { AIQueryResult } from '@/types/aegis'

export async function executeRemediation(
  id: string,
  target: string,
  action: string,
  risk: string
): Promise<AIQueryResult> {
  const prompt = [
    `ID: ${id}`,
    `Target: ${target}`,
    `Action: ${action}`,
    `Risk: ${risk}`,
    '',
    'Generate a concise step-by-step remediation plan. Be technical and actionable.',
  ].join('\n')

  return queryAegisAI(prompt)
}
