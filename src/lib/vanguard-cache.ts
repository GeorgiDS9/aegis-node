/**
 * In-process Vanguard feed cache with circuit breaker.
 *
 * Prevents Vanguard being unreachable from degrading heartbeat response time.
 * If Vanguard doesn't respond within TIMEOUT_MS, the last successful fetch
 * is returned immediately with connected: false.
 *
 * Lives in lib/ (not actions/) because it holds module-level state and is
 * a pure utility — not a Next.js Server Action.
 */

import type { VanguardFeedResult } from "@/types/aegis";

const TIMEOUT_MS = 1000; // Give Vanguard 1 second max per heartbeat poll
const STALE_TTL_MS = 30_000; // Cache is considered stale after 30 seconds

interface CacheEntry {
  result: VanguardFeedResult;
  fetchedAt: number;
}

let _cache: CacheEntry | null = null;

export async function fetchWithCircuitBreaker(
  fetcher: () => Promise<VanguardFeedResult>,
): Promise<VanguardFeedResult> {
  const now = Date.now();

  // Race the fetcher against the timeout
  const timeoutResult: VanguardFeedResult = {
    connected: false,
    alerts: _cache?.result.alerts ?? [],
    error: "Vanguard timeout — serving cached feed",
    fetchedAt: new Date().toISOString(),
  };

  try {
    const result = await Promise.race([
      fetcher(),
      new Promise<VanguardFeedResult>((resolve) =>
        setTimeout(() => resolve(timeoutResult), TIMEOUT_MS),
      ),
    ]);

    if (result.connected) {
      _cache = { result, fetchedAt: now };
    } else if (_cache && now - _cache.fetchedAt < STALE_TTL_MS) {
      // Return cached alerts even if not connected, so the UI keeps showing data
      return {
        ...result,
        alerts: _cache.result.alerts,
      };
    }

    return result;
  } catch {
    if (_cache) {
      return {
        connected: false,
        alerts: _cache.result.alerts,
        error: "Vanguard unreachable — serving cached feed",
        fetchedAt: new Date().toISOString(),
      };
    }
    return {
      connected: false,
      alerts: [],
      error: "Vanguard unreachable",
      fetchedAt: new Date().toISOString(),
    };
  }
}
