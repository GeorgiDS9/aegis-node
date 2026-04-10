"use client";

import { memo } from "react";
import { Cpu, Cloud, ChevronRight, Loader2, WifiOff, ShieldAlert } from "lucide-react";
import type { ScanAlert, VanguardFeedResult, KineticCommand } from "@/types/aegis";
import { useStreamingAI } from "@/hooks/useAegis";
import { logRemediation } from "@/actions/vault";
import { buildKineticCommands } from "@/lib/kinetic-bridge";

interface Props {
  edgeAlerts: ScanAlert[];
  vanguardFeed: VanguardFeedResult;
  chipModel: string;
  onAuthorize: (cmd: KineticCommand) => void;
  authorizedIds: Set<string>;
}

function RemediationQueue({
  edgeAlerts,
  vanguardFeed,
  chipModel,
  onAuthorize,
  authorizedIds,
}: Props) {
  const { streamingIds, plans, expanded, streamQuery, toggleExpand } = useStreamingAI();

  const handleExecute = async (alert: ScanAlert) => {
    // Global streamQuery now handles state pushing and auto-expansion
    await streamQuery(
      alert.id,
      `[EDGE ALERT]\nFile: ${alert.file}\nType: ${alert.type}\nMessage: ${alert.message}\n\nGenerate a concise remediation plan for this file system drift. Be technical and actionable.`,
      () => {}, // Local chunk updates no longer needed, global store handles it
      async () => {
        await logRemediation({
          id: `EDGE-${alert.id}-${Date.now()}`,
          cve_id: alert.type === "critical" ? "CVE-DRIFT-CRIT" : "CVE-DRIFT-WARN",
          target: alert.file.split("/").pop() || "unknown",
          action: `Remediated: ${alert.message}`,
          risk: alert.type === "critical" ? "CRITICAL" : "HIGH",
          outcome: "resolved",
          source: "EDGE",
          timestamp: new Date().toISOString(),
        });
      },
    );
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
      {/* ── LEFT PANEL: EDGE ASSETS ───────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-xl h-full flex flex-col min-h-[400px]">
        <div className="mb-6 flex items-center justify-between border-b border-slate-800/60 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Cpu className="h-4 w-4 text-violet-400" />
              {streamingIds.size > 0 && (
                <div className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              )}
            </div>
            <h3 className="text-xs font-black tracking-widest uppercase text-white">
              Edge Queue: {chipModel}
            </h3>
          </div>
          <span className="text-[9px] font-bold text-violet-400 uppercase px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
            Local-Only
          </span>
        </div>

        <div className="space-y-3 flex-1 pr-2">
          {edgeAlerts.length === 0 ? (
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center py-8">
              Watch Folder Nominal
            </p>
          ) : (
            edgeAlerts.map((alert) => (
              <div key={alert.id} className="mb-3 last:mb-0">
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex justify-between items-center group hover:border-violet-500/30 transition-all">
                  <div className="min-w-0 pr-3 space-y-0.5" onClick={() => plans[alert.id] && toggleExpand(alert.id)}>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">
                        {alert.type === "critical"
                          ? "THREAT_CRITICAL_ALRT"
                          : alert.type === "warning"
                            ? "SUSPICIOUS_DRIFT_WARN"
                            : "SYSTEM_NOMINAL"}
                      </p>
                      <div className={`h-1 w-1 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)] ${
                        alert.type === 'critical' ? 'bg-red-500 shadow-red-500/50' : 
                        alert.type === 'warning' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                      }`} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 capitalize">
                      {alert.message}
                    </p>
                    <p className="text-[9px] font-medium text-slate-600 truncate">
                      {alert.file.split("/").slice(-3).join("/")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleExecute(alert)}
                    disabled={streamingIds.has(alert.id)}
                    className="flex-shrink-0 flex items-center gap-1.5 rounded px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300
                      enabled:bg-violet-600 enabled:text-white enabled:shadow-[0_0_15px_rgba(139,92,246,0.3)] enabled:hover:bg-violet-500 enabled:hover:shadow-[0_0_20_rgba(139,92,246,0.5)] enabled:active:scale-95
                      disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {streamingIds.has(alert.id) ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expanded.has(alert.id) ? 'rotate-90' : ''}`} />
                    )}
                    Fix
                  </button>
                </div>

                {plans[alert.id] !== undefined && expanded.has(alert.id) && (
                  <div className="mt-3 rounded-lg border border-violet-500/30 bg-[#0c1222] px-4 py-3 shadow-[0_0_25px_-12px_rgba(139,92,246,0.2)] max-h-[500px] overflow-y-auto custom-scrollbar relative">
                    <div 
                      className="flex items-center justify-between mb-3 pb-2 border-b border-violet-500/10 sticky top-0 bg-[#0c1222] z-10 pt-1 cursor-pointer group/header"
                      onClick={() => toggleExpand(alert.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full bg-violet-400 ${streamingIds.has(alert.id) ? 'animate-pulse' : ''}`} />
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-violet-400">
                          Remediation_Protocol
                        </span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-600 group-hover/header:text-violet-400 transition-transform rotate-90" />
                    </div>
                    <p className="text-[11px] font-medium text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {plans[alert.id] || "Analyzing system state... ▋"}
                    </p>
                  </div>
                )}

                {plans[alert.id] !== undefined && !expanded.has(alert.id) && (
                  <div 
                    className="mt-2 py-2 flex justify-center cursor-pointer group/collapsed"
                    onClick={() => toggleExpand(alert.id)}
                  >
                    <div className="h-0.5 w-14 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.3)] animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] group-hover/collapsed:bg-violet-400 group-hover/collapsed:shadow-[0_0_12px_rgba(139,92,246,0.7)] group-hover/collapsed:scale-110 transition-all duration-300" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: CLOUD GRID (VANGUARD) ───────────────────── */}
      {(() => {
        const kineticCmds = buildKineticCommands(vanguardFeed.alerts);
        const ALERT_TYPE_COLOR: Record<string, string> = {
          critical: "text-red-400 border-red-500/30 bg-red-500/10",
          high:     "text-amber-400 border-amber-500/30 bg-amber-500/10",
          medium:   "text-blue-400 border-blue-500/30 bg-blue-500/10",
          info:     "text-slate-500 border-slate-700/30 bg-slate-700/10",
        };
        return (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-xl h-full flex flex-col min-h-[400px]">
            <div className="mb-6 flex items-center justify-between border-b border-slate-800/60 pb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Cloud className="h-4 w-4 text-blue-400" />
                <h3 className="text-xs font-black tracking-widest uppercase text-white">
                  Cloud Grid: Vanguard
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {vanguardFeed.connected ? (
                  <span className="text-[9px] font-bold text-emerald-400 uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Live
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-700/20 border border-slate-700/40 flex items-center gap-1">
                    <WifiOff className="h-2.5 w-2.5" />
                    Offline
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {!vanguardFeed.connected ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="h-10 w-10 rounded-full border border-slate-800 flex items-center justify-center">
                    <WifiOff className="h-5 w-5 text-slate-700" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Vanguard Unreachable
                    </p>
                    {vanguardFeed.error && (
                      <p className="text-[9px] font-mono text-slate-700 mt-1 max-w-[200px] break-words">
                        {vanguardFeed.error}
                      </p>
                    )}
                  </div>
                </div>
              ) : vanguardFeed.alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Cloud className="h-6 w-6 text-slate-700" />
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                    No active threats
                  </p>
                </div>
              ) : (
                vanguardFeed.alerts.map((alert) => {
                  const cmd = kineticCmds.find((c) => c.alertId === alert.id);
                  const isAuthorized = authorizedIds.has(alert.id);
                  return (
                    <div key={alert.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${ALERT_TYPE_COLOR[alert.type] ?? ALERT_TYPE_COLOR.info}`}>
                              {alert.type.toUpperCase()}
                            </span>
                            {alert.source_ip && (
                              <span className="text-[8px] font-mono text-slate-500">{alert.source_ip}</span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-slate-300 leading-snug">{alert.message}</p>
                        </div>
                        {cmd && (
                          <button
                            onClick={() => onAuthorize({ ...cmd, authorized: !isAuthorized })}
                            className={`flex-shrink-0 flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${
                              isAuthorized
                                ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-400"
                                : "bg-slate-800 border border-slate-700 text-slate-400 hover:border-violet-500/40 hover:text-violet-400"
                            }`}
                          >
                            {isAuthorized
                              ? <><ShieldAlert className="h-3 w-3" />Authorized</>
                              : <><ChevronRight className="h-3 w-3" />Authorize</>
                            }
                          </button>
                        )}
                      </div>
                      {cmd && (
                        <div className="rounded bg-slate-950/80 px-3 py-1.5 border border-slate-800/60">
                          <code className="text-[9px] font-mono text-violet-400/70 break-all">{cmd.command}</code>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}
    </section>
  );
}

export default memo(RemediationQueue);
