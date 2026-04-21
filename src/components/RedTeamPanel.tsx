"use client";

import { memo, useEffect, useRef } from "react";
import { Target, Loader2, ChevronRight, ShieldAlert } from "lucide-react";
import { AegisCard } from "@/components/ui/AegisCard";
import { AegisButton } from "@/components/ui/AegisButton";
import { CardHeader } from "@/components/ui/CardHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import SystemLabel from "@/components/ui/SystemLabel";
import { useRedTeam } from "@/hooks/useAegis";

function RedTeamPanel() {
  const { output, running, status, commence } = useRedTeam();
  const scrollRef = useRef<HTMLPreElement>(null);

  // Auto-scroll to bottom as output streams in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  const STATUS_CONFIG: Record<string, { label: string; type: any; pulse?: boolean }> = {
    STANDBY: { label: "Standby", type: "default" },
    PROBING: { label: "Probing", type: "default", pulse: true },
    ASSESSING: { label: "Assessing", type: "default", pulse: true },
    VERIFYING: { label: "Verifying", type: "default", pulse: true },
    VERIFIED: { label: "Verified", type: "emerald" },
    DRIFT_DETECTED: { label: "Drift Detected", type: "red" },
    ABORTED: { label: "Aborted", type: "amber" },
  };

  const { label, type, pulse } = STATUS_CONFIG[status];

  return (
    <AegisCard className="flex flex-col min-h-[400px]">
      <CardHeader
        title="Red Team: Probe Sequence"
        icon={Target}
        rightElement={<StatusBadge label={label} type={type} pulse={pulse} size="md" />}
      />

      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="text-[12px] font-medium text-slate-600 leading-relaxed max-w-[500px]">
          Probe → Assess → Verify. Read-only probes against this edge node.
          <br />
          No writes, no exploits, no network egress.
        </p>
        <AegisButton
          label={
            running ? (status === "VERIFYING" ? "Verifying..." : "Probing...") : "Commence Probe"
          }
          icon={running ? Loader2 : ChevronRight}
          loading={running}
          disabled={running}
          onClick={commence}
          size="sm"
        />
      </div>

      <div
        className={`flex-1 mt-2 rounded-lg border ${output ? "border-violet-500/30 shadow-[0_0_25px_-12px_rgba(139,92,246,0.2)]" : "border-slate-800/60"} bg-[#0c1222] flex flex-col overflow-hidden h-[400px]`}
      >
        <div
          className={`flex items-center gap-2.5 px-5 py-4 border-b ${output ? "border-violet-500/10" : "border-slate-800/40"} sticky top-0 bg-[#0c1222] z-10 flex-shrink-0`}
        >
          <div
            className={`h-2 w-2 rounded-full ${output ? "bg-violet-400" : "bg-slate-700"} ${running ? "animate-pulse" : ""}`}
          />
          <span
            className={`text-[11px] font-black uppercase tracking-[0.25em] ${output ? "text-violet-400" : "text-slate-500"}`}
          >
            RED_TEAM_REPORT
          </span>
        </div>

        <pre
          ref={scrollRef}
          className="px-5 pb-5 pt-3 text-[10px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap overflow-y-auto custom-scrollbar flex-1"
        >
          {output || (
            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
              <Target className="h-8 w-8 text-slate-700" />
              <SystemLabel>Awaiting sequence initialization...</SystemLabel>
            </div>
          )}
          {running && <span className="animate-pulse text-violet-400 font-bold">▋</span>}
        </pre>
      </div>
    </AegisCard>
  );
}

export default memo(RedTeamPanel);
