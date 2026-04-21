import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const AUTH_FILE = path.join(__dirname, ".auth/session.json");

/**
 * Logs in once via the HMAC session API and saves the auth cookie so all
 * specs can start pre-authenticated without repeating the login flow.
 */
setup("authenticate", async ({ request }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const pin = process.env.AEGIS_OPERATOR_PIN ?? "aegis-e2e-test";

  const res = await request.post("/api/auth/login", {
    data: { pin },
  });

  expect(
    res.status(),
    `Login failed (${res.status()}) — is AEGIS_OPERATOR_PIN set correctly?`,
  ).toBe(200);

  await request.storageState({ path: AUTH_FILE });
});
