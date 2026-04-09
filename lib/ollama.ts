type AIQueryResult = { response?: string; error?: string }

const OLLAMA_BASE = () => process.env.OLLAMA_API ?? 'http://localhost:11434'
const MODEL = () => process.env.PRIMARY_MODEL ?? 'llama3:8b-instruct-q4_K_M'

export const queryAegisAI = async (prompt: string): Promise<AIQueryResult> => {
  try {
    const response = await fetch(`${OLLAMA_BASE()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL(),
        prompt: `[AEGIS_PROTOCOL] Analyze the following threat and suggest remediation: ${prompt}`,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama responded with ${response.status}`)
    }

    const data = await response.json()
    return { response: data.response }
  } catch (error) {
    console.error('[AEGIS] Ollama connection error:', error)
    return { error: 'AI Engine Offline — Ensure Ollama is running on Host' }
  }
}
