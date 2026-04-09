'use client'

import { useState, useCallback, useRef } from 'react'
import type { DefenseLogEntry } from '@/types/aegis'

export function useDefenseLog(initial: DefenseLogEntry[] = []) {
  const [entries, setEntries] = useState<DefenseLogEntry[]>(initial)

  const addEntry = useCallback((entry: Omit<DefenseLogEntry, 'id' | 'timestamp'>) => {
    setEntries((prev) => [
      {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      },
      ...prev,
    ])
  }, [])

  return { entries, addEntry }
}

export function useStreamingAI() {
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const streamQuery = useCallback(
    async (
      prompt: string,
      onChunk: (chunk: string) => void,
      onDone: () => void
    ) => {
      abortRef.current = new AbortController()
      setIsStreaming(true)

      try {
        const res = await fetch('/api/ai/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal: abortRef.current.signal,
        })

        if (!res.ok || !res.body) {
          onChunk('AI Engine Offline — Ensure Ollama is running on Host')
          onDone()
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          onChunk(decoder.decode(value, { stream: true }))
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          onChunk('AI Engine Offline — Ensure Ollama is running on Host')
        }
      } finally {
        setIsStreaming(false)
        onDone()
      }
    },
    []
  )

  return { isStreaming, streamQuery }
}
