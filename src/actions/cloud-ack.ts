"use server";

import fs from "fs/promises";
import path from "path";

const ACK_FILE = path.resolve(process.cwd(), "data/.cloud-acknowledged.json");
const TWENTY_FOUR_H = 24 * 60 * 60 * 1000;

interface AckEntry {
  id: string;
  acknowledgedAt: string;
}

async function readAckFile(): Promise<AckEntry[]> {
  try {
    const raw = await fs.readFile(ACK_FILE, "utf-8");
    return JSON.parse(raw) as AckEntry[];
  } catch {
    return [];
  }
}

async function writeAckFile(entries: AckEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(ACK_FILE), { recursive: true });
  await fs.writeFile(ACK_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

/**
 * Persist a list of cloud alert IDs as acknowledged.
 * Deduplicates and trims entries older than 24h on every write.
 */
export async function acknowledgeCloudAlerts(ids: string[]): Promise<void> {
  const now = Date.now();
  const existing = (await readAckFile()).filter(
    (e) => now - new Date(e.acknowledgedAt).getTime() < TWENTY_FOUR_H,
  );

  const existingIds = new Set(existing.map((e) => e.id));
  const newEntries: AckEntry[] = ids
    .filter((id) => !existingIds.has(id))
    .map((id) => ({ id, acknowledgedAt: new Date().toISOString() }));

  await writeAckFile([...existing, ...newEntries]);
}

/**
 * Returns the set of cloud alert IDs acknowledged within the last 24h.
 */
export async function getAcknowledgedCloudIds(): Promise<string[]> {
  const now = Date.now();
  const entries = await readAckFile();
  return entries
    .filter((e) => now - new Date(e.acknowledgedAt).getTime() < TWENTY_FOUR_H)
    .map((e) => e.id);
}
