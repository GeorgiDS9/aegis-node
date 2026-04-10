import { getHardwareMetrics }  from "@/actions/metrics";
import { scanWatchFolder }     from "@/actions/scanner";
import { initVault }           from "@/actions/vault";
import { getFirewallStatus }   from "@/actions/firewall";
import { fetchThreatFeed }     from "@/actions/vanguard";
import ConsoleClient from "./ConsoleClient";

export const dynamic = "force-dynamic";

export default async function ConsolePage() {
  const [metrics, edgeAlerts, firewall, vanguardFeed] = await Promise.all([
    getHardwareMetrics(),
    scanWatchFolder(),
    initVault().then(() => getFirewallStatus()),
    fetchThreatFeed(),
  ]);

  return (
    <ConsoleClient
      initialMetrics={metrics}
      initialAlerts={edgeAlerts}
      initialFirewall={firewall}
      vanguardFeed={vanguardFeed}
    />
  );
}
