import { getHardwareMetrics }  from "@/actions/metrics";
import { scanWatchFolder }     from "@/actions/scanner";
import { initVault }           from "@/actions/vault";
import { getFirewallStatus }   from "@/actions/firewall";
import ConsoleClient from "./ConsoleClient";

export const dynamic = "force-dynamic";

export default async function ConsolePage() {
  const [metrics, edgeAlerts, firewall] = await Promise.all([
    getHardwareMetrics(),
    scanWatchFolder(),
    initVault().then(() => getFirewallStatus()),
  ]);

  return (
    <ConsoleClient
      initialMetrics={metrics}
      initialAlerts={edgeAlerts}
      initialFirewall={firewall}
    />
  );
}
