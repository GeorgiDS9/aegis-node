"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { DefenseLogEntry, VaultSearchResult, FirewallStatus as FirewallStatusType, HardwareMetrics, ScanAlert, VanguardFeedResult } from "@/types/aegis";
import { searchRemediations } from "@/actions/vault";

export function useDefenseLog(initial: DefenseLogEntry[] = []) {
  const [entries, setEntries] = useState<DefenseLogEntry[]>(initial);

  const addEntry = useCallback(
    (entry: Omit<DefenseLogEntry, "id" | "timestamp">) => {
      setEntries((prev) => [
        {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        },
        ...prev,
      ]);
    },
    [],
  );

  return { entries, addEntry };
}

// ── GLOBAL PERSISTENT STORE (In-Memory for Session) ──────────────
const AI_MEMORY: {
  plans: Record<string, string>;
  streamingIds: Set<string>;
  expanded: Set<string>;
} = {
  plans: {},
  streamingIds: new Set(),
  expanded: new Set(),
};

export function useStreamingAI() {
  const [, forceUpdate] = useState({});
  const abortRefs = useRef<Map<string, AbortController>>(new Map());

  const streamQuery = useCallback(
    async (
      id: string,
      prompt: string,
      onChunk: (chunk: string) => void,
      onDone: () => void,
    ) => {
      const controller = new AbortController();
      abortRefs.current.set(id, controller);
      
      AI_MEMORY.streamingIds.add(id);
      AI_MEMORY.expanded.add(id); // Auto-expand on stream start
      forceUpdate({});

      try {
        const res = await fetch("/api/ai/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const err = "AI Engine Offline — Ensure Ollama is running on Host";
          AI_MEMORY.plans[id] = (AI_MEMORY.plans[id] || "") + err;
          onChunk(err);
          onDone();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          AI_MEMORY.plans[id] = (AI_MEMORY.plans[id] || "") + chunk;
          onChunk(chunk);
          forceUpdate({});
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          const msg = "\n[ERROR: Stream Disrupted]";
          AI_MEMORY.plans[id] = (AI_MEMORY.plans[id] || "") + msg;
          onChunk(msg);
        }
      } finally {
        AI_MEMORY.streamingIds.delete(id);
        abortRefs.current.delete(id);
        forceUpdate({});
        onDone();
      }
    },
    [],
  );

  return { 
    streamingIds: AI_MEMORY.streamingIds, 
    plans: AI_MEMORY.plans,
    expanded: AI_MEMORY.expanded,
    streamQuery,
    toggleExpand: (id: string) => {
      if (AI_MEMORY.expanded.has(id)) AI_MEMORY.expanded.delete(id);
      else AI_MEMORY.expanded.add(id);
      forceUpdate({});
    }
  };
}
interface PulseData {
  alerts: ScanAlert[]
  metrics: HardwareMetrics
  firewall: FirewallStatusType
  vanguard: VanguardFeedResult
}

export function useAegisPulse(initial?: PulseData) {
  const [data, setData] = useState<PulseData | undefined>(initial);

  useEffect(() => {
    const pulse = async () => {
      try {
        const res = await fetch("/api/heartbeat");
        if (res.ok) {
          const next = await res.json();
          setData(next);
        }
      } catch (err) {
        console.error("Pulse Failed", err);
      }
    };

    const interval = setInterval(pulse, 5000);
    return () => clearInterval(interval);
  }, []);

  return data ?? initial;
}

export function useVaultSearch() {
  const [results, setResults] = useState<VaultSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery]     = useState<string>("");

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    try {
      const res = await searchRemediations(q);
      setResults(res);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return { query, results, loading, search, clear };
}
