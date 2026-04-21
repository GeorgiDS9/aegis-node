"use server";

import path from "path";
import { promises as fs } from "fs";
import { cookies } from "next/headers";
import { WAF_RULES, WAF_COOKIE_NAME } from "@/constants/waf-rules";

const CONFIG_PATH = path.resolve(process.cwd(), "data/.waf-config.json");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // localhost — no TLS
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function getWafConfig(): Promise<Record<string, boolean>> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    // File doesn't exist yet — all rules default off (safe)
    return Object.fromEntries(WAF_RULES.map((r) => [r.id, false]));
  }
}

export async function saveWafConfig(state: Record<string, boolean>): Promise<void> {
  try {
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(state), "utf-8");
    const jar = await cookies();
    jar.set(WAF_COOKIE_NAME, JSON.stringify(state), COOKIE_OPTIONS);
  } catch (err) {
    console.error("[WAF] Config save failed:", err);
  }
}
