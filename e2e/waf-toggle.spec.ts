import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { MOCK_HEARTBEAT } from "./fixtures/mock-heartbeat";

test.beforeEach(async ({ page }) => {
  // Clear persistent WAF disk state to ensure clean test environment.
  // AdaptiveShield automatically syncs this clean disk state over to the cookie on mount.
  try {
    fs.unlinkSync(path.resolve(process.cwd(), "data/.waf-config.json"));
  } catch {}

  await page.route("/api/heartbeat", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_HEARTBEAT),
    }),
  );
});

// ── Initial state ─────────────────────────────────────────────────
test("all WAF rules start disabled — counter shows 0/5 On", async ({ page }) => {
  await page.goto("/console");
  // ConsoleClient initialises all rules to false
  await expect(page.getByText("0/5 On")).toBeVisible();
});

test("all five rule labels are visible", async ({ page }) => {
  await page.goto("/console");
  await expect(page.getByText("Block SQL Injection")).toBeVisible();
  await expect(page.getByText("Block XSS Vectors")).toBeVisible();
  await expect(page.getByText("Block Path Traversal")).toBeVisible();
  await expect(page.getByText("Detect Bot Signatures")).toBeVisible();
  await expect(page.getByText("Rate Limit IP")).toBeVisible();
});

// ── Toggle interaction ────────────────────────────────────────────
test("enabling a rule increments the active counter to 1/5 On", async ({ page }) => {
  await page.goto("/console");

  await page.getByRole("button", { name: /enable block sql injection/i }).click();

  await expect(page.getByText("1/5 On")).toBeVisible({ timeout: 8_000 });
});

test("toggling a rule appends an entry to the Transmission Log", async ({ page }) => {
  await page.goto("/console");

  await page.getByRole("button", { name: /enable block xss vectors/i }).click();

  await expect(page.getByText(/▲ ENFORCE Block XSS Vectors/i)).toBeVisible({ timeout: 8_000 });
});

test("enabling then disabling a rule restores counter to 0/5 On", async ({ page }) => {
  await page.goto("/console");

  await page.getByRole("button", { name: /enable block sql injection/i }).click();
  // Wait for server action to complete — aria-label flips once loggingRule clears
  await expect(page.getByRole("button", { name: /disable block sql injection/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("1/5 On")).toBeVisible();

  await page.getByRole("button", { name: /disable block sql injection/i }).click();
  await expect(page.getByRole("button", { name: /enable block sql injection/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("0/5 On")).toBeVisible();
});

test("disabling a rule appends a SUSPEND entry to the Transmission Log", async ({ page }) => {
  await page.goto("/console");

  // Enable first — wait for server action to complete
  await page.getByRole("button", { name: /enable block path traversal/i }).click();
  await expect(page.getByRole("button", { name: /disable block path traversal/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("1/5 On")).toBeVisible();

  // Then disable
  await page.getByRole("button", { name: /disable block path traversal/i }).click();
  await expect(page.getByText(/▼ SUSPEND Block Path Traversal/i)).toBeVisible({ timeout: 15_000 });
});
