import { NextResponse } from "next/server";
import { scanWatchFolder } from "@/actions/scanner";
import { getHardwareMetrics } from "@/actions/metrics";
import { getFirewallStatus } from "@/actions/firewall";
import { fetchThreatFeed } from "@/actions/vanguard";
import { getDefenseLogs } from "@/actions/vault";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Collect all sensors independently to ensure one failure doesn't crash the pulse
    const [alerts, metrics, firewall, vanguard, logs] = await Promise.all([
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
          chipModel: "Silicon_Unknown" 
        };
      }),
      getFirewallStatus().catch((err) => {
        console.error("Firewall Sensor Failure:", err);
        return { 
          enabled: false, 
          interfaces: [], 
          rawOutput: "", 
          error: "Sensor Restricted" 
        };
      }),
      fetchThreatFeed().catch((err) => {
        console.error("Vanguard Bridge Failure:", err);
        return { 
          connected: false, 
          alerts: [], 
          error: "Vanguard Bridge Offline", 
          fetchedAt: new Date().toISOString() 
        };
      }),
      getDefenseLogs().catch(() => []),
    ]);

    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    // Persistent Filtering: Strip alerts mitigated within the last 24h
    const mitigatedIds = new Set(
      logs
        .filter(log => (now - new Date(log.timestamp).getTime()) < TWENTY_FOUR_HOURS)
        .map(log => log.cve_id)
    );

    const filteredVanguard = {
      ...vanguard,
      alerts: vanguard.alerts.filter(alert => !mitigatedIds.has(alert.id))
    };

    const filteredEdgeAlerts = alerts.filter(alert => !mitigatedIds.has(alert.id));

    return NextResponse.json({
      alerts: filteredEdgeAlerts,
      metrics,
      firewall,
      vanguard: filteredVanguard,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Critical Heartbeat Failure:", err);
    // Use standard Response for emergency fallback if NextResponse is somehow compromised
    return new Response(JSON.stringify({ error: "Pulse Failure" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
