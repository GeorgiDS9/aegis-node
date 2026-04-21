/**
 * Kinetic Bridge — translates Vanguard cloud alerts into local pfctl commands.
 *
 * SAFETY: This module only BUILDS command strings. It does NOT execute them.
 * Execution requires explicit HITL (Human-in-the-Loop) authorization in the UI.
 */

import type { VanguardAlert, KineticCommand } from "@/types/aegis";

const RISK_MAP: Record<VanguardAlert["type"], KineticCommand["risk"]> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  info: "MEDIUM",
};

export function buildKineticCommands(alerts: VanguardAlert[]): KineticCommand[] {
  return alerts
    .filter((a) => a.type !== "info")
    .map((alert) => {
      const { command, description } = deriveCommand(alert);
      return {
        alertId: alert.id,
        command,
        description,
        risk: RISK_MAP[alert.type],
        authorized: false,
      };
    });
}

function deriveCommand(alert: VanguardAlert): { command: string; description: string } {
  const ip = alert.source_ip;

  switch (alert.category) {
    case "ip_threat":
    case "port_scan":
    case "auth_failure":
      if (ip) {
        return {
          command: `pfctl -t aegis_blocklist -T add ${ip}`,
          description: `Block ${ip} — ${alert.message}`,
        };
      }
      break;

    case "malware": {
      const target = ip ?? alert.target ?? "unknown";
      return {
        command: `pfctl -t aegis_quarantine -T add ${target}`,
        description: `Quarantine ${target} — ${alert.message}`,
      };
    }
  }

  return {
    command: `# Manual review: ${alert.message}`,
    description: alert.message,
  };
}
