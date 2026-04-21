import { describe, it, expect, vi, afterEach } from "vitest";
import {
  mapOutcomeToType,
  formatRelativeTime,
  mapVaultToLogEntries,
  buildScanContext,
} from "@/components/DefenseLog.utils";
import type {
  VaultSearchResult,
  ScanAlert,
  FirewallStatus,
  HardwareMetrics,
  DefenseLogEntry,
} from "@/types/aegis";

// ── mapOutcomeToType ──────────────────────────────────────────────
describe("mapOutcomeToType", () => {
  it("maps success → success", () => expect(mapOutcomeToType("success")).toBe("success"));
  it("maps enforced → success", () => expect(mapOutcomeToType("enforced")).toBe("success"));
  it("maps suspended → warning", () => expect(mapOutcomeToType("suspended")).toBe("warning"));
  it("maps failed → warning", () => expect(mapOutcomeToType("failed")).toBe("warning"));
  it("maps authorized → info", () => expect(mapOutcomeToType("authorized")).toBe("info"));
  it("maps unknown values → info", () => expect(mapOutcomeToType("anything-else")).toBe("info"));
});

// ── formatRelativeTime ────────────────────────────────────────────
describe("formatRelativeTime", () => {
  afterEach(() => vi.useRealTimers());

  it('returns "just now" for timestamps under 1 minute ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T12:00:30Z"));
    expect(formatRelativeTime("2024-06-01T12:00:00Z")).toBe("just now");
  });

  it("returns minutes for timestamps under 1 hour ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T12:15:00Z"));
    expect(formatRelativeTime("2024-06-01T12:00:00Z")).toBe("15 min ago");
  });

  it("returns hours for timestamps under 24 hours ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T15:00:00Z"));
    expect(formatRelativeTime("2024-06-01T12:00:00Z")).toBe("3h ago");
  });

  it("returns days for timestamps over 24 hours ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-03T12:00:00Z"));
    expect(formatRelativeTime("2024-06-01T12:00:00Z")).toBe("2d ago");
  });
});

// ── mapVaultToLogEntries ──────────────────────────────────────────
describe("mapVaultToLogEntries", () => {
  const makeVaultResult = (overrides: Partial<VaultSearchResult> = {}): VaultSearchResult => ({
    id: "entry-001",
    cve_id: "CVE-001",
    target: "test-target",
    action: "Blocked malicious IP",
    risk: "HIGH",
    outcome: "success",
    source: "EDGE",
    timestamp: new Date().toISOString(),
    score: 1,
    ...overrides,
  });

  it("maps vault result id to entry id", () => {
    const [entry] = mapVaultToLogEntries([makeVaultResult({ id: "abc-123" })]);
    expect(entry.id).toBe("abc-123");
  });

  it("maps action to message", () => {
    const [entry] = mapVaultToLogEntries([makeVaultResult({ action: "Quarantine host" })]);
    expect(entry.message).toBe("Quarantine host");
  });

  it("maps source correctly", () => {
    const edgeEntry = mapVaultToLogEntries([makeVaultResult({ source: "EDGE" })])[0];
    const cloudEntry = mapVaultToLogEntries([makeVaultResult({ source: "CLOUD" })])[0];
    expect(edgeEntry.source).toBe("EDGE");
    expect(cloudEntry.source).toBe("CLOUD");
  });

  it("maps outcome to correct entry type", () => {
    expect(mapVaultToLogEntries([makeVaultResult({ outcome: "enforced" })])[0].type).toBe(
      "success",
    );
    expect(mapVaultToLogEntries([makeVaultResult({ outcome: "suspended" })])[0].type).toBe(
      "warning",
    );
    expect(mapVaultToLogEntries([makeVaultResult({ outcome: "authorized" })])[0].type).toBe("info");
  });

  it("returns empty array for empty input", () => {
    expect(mapVaultToLogEntries([])).toEqual([]);
  });
});

// ── buildScanContext ──────────────────────────────────────────────
describe("buildScanContext", () => {
  const metrics: HardwareMetrics = {
    cpuUsagePercent: 42,
    memoryUsedPercent: 65,
    memoryUsedGB: 10.4,
    totalMemoryGB: 16,
    chipModel: "Apple M4",
  };

  const firewall: FirewallStatus = {
    enabled: true,
    interfaces: ["en0"],
    rawOutput: "Status: Enabled",
  };

  const firewallAuditor: FirewallStatus = {
    enabled: false,
    interfaces: [],
    rawOutput: "",
    error: "elevated access required",
  };

  const alerts: ScanAlert[] = [
    {
      id: "a1",
      file: "/watch/f1",
      type: "critical",
      message: "Critical file drift",
      timestamp: "",
    },
    { id: "a2", file: "/watch/f2", type: "warning", message: "Warning drift", timestamp: "" },
    { id: "a3", file: "/watch/f3", type: "info", message: "Info only", timestamp: "" },
  ];

  const recentLogs: DefenseLogEntry[] = [
    { id: "1", timestamp: "5 min ago", type: "success", source: "EDGE", message: "IP blocked" },
    { id: "2", timestamp: "1h ago", type: "info", source: "CLOUD", message: "Alert acked" },
  ];

  it("includes CPU utilization in context", () => {
    const ctx = buildScanContext(alerts, firewall, metrics, 3, recentLogs);
    expect(ctx).toContain("42% utilization");
  });

  it("includes memory stats in context", () => {
    const ctx = buildScanContext(alerts, firewall, metrics, 3, recentLogs);
    expect(ctx).toContain("10.4 / 16 GB");
  });

  it("includes active firewall status", () => {
    const ctx = buildScanContext(alerts, firewall, metrics, 0, []);
    expect(ctx).toContain("Active");
  });

  it("includes auditor mode when firewall is restricted", () => {
    const ctx = buildScanContext([], firewallAuditor, metrics, 0, []);
    expect(ctx).toContain("Auditor mode");
  });

  it("counts critical and warning edge alerts correctly", () => {
    const ctx = buildScanContext(alerts, firewall, metrics, 0, []);
    expect(ctx).toContain("1 critical");
    expect(ctx).toContain("1 warning");
  });

  it("includes cloud alert count", () => {
    const ctx = buildScanContext([], firewall, metrics, 7, []);
    expect(ctx).toContain("7 active");
  });

  it("includes up to 3 recent vault entries", () => {
    const ctx = buildScanContext([], firewall, metrics, 0, recentLogs);
    expect(ctx).toContain("IP blocked");
    expect(ctx).toContain("Alert acked");
  });

  it("shows no-activity message when vault is empty", () => {
    const ctx = buildScanContext([], firewall, metrics, 0, []);
    expect(ctx).toContain("No recent activity");
  });
});
