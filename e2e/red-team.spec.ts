import { test, expect } from "@playwright/test";
import { MOCK_HEARTBEAT } from "./fixtures/mock-heartbeat";

// Deterministic probe output — matches the [PROBE]/[ASSESS]/[VERIFY] phase labels
// and includes a ✗ fail result so DRIFT_DETECTED status is triggered.
const MOCK_PROBE_OUTPUT = [
  "[PROBE] Initiating red team probe sequence...",
  "[PROBE] ──────────────────────────────────────────────",
  "[PROBE] Phase 1/5 — WAF Coverage Audit",
  "[PROBE] SQL Injection filter: WAF-SQLi disabled ⚠",
  "[PROBE] XSS vector filter: WAF-XSS disabled ⚠",
  "[PROBE] Phase 2/5 — Auth Boundary Sweep",
  "[PROBE] Heartbeat endpoint: GET /api/heartbeat → 200 ✓",
  "[PROBE] Phase 3/5 — Port Survey",
  "[PROBE] Port 3000 (App): OPEN — App listening →",
  "[PROBE] Phase 4/5 — Sensitive File Exposure",
  "[PROBE] .env file: Not served (404) ✓",
  "[PROBE] Phase 5/5 — Security Header Audit",
  "[PROBE] Header: x-frame-options: Absent ⚠",
  "[PROBE] ──────────────────────────────────────────────",
  "[PROBE] Probe sequence complete.",
  "",
  "[ASSESS] ─────────────────────────────────────────────",
  "[ASSESS] Forwarding findings to AI analyst...",
  "",
  "• WAF coverage is incomplete — SQLi and XSS rules are disabled.",
  "• No sensitive files are publicly exposed.",
  "• Security headers are absent — acceptable for local-only deployment.",
  "",
  "[VERIFY] ──────────────────────────────────────────────",
  "[VERIFY] Probe sequence complete.",
  "[VERIFY] 8 controls verified | 7 advisories | 0 failures",
  "[VERIFY] All probes read-only. No system state was modified.",
].join("\n");

test.beforeEach(async ({ page }) => {
  await page.route("/api/heartbeat", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_HEARTBEAT),
    }),
  );
});

// ── Button state ──────────────────────────────────────────────────
test("Commence Probe button is enabled and visible before probe starts", async ({
  page,
}) => {
  await page.goto("/console");
  const btn = page.getByRole("button", { name: /commence probe/i });
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
});

// ── Probe flow ────────────────────────────────────────────────────
test("clicking Commence Probe streams output to the terminal", async ({
  page,
}) => {
  await page.route("/api/red-team/run", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: MOCK_PROBE_OUTPUT,
    }),
  );

  await page.goto("/console");
  await page.getByRole("button", { name: /commence probe/i }).click();

  await expect(
    page.getByText("[PROBE] Initiating red team probe sequence..."),
  ).toBeVisible({
    timeout: 10_000,
  });
});

test("[ASSESS] phase output appears in terminal", async ({ page }) => {
  await page.route("/api/red-team/run", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: MOCK_PROBE_OUTPUT,
    }),
  );

  await page.goto("/console");
  await page.getByRole("button", { name: /commence probe/i }).click();

  await expect(
    page.getByText("[ASSESS] Forwarding findings to AI analyst..."),
  ).toBeVisible({
    timeout: 10_000,
  });
});

test("[VERIFY] summary appears after probe completes", async ({ page }) => {
  await page.route("/api/red-team/run", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: MOCK_PROBE_OUTPUT,
    }),
  );

  await page.goto("/console");
  await page.getByRole("button", { name: /commence probe/i }).click();

  await expect(page.getByText("[VERIFY] Probe sequence complete.")).toBeVisible(
    {
      timeout: 10_000,
    },
  );
});

test("RED_TEAM_REPORT terminal header activates with violet styling after probe", async ({
  page,
}) => {
  await page.route("/api/red-team/run", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: MOCK_PROBE_OUTPUT,
    }),
  );

  await page.goto("/console");
  await page.getByRole("button", { name: /commence probe/i }).click();

  // After output appears the RED_TEAM_REPORT label switches to violet (text-violet-400)
  const reportHeader = page.getByText("RED_TEAM_REPORT");
  await expect(reportHeader).toBeVisible({ timeout: 10_000 });
  await expect(reportHeader).toHaveClass(/text-violet-400/);
});

// ── Offline resilience ────────────────────────────────────────────
test("probe shows error message when route is unreachable", async ({
  page,
}) => {
  await page.route("/api/red-team/run", (route) =>
    route.fulfill({ status: 500, body: "" }),
  );

  await page.goto("/console");
  await page.getByRole("button", { name: /commence probe/i }).click();

  await expect(page.getByText(/Red Team Engine offline/i)).toBeVisible({
    timeout: 10_000,
  });
});
