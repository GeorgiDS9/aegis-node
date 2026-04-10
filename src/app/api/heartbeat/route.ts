import { NextResponse } from "next/server";
import { scanWatchFolder } from "@/actions/scanner";
import { getHardwareMetrics } from "@/actions/metrics";
import { getFirewallStatus } from "@/actions/firewall";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [alerts, metrics, firewall] = await Promise.all([
      scanWatchFolder(),
      getHardwareMetrics(),
      getFirewallStatus(),
    ]);

    return NextResponse.json({
      alerts,
      metrics,
      firewall,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Heartbeat Failure:", err);
    return NextResponse.json({ error: "Pulse Interrupted" }, { status: 500 });
  }
}
