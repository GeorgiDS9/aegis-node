import { useState, memo } from "react";
import { Cpu, Cloud, ChevronRight, Loader2, WifiOff, ShieldAlert, Zap } from "lucide-react";
import type { ScanAlert, VanguardFeedResult, KineticCommand } from "@/types/aegis";
import { useStreamingAI } from "@/hooks/useAegis";
import { logRemediation } from "@/actions/vault";
import { buildKineticCommands } from "@/lib/kinetic-bridge";

// ── UI Atoms ───────────────────────────────────────────────────────
import { StatusBadge } from "./ui/StatusBadge";
import { AegisButton } from "./ui/AegisButton";
import { CardHeader } from "./ui/CardHeader";
import { SeverityTag } from "./ui/SeverityTag";

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
  const [mitigatedIds, setMitigatedIds] = useState<Set<string>>(new Set());

  const handleExecute = async (alert: ScanAlert) => {
    await streamQuery(
      alert.id,
      `[EDGE ALERT]\nFile: ${alert.file}\nType: ${alert.type}\nMessage: ${alert.message}\n\nGenerate a concise remediation plan for this system drift.`,
      () => {},
      async () => {
        await logRemediation({
          id: `EDGE-${alert.id}-${Date.now()}`,
          cve_id: alert.id,
          target: alert.file,
          action: `Remediated: ${alert.message}`,
          risk: alert.type === "critical" ? "CRITICAL" : "HIGH",
          outcome: "resolved",
          source: "EDGE",
          timestamp: new Date().toISOString(),
        });
        
        setTimeout(() => {
          setMitigatedIds(prev => new Set([...prev, alert.id]));
        }, 3000);
      },
    );
  };

  const activeAlerts = edgeAlerts.filter(a => !mitigatedIds.has(a.id));

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
      {/* ── LEFT PANEL: EDGE QUEUE ─────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-xl h-full flex flex-col min-h-[400px]">
        <CardHeader 
          title={`Edge Queue: ${chipModel}`}
          icon={Cpu}
          rightElement={<StatusBadge label="Local-Only" type="default" />}
        />

        <div className="space-y-3 flex-1 pr-2 overflow-y-auto custom-scrollbar">
          {activeAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 opacity-40">
              <Cpu className="h-8 w-8 text-slate-700" />
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                No active threats
              </p>
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <div key={alert.id} className="mb-3 last:mb-0">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex justify-between items-center group hover:border-violet-500/30 transition-all">
                  <div className="min-w-0 pr-4 space-y-1.5" onClick={() => plans[alert.id] && toggleExpand(alert.id)}>
                    <div className="flex items-center gap-2.5">
                      <p className="text-[12px] font-black text-white uppercase tracking-widest leading-none">
                        {alert.type === "critical" ? "INTEGRITY_BREACH" : "SUSPICIOUS_DRIFT"}
                      </p>
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        alert.type === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                        'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse'
                      }`} />
                    </div>
                    <p className="text-[13px] font-bold text-slate-300 capitalize">
                      {alert.message}
                    </p>
                    <p className="text-[10px] font-mono font-medium text-slate-600 truncate uppercase tracking-widest">
                      {alert.file.split("/").slice(-3).join("/") || alert.file}
                    </p>
                  </div>
                  <AegisButton 
                    label="Fix" 
                    icon={streamingIds.has(alert.id) ? Loader2 : ChevronRight}
                    loading={streamingIds.has(alert.id)}
                    onClick={() => handleExecute(alert)}
                  />
                </div>
                
                {plans[alert.id] !== undefined && !expanded.has(alert.id) && (
                  <button 
                    onClick={() => toggleExpand(alert.id)}
                    className="w-full flex justify-center pt-1.5 pb-0.5 group/toggle"
                    aria-label="Expand remediation plan"
                  >
                    <div className="w-6 h-[1px] rounded-full bg-violet-600/15 group-hover/toggle:bg-violet-400/30 group-hover/toggle:w-10 transition-all duration-700" />
                  </button>
                )}

                {plans[alert.id] !== undefined && expanded.has(alert.id) && (
                  <div className="mt-4 rounded-lg border border-violet-500/30 bg-[#0c1222] px-5 pb-5 shadow-[0_0_25px_-12px_rgba(139,92,246,0.2)] max-h-[500px] overflow-y-auto custom-scrollbar relative">
                    <div 
                      className="flex items-center justify-between mb-4 pb-3 border-b border-violet-500/10 sticky top-0 bg-[#0c1222] z-10 pt-4 cursor-pointer group/header"
                      onClick={() => toggleExpand(alert.id)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-2 w-2 rounded-full bg-violet-400 ${streamingIds.has(alert.id) ? 'animate-pulse' : ''}`} />
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-400">
                          Remediation_Protocol
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover/header:text-violet-400 transition-transform rotate-90" />
                    </div>
                    <p className="text-[11px] font-medium text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                      {plans[alert.id] || "Analyzing system state... ▋"}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: CLOUD QUEUE ─────────────────────────────── */}
      {(() => {
        const kineticCmds = buildKineticCommands(vanguardFeed.alerts);
        return (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-xl h-full flex flex-col min-h-[400px]">
            <CardHeader 
              title="Cloud Queue: Vanguard Agent"
              icon={Cloud}
              rightElement={
                <StatusBadge 
                  label={vanguardFeed.connected ? "Live" : "Offline"} 
                  type={vanguardFeed.connected ? "emerald" : "default"}
                  icon={vanguardFeed.connected ? undefined : WifiOff}
                  pulse={vanguardFeed.connected}
                />
              }
            />

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
              {!vanguardFeed.connected ? (
                <div className="flex flex-col items-center justify-center py-16 gap-5">
                  <div className="h-12 w-12 rounded-full border border-slate-800 flex items-center justify-center">
                    <WifiOff className="h-6 w-6 text-slate-700" />
                  </div>
                  <div className="text-center">
                    <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest">
                      Node Disconnected
                    </p>
                    {vanguardFeed.error && (
                      <p className="text-[10px] font-mono text-slate-700 mt-2 max-w-[250px] break-words uppercase">
                        {vanguardFeed.error}
                      </p>
                    )}
                  </div>
                </div>
              ) : vanguardFeed.alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 opacity-40">
                  <Cloud className="h-8 w-8 text-slate-700" />
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                    No active threats
                  </p>
                </div>
              ) : (
                vanguardFeed.alerts.map((alert) => {
                  const cmd = kineticCmds.find((c) => c.alertId === alert.id);
                  const isAuthorized = authorizedIds.has(alert.id);
                  return (
                    <div key={alert.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center gap-2.5">
                            <SeverityTag level={alert.type} />
                            {alert.source_ip && (
                              <span className="text-[11px] font-mono font-bold text-slate-600">{alert.source_ip}</span>
                            )}
                          </div>
                          <p className="text-[14px] font-bold text-slate-300 leading-snug">{alert.message}</p>
                        </div>
                        {cmd && (
                          <AegisButton 
                            label={isAuthorized ? "Authorized" : "Authorize"}
                            icon={isAuthorized ? ShieldAlert : ChevronRight}
                            variant={isAuthorized ? "primary" : "outline"}
                            onClick={() => onAuthorize({ ...cmd, authorized: !isAuthorized })}
                            className={isAuthorized ? '!bg-emerald-600/20 !border-emerald-500/30 !text-emerald-400 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]' : ''}
                          />
                        )}
                      </div>
                      {cmd && (
                        <div className="rounded-lg bg-slate-950 px-4 py-2.5 border border-slate-800/60 shadow-inner group/code">
                          <code className="text-[11px] font-mono text-violet-400/80 break-all leading-relaxed">
                            <span className="text-slate-700 mr-2 group-hover/code:text-violet-500 transition-colors">$</span>
                            {cmd.command}
                          </code>
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
