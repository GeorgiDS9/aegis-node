import { NextResponse } from "next/server";
import { scanWatchFolder } from "@/actions/scanner";
import { getHardwareMetrics } from "@/actions/metrics";
import { getFirewallStatus } from "@/actions/firewall";
import { fetchThreatFeed } from "@/actions/vanguard";
import { getDefenseLogs } from "@/actions/vault";
import { getAcknowledgedCloudIds } from "@/actions/cloud-ack";
import { fetchWithCircuitBreaker } from "@/lib/vanguard-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [alerts, metrics, firewall, vanguard, logs, ackedCloudIds] = await Promise.all([
      scanWatchFolder().catch((err) => {
        console.error("Scanner Sensor Failure:", err);
        return [];
      }),
      getHardwareMetrics().catch((err) => {
        console.error("Hardware Sensor Failure:", err);
        return {
          cpuUsagePercent: 0,
          memoryUsedPercent: 0,
          memoryUsedGB: 0,
          totalMemoryGB: 16,
          chipModel: "Silicon_Unknown",
        };
      }),
      getFirewallStatus().catch(() => ({
        enabled: false,
        interfaces: [],
        rawOutput: "",
        error: "Sensor Restricted",
      })),
      // Circuit breaker: Vanguard gets 1s max — never blocks the pulse
      fetchWithCircuitBreaker(fetchThreatFeed).catch(() => ({
        connected: false,
        alerts: [],
        error: "Vanguard Bridge Offline",
        fetchedAt: new Date().toISOString(),
      })),
      getDefenseLogs().catch(() => []),
      getAcknowledgedCloudIds().catch(() => []),
    ]);

    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    // Suppress edge alerts mitigated in vault within 24h
    const mitigatedIds = new Set(
      logs
        .filter((log) => now - new Date(log.timestamp).getTime() < TWENTY_FOUR_HOURS)
        .map((log) => log.cve_id),
    );

    const filteredEdgeAlerts = alerts.filter((a) => !mitigatedIds.has(a.id));

    // Suppress cloud alerts acknowledged to disk within 24h
    const ackedSet = new Set(ackedCloudIds);
    const filteredVanguard = {
      ...vanguard,
      alerts: vanguard.alerts.filter((a) => !ackedSet.has(a.id)),
    };

    return NextResponse.json({
      alerts: filteredEdgeAlerts,
      metrics,
      firewall,
      vanguard: filteredVanguard,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Critical Heartbeat Failure:", err);
    return NextResponse.json({ error: "Pulse Failure" }, { status: 500 });
  }
}
