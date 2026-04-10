import { getHardwareMetrics }  from "@/actions/metrics";
import { scanWatchFolder }     from "@/actions/scanner";
import { initVault, getDefenseLogs } from "@/actions/vault";
import { getFirewallStatus }   from "@/actions/firewall";
import { fetchThreatFeed }     from "@/actions/vanguard";
import ConsoleClient from "./ConsoleClient";

export const dynamic = "force-dynamic";

export default async function ConsolePage() {
  const [metrics, edgeAlerts, firewall, vanguardFeed, logs] = await Promise.all([
    getHardwareMetrics(),
    scanWatchFolder(),
    initVault().then(() => getFirewallStatus()),
    fetchThreatFeed(),
    getDefenseLogs(),
  ]);

  // Persistent Filtering: Strip alerts that already have a remediation entry in the Vault within 24h
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  
  const mitigatedIds = new Set(
    logs
      .filter(log => (now - new Date(log.timestamp).getTime()) < TWENTY_FOUR_HOURS)
      .map(log => log.cve_id)
  );
  
  const filteredVanguard = {
    ...vanguardFeed,
    alerts: vanguardFeed.alerts.filter(alert => !mitigatedIds.has(alert.id))
  };

  const filteredEdgeAlerts = edgeAlerts.filter(alert => !mitigatedIds.has(alert.id));

  return (
    <ConsoleClient
      initialMetrics={metrics}
      initialAlerts={filteredEdgeAlerts}
      initialFirewall={firewall}
      vanguardFeed={filteredVanguard}
    />
  );
}
