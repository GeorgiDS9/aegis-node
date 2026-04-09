import { Shield, Activity, Zap, Crosshair, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getHardwareMetrics } from "@/actions/metrics";
import { REMEDIATION_QUEUE } from "@/types/aegis";
import RemediationQueue from "@/components/RemediationQueue";
import DefenseLog from "@/components/DefenseLog";

export const dynamic = "force-dynamic";

export default async function HybridPage() {
  const metrics = await getHardwareMetrics();

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 selection:bg-violet-500/30">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 p-4 backdrop-blur-md">
        {/* ── LEFT: LOGO & STATUS ────────────────────────────────── */}
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

        {/* ── RIGHT: NAVIGATION BRIDGE & MASTER TRIGGER ─────────── */}
        <nav className="flex items-center gap-4">
          {/* ⬢ MISSION CONTROL BRIDGE */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="group flex items-center gap-3 px-4 py-2 rounded-md border border-slate-800/60 bg-slate-900/20 transition-all hover:border-violet-500/40 hover:bg-violet-900/10"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-slate-700 group-hover:bg-violet-500 transition-colors shadow-[0_0_8px_rgba(139,92,246,0)] group-hover:shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] group-hover:text-white transition-colors">
                Return to Hub
              </span>
            </Link>

            {/* Future slots for 'Governance Ledger' or 'Reset Node' */}
          </div>

          {/* ⬢ TELEMETRY (Your existing pulse, now boxed) */}
          <div className="hidden lg:flex items-center gap-2 px-4 border-l border-slate-800/60">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              Node_Status: Online
            </span>
          </div>

          {/* ⬢ MASTER TRIGGER (Your existing button) */}
          <button className="group flex items-center gap-3 rounded-lg border border-violet-500/30 bg-violet-600/10 px-5 py-2.5 transition-all hover:border-violet-500/60 hover:bg-violet-600/20 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]">
            <Zap className="h-4 w-4 text-violet-400 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col items-start leading-none gap-1.5">
              <span className="text-[11px] font-black tracking-widest uppercase text-white">
                Initialize Patch
              </span>
              <span className="text-[7px] font-black text-violet-400/60 uppercase tracking-widest">
                Deploy Remediation
              </span>
            </div>
          </button>
        </nav>
      </header>

      {/* ── CONSOLE HEADER ───────────────────────────────── */}
      <section className="w-full px-8 pt-20 pb-16">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col items-start px-4">
          {/* The Title: High-Fidelity & Engineering-Focused */}
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
            Aegis <span className="text-violet-500">Remediation Grid</span>
          </h1>

          {/* The Subtitle: Tactical Hardware Registry */}
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-3">
            Localized System Hardening & Active Response
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 pb-32 space-y-8">
        {/* ── TOP METRICS GRID ───────────────────────────────────── */}
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
            label="Threat Surface"
            value={`${REMEDIATION_QUEUE.length} ACTIVE`}
            sub="Remediation Queue"
            percent={100}
            status="critical"
          />
        </div>

        {/* ── TACTICAL GRID: 8.5 / 3.5 SPLIT ─────────────────────── */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8 backdrop-blur-xl">
              <div className="mb-8 flex items-center justify-between border-b border-slate-800/60 pb-6">
                <div className="flex items-center gap-3">
                  <Crosshair className="h-5 w-5 text-violet-500" />
                  <h2 className="text-sm font-black tracking-widest uppercase text-white">
                    Remediation Queue
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">
                  Awaiting Operator Signature
                </span>
              </div>
              <RemediationQueue items={REMEDIATION_QUEUE} />
            </div>
          </div>
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <DefenseLog />
          </aside>
        </div>
      </div>
    </main>
  );
}

// ── METRIC CARD ───────────────────────────────────────────────────
// Content: verbatim from aegis/page.tsx
// Border:  rounded-2xl border-slate-800 bg-slate-900/20 p-8 (app/page.tsx style)
// Bar:     nominal → violet-to-fuchsia gradient · elevated → amber · critical → red

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
  nominal:
    "bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]",
  elevated: "bg-amber-500",
  critical: "bg-red-500",
};

const STATUS_BADGE: Record<Status, string> = {
  nominal: "text-violet-400 bg-violet-500/10",
  elevated: "text-amber-400 bg-amber-500/10",
  critical: "text-red-400 bg-red-500/10",
};

function MetricCard({
  icon,
  label,
  value,
  sub,
  percent,
  status,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider">
          {icon}
          {label}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[status]}`}
        >
          {status.toUpperCase()}
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-100 tabular-nums">
        {value}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
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
  );
}
