import { describe, it, expect, vi, beforeEach } from "vitest";

// ── LanceDB mock ─────────────────────────────────────────────────
// Must be defined before importing vault (vi.mock hoists to top of file)

const mockAdd = vi.fn().mockResolvedValue(undefined);
const mockQueryToArray = vi.fn();
const mockVsToArray = vi.fn();

const mockTable = {
  add: mockAdd,
  query: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ toArray: mockQueryToArray }) }),
  vectorSearch: vi
    .fn()
    .mockReturnValue({ limit: vi.fn().mockReturnValue({ toArray: mockVsToArray }) }),
};

const mockDb = {
  openTable: vi.fn().mockResolvedValue(mockTable),
  tableNames: vi.fn().mockResolvedValue(["remediation_signatures"]),
  createTable: vi.fn().mockResolvedValue(mockTable),
};

vi.mock("@lancedb/lancedb", () => ({
  connect: vi.fn().mockResolvedValue(mockDb),
}));

// Mock Ollama embedding endpoint — offline in test environment,
// generateEmbedding falls back to zero vector automatically
vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

import { logRemediation, getDefenseLogs, searchRemediations } from "@/actions/vault";

// ── Helpers ───────────────────────────────────────────────────────
function makeRawRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "entry-001",
    cve_id: "CVE-2024-001",
    target: "test-target",
    action: "Test remediation action",
    risk: "HIGH",
    outcome: "success",
    source: "EDGE",
    timestamp: "2024-06-01T12:00:00Z",
    ...overrides,
  };
}

// ── logRemediation ────────────────────────────────────────────────
describe("logRemediation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls table.add with the entry fields", async () => {
    await logRemediation({
      id: "KINETIC-001",
      cve_id: "CVE-2024-001",
      target: "Local PF Firewall",
      action: "pfctl -t aegis_blocklist -T add 10.0.0.1",
      risk: "HIGH",
      outcome: "authorized",
      source: "CLOUD",
      timestamp: "2024-06-01T12:00:00Z",
    });

    expect(mockAdd).toHaveBeenCalledOnce();
    const [rows] = mockAdd.mock.calls[0] as [Record<string, unknown>[]];
    expect(rows[0]).toMatchObject({
      id: "KINETIC-001",
      cve_id: "CVE-2024-001",
      target: "Local PF Firewall",
      action: "pfctl -t aegis_blocklist -T add 10.0.0.1",
      risk: "HIGH",
      outcome: "authorized",
      source: "CLOUD",
    });
  });

  it("includes a vector array of the correct dimension (4096)", async () => {
    await logRemediation({
      id: "test",
      cve_id: "test",
      target: "test",
      action: "test",
      risk: "MEDIUM",
      outcome: "success",
      source: "EDGE",
      timestamp: new Date().toISOString(),
    });

    const [rows] = mockAdd.mock.calls[0] as [Record<string, unknown>[]];
    expect(Array.isArray(rows[0].vector)).toBe(true);
    expect((rows[0].vector as number[]).length).toBe(4096);
  });

  it("falls back to zero vector when Ollama is offline", async () => {
    await logRemediation({
      id: "test",
      cve_id: "test",
      target: "test",
      action: "test",
      risk: "LOW",
      outcome: "success",
      source: "EDGE",
      timestamp: new Date().toISOString(),
    });

    const [rows] = mockAdd.mock.calls[0] as [Record<string, unknown>[]];
    const vector = rows[0].vector as number[];
    expect(vector.every((v) => v === 0)).toBe(true);
  });
});

// ── getDefenseLogs ────────────────────────────────────────────────
describe("getDefenseLogs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("excludes the VAULT-INIT bootstrap entry", async () => {
    mockQueryToArray.mockResolvedValue([
      makeRawRow({ id: "VAULT-INIT", cve_id: "INIT" }),
      makeRawRow({ id: "real-entry" }),
    ]);

    const results = await getDefenseLogs();
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("real-entry");
  });

  it("returns entries sorted newest-first", async () => {
    mockQueryToArray.mockResolvedValue([
      makeRawRow({ id: "old", timestamp: "2024-01-01T00:00:00Z" }),
      makeRawRow({ id: "new", timestamp: "2024-12-01T00:00:00Z" }),
    ]);

    const results = await getDefenseLogs();
    expect(results[0].id).toBe("new");
    expect(results[1].id).toBe("old");
  });

  it("returns score: 1 for all entries (full relevance)", async () => {
    mockQueryToArray.mockResolvedValue([makeRawRow()]);

    const results = await getDefenseLogs();
    expect(results[0].score).toBe(1);
  });

  it("maps all VaultSearchResult fields correctly", async () => {
    mockQueryToArray.mockResolvedValue([
      makeRawRow({
        id: "test-id",
        cve_id: "CVE-001",
        target: "my-target",
        action: "my-action",
        risk: "CRITICAL",
        outcome: "enforced",
        source: "CLOUD",
        timestamp: "2024-06-01T00:00:00Z",
      }),
    ]);

    const [entry] = await getDefenseLogs();
    expect(entry).toMatchObject({
      id: "test-id",
      cve_id: "CVE-001",
      target: "my-target",
      action: "my-action",
      risk: "CRITICAL",
      outcome: "enforced",
      source: "CLOUD",
    });
  });

  it("returns empty array when vault is empty (only VAULT-INIT)", async () => {
    mockQueryToArray.mockResolvedValue([makeRawRow({ id: "VAULT-INIT", cve_id: "INIT" })]);

    const results = await getDefenseLogs();
    expect(results).toHaveLength(0);
  });

  it("returns empty array on LanceDB error", async () => {
    mockQueryToArray.mockRejectedValue(new Error("DB read error"));

    const results = await getDefenseLogs();
    expect(results).toEqual([]);
  });
});

// ── searchRemediations ────────────────────────────────────────────
describe("searchRemediations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("excludes the VAULT-INIT bootstrap entry from search results", async () => {
    mockVsToArray.mockResolvedValue([
      { ...makeRawRow({ id: "VAULT-INIT" }), _distance: 0.1 },
      { ...makeRawRow({ id: "match-001" }), _distance: 0.2 },
    ]);

    const results = await searchRemediations("sql injection");
    expect(results.every((r) => r.id !== "VAULT-INIT")).toBe(true);
  });

  it("converts _distance to a similarity score (1 - distance)", async () => {
    mockVsToArray.mockResolvedValue([{ ...makeRawRow({ id: "result-1" }), _distance: 0.3 }]);

    const [result] = await searchRemediations("test query");
    expect(result.score).toBeCloseTo(0.7);
  });

  it("returns empty array on LanceDB error", async () => {
    mockVsToArray.mockRejectedValue(new Error("Search failed"));

    const results = await searchRemediations("test");
    expect(results).toEqual([]);
  });
});
