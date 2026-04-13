"use client";

import { useState, useCallback } from "react";
import { Shield, Activity, Zap, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAegisPulse } from "@/hooks/useAegis";

import RemediationQueue from "@/components/RemediationQueue";
import DefenseLog from "@/components/DefenseLog";
import VaultSearch from "@/components/VaultSearch";
import PerimeterHealth from "@/components/PerimeterHealth";
import AdaptiveShield from "@/components/AdaptiveShield";
import PatchModal from "@/components/PatchModal";

// ── UI Atoms ───────────────────────────────────────────────────────
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AegisButton } from "@/components/ui/AegisButton";
import { CardHeader } from "@/components/ui/CardHeader";
import { AegisCard } from "@/components/ui/AegisCard";

import type { FirewallStatus, HardwareMetrics, ScanAlert, VanguardFeedResult, KineticCommand, VaultSearchResult } from "@/types/aegis";

interface Props {
  initialMetrics: HardwareMetrics;
  initialAlerts: ScanAlert[];
  initialFirewall: FirewallStatus;
  vanguardFeed: VanguardFeedResult;
  initialLogs: VaultSearchResult[];
  initialWafState: Record<string, boolean>;
}

export default function ConsoleClient({
  initialMetrics,
  initialAlerts,
  initialFirewall,
  vanguardFeed,
  initialLogs,
  initialWafState,
}: Props) {
  const [authorizedCmds, setAuthorizedCmds]     = useState<Map<string, KineticCommand>>(new Map());
  const [patchModalOpen, setPatchModalOpen]      = useState<boolean>(false);
  const [suppressedCloudIds, setSuppressedCloudIds] = useState<Set<string>>(new Set());
  const [showToast, setShowToast]                = useState<boolean>(false);

  const handleAuthorize = useCallback((cmd: KineticCommand) => {
    setAuthorizedCmds((prev) => {
      const next = new Map(prev);
      if (cmd.authorized) next.set(cmd.alertId, cmd);
      else next.delete(cmd.alertId);
      return next;
    });
  }, []);

  const handleDeployment = useCallback((deployedIds: string[]) => {
    setSuppressedCloudIds((prev) => {
      const next = new Set(prev);
      deployedIds.forEach((id) => next.add(id));
      return next;
    });
    setAuthorizedCmds(new Map());
    setPatchModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }, []);

  const authorizedIds = new Set(authorizedCmds.keys());

  const data = useAegisPulse({
    alerts: initialAlerts,
    metrics: initialMetrics,
    firewall: initialFirewall,
    vanguard: vanguardFeed,
  });

  const { alerts, metrics, firewall, vanguard } = data ?? {
    alerts: initialAlerts,
    metrics: initialMetrics,
    firewall: initialFirewall,
    vanguard: vanguardFeed,
  };

  // Immediate client-side suppression after deploy — vault filter handles persistence on refresh
  const filteredVanguard = {
    ...vanguard,
    alerts: vanguard.alerts.filter((a) => !suppressedCloudIds.has(a.id)),
  };

  return (
    <>
    <main className="min-h-screen bg-[#020617] text-slate-100 selection:bg-violet-500/30">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md shadow-lg">
        <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-950/20 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]">
              <Shield className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[12px] font-black tracking-[0.2em] uppercase text-white">
                Aegis Node <span className="text-violet-500">v1.0</span>
              </h2>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Edge Remediation Grid:{" "}
                <span className="text-violet-500">MAC_SILICON // ACTIVE</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-2 group cursor-default">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] group-hover:text-emerald-400 transition-colors">
                Node_Status: Online
              </span>
            </div>

            <nav className="flex items-center gap-3 border-l border-slate-800/60 pl-8">
              <Link
                href="/"
                className="group flex items-center gap-3 px-4 py-2 rounded-md border border-slate-800/60 bg-slate-900/20 transition-all hover:border-violet-500/40 hover:bg-violet-900/10"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-slate-800 group-hover:bg-violet-500 transition-colors" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                  Return to Hub
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── CONSOLE TITLE ──────────────────────────────────────── */}
      <section className="w-full pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 flex items-start justify-between">
          <div className="flex flex-col items-start">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white text-balance leading-[0.8] tracking-[-0.05em]">
              Aegis <span className="text-violet-500">Remediation Grid</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-3">
              Localized System Hardening & Active Response
            </p>
          </div>

          <button 
            onClick={() => setPatchModalOpen(true)}
            className="group relative flex items-center gap-3 rounded-md border border-violet-500/30 bg-violet-600/10 px-5 py-3 transition-all hover:border-violet-500/60 hover:bg-violet-600/20 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]"
          >
            <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Zap className="h-4 w-4 text-violet-400 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col items-start leading-none gap-1.5">
              <span className="text-[11px] font-black tracking-[0.2em] uppercase text-white pointer-events-none">
                Initialize Patch
              </span>
              <span className="text-[7px] font-black text-violet-400/60 uppercase tracking-widest pointer-events-none">
                {authorizedIds.size > 0 ? `${authorizedIds.size} Command${authorizedIds.size > 1 ? "s" : ""} Authorized` : "Deploy Unified Remediation"}
              </span>
            </div>
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 pb-32 space-y-8">
        {/* ── ROW 1: METRIC CARDS ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MetricCard
            icon={<Shield size={15} className="text-violet-400" />}
            label="Shield Integrity"
            value={`${metrics.cpuUsagePercent}%`}
            sub="CPU Utilization"
            percent={metrics.cpuUsagePercent}
            status={metrics.cpuUsagePercent < 70 ? "nominal" : "elevated"}
          />
          <MetricCard
            icon={<Activity size={15} className="text-violet-400" />}
            label="Adaptive Response"
            value={`${metrics.memoryUsedGB} / ${metrics.totalMemoryGB} GB`}
            sub="Unified Memory"
            percent={metrics.memoryUsedPercent}
            status={metrics.memoryUsedPercent < 80 ? "nominal" : "elevated"}
          />
          <MetricCard
            icon={<Zap size={15} className="text-violet-400" />}
            label="Active Alerts"
            value={`${alerts.filter((a: ScanAlert) => a.type !== "info").length + vanguardFeed.alerts.length} ACTIVE`}
            sub="Edge + Cloud Alerts"
            percent={100}
            status="critical"
          />
        </div>

        {/* ── ROW 2: OPERATION GRID (50/50 - Decoupled Height) ─────── */}
        <div className="w-full">
          <RemediationQueue
            edgeAlerts={alerts}
            vanguardFeed={filteredVanguard}
            chipModel={metrics.chipModel}
            onAuthorize={handleAuthorize}
            authorizedIds={authorizedIds}
          />
        </div>

        {/* ── ROW 3: INTELLIGENCE SYNC (50/50) ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PerimeterHealth status={firewall} />
          <VaultSearch />
        </div>

        {/* ── ROW 4: AWARENESS SYNC (50/50) ───────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DefenseLog
            initialLogs={initialLogs}
            alerts={alerts}
            firewall={firewall}
            metrics={metrics}
            vanguardAlertCount={filteredVanguard.alerts.length}
          />
          <AdaptiveShield initialState={initialWafState} />
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-6 py-3 backdrop-blur-xl shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100">
              Kinetic_Commitment: Successful
            </span>
          </div>
        </div>
      )}
    </main>

    {patchModalOpen && (
      <PatchModal
        commands={Array.from(authorizedCmds.values())}
        onClose={() => setPatchModalOpen(false)}
        onDeployed={handleDeployment}
      />
    )}
    </>
  );
}

// ── METRIC CARD ───────────────────────────────────────────────────
type Status = "nominal" | "elevated" | "critical";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  percent: number;
  status: Status;
}

const STATUS_BAR: Record<Status, string> = {
  nominal: "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
  elevated: "bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]",
  critical: "bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]",
};

const STATUS_BADGE: Record<Status, string> = {
  nominal: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
  elevated: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
  critical: "text-red-400 bg-red-500/10 border border-red-500/20",
};

function MetricCard({ icon, label, value, sub, percent, status }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 uppercase tracking-wider">
          {icon}
          {label}
        </div>
        <span className={`text-xs font-medium uppercase px-3 py-1 rounded-full border tracking-wide leading-none flex items-center justify-center ${STATUS_BADGE[status]}`}>
          {status}
        </span>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-100 tabular-nums mb-3">{value}</div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>{sub}</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${STATUS_BAR[status]}`}
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
