import { test, expect } from "@playwright/test";
import { MOCK_HEARTBEAT } from "./fixtures/mock-heartbeat";

test.beforeEach(async ({ page }) => {
  await page.route("/api/heartbeat", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_HEARTBEAT),
    }),
  );
});

// ── Header ────────────────────────────────────────────────────────
test("console page loads and Aegis header is visible", async ({ page }) => {
  await page.goto("/console");
  await expect(page.getByText("Aegis Node")).toBeVisible();
  await expect(page.getByText(/Edge Remediation Grid/i)).toBeVisible();
});

test("Return to Hub nav link is present", async ({ page }) => {
  await page.goto("/console");
  await expect(page.getByRole("link", { name: /return to hub/i })).toBeVisible();
});

// ── Metric cards ──────────────────────────────────────────────────
test("Shield Integrity metric card renders", async ({ page }) => {
  await page.goto("/console");
  await expect(page.getByText("Shield Integrity")).toBeVisible();
  await expect(page.getByText("CPU Utilization")).toBeVisible();
});

test("Adaptive Response metric card renders", async ({ page }) => {
  await page.goto("/console");
  await expect(page.getByText("Adaptive Response")).toBeVisible();
  await expect(page.getByText("Unified Memory")).toBeVisible();
});

test("Active Alerts metric card renders", async ({ page }) => {
  await page.goto("/console");
  await expect(page.getByText("Active Alerts")).toBeVisible();
  await expect(page.getByText(/Edge \+ Cloud Alerts/i)).toBeVisible();
});

// ── Feature cards ─────────────────────────────────────────────────
test("Red Team panel is visible with Standby status", async ({ page }) => {
  await page.goto("/console");
  await expect(page.getByText("Red Team: Probe Sequence")).toBeVisible();
  await expect(page.getByRole("button", { name: /commence probe/i })).toBeVisible();
});

test("Adaptive Shielding card is visible", async ({ page }) => {
  await page.goto("/console");
  await expect(page.getByText("Adaptive Shielding")).toBeVisible();
});

test("Initialize Patch button is visible", async ({ page }) => {
  await page.goto("/console");
  await expect(page.getByRole("button", { name: /initialize patch/i })).toBeVisible();
});
