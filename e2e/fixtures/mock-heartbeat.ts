/**
 * Deterministic heartbeat payload for e2e tests.
 * Eliminates the need for real hardware / pfctl / Vanguard in CI.
 */
export const MOCK_HEARTBEAT = {
  alerts: [],
  metrics: {
    cpuUsagePercent: 12,
    memoryUsedPercent: 38,
    memoryUsedGB: 6.1,
    totalMemoryGB: 16,
    chipModel: "Apple M4",
  },
  firewall: {
    enabled: false,
    interfaces: [],
    rawOutput: "",
    error: "Auditor mode — elevated access unavailable",
  },
  vanguard: {
    connected: false,
    alerts: [],
    fetchedAt: new Date().toISOString(),
  },
};
