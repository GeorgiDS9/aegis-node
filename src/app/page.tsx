import React from "react";
import {
  Shield,
  Zap,
  Activity,
  Lock,
  Crosshair,
} from "lucide-react";
import { getHardwareMetrics } from "@/actions/metrics";
import { REMEDIATION_QUEUE } from "@/types/aegis";
import RemediationQueue from "@/components/RemediationQueue";
import DefenseLog from "@/components/DefenseLog";

export const dynamic = "force-dynamic";

export default async function AegisNodePage() {
  const metrics = await getHardwareMetrics();

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 selection:bg-violet-500/30">
      {/* 🛰️ SYSTEM HEADER: Unified with Vanguard DNA */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 p-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-950/20 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]">
            <Shield className="h-5 w-5 text-violet-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[12px] font-black tracking-widest uppercase text-white">
              Aegis Node <span className="text-violet-500">v1.0</span>
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-slate-500">
                Edge Remediation Grid: Engaged
              </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {/* TACTICAL DOUBLE-LABEL BUTTON: DEPLOY */}
          <button className="group flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-2 transition-all hover:border-violet-500/50 hover:bg-violet-900/20 hover:text-violet-400 shadow-lg">
            <Zap className="h-3.5 w-3.5 group-hover:text-violet-400" />
            <div className="flex flex-col items-start leading-none gap-1">
              <span className="text-[10px] font-black tracking-widest uppercase">
                Initialize Patch
              </span>
              <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-violet-500/60">
                Deploy Remediation
              </span>
            </div>
          </button>
        </nav>
      </header>

      {/* 🛡️ HERO UNIT */}
      <section className="relative px-6 py-24 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] bg-violet-600/5 blur-[100px] pointer-events-none" />

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-white mb-6">
          AEGIS{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-violet-400 to-violet-600">
            NODE
          </span>
        </h1>

        {/* NEW GROUNDED SLOGAN */}
        <p className="mt-4 text-slate-400 uppercase tracking-[0.3em] text-sm font-bold">
          Targeted Remediation & Perimeter Hardening
        </p>

        <p className="mx-auto mt-6 max-w-xl text-xs font-medium tracking-wide text-slate-500 uppercase leading-relaxed">
          Sword & Shield of the Vanguard Protocol. Autonomous remediation for
          detected vulnerabilities at the hardware and kernel level.
        </p>
      </section>

      {/* 📊 TACTICAL GRID: 8.5 / 3.5 SPLIT */}
      <div className="mx-auto max-w-[1400px] px-6 grid grid-cols-12 gap-8 pb-32">
        {/* 📋 PRIMARY INTERFACE (Left - 8.5) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* REMEDIATION QUEUE */}
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

            {/* ⚡ WIRED: live items + Execute streaming */}
            <RemediationQueue items={REMEDIATION_QUEUE} />
          </div>

          {/* SYSTEM HEALTH CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ⚡ WIRED: Shield Integrity → live CPU usage */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8">
              <h3 className="mb-6 text-[11px] font-black tracking-[0.2em] uppercase text-slate-400 flex items-center gap-2">
                <Lock className="h-4 w-4 text-violet-500" /> Shield Integrity
              </h3>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all"
                  style={{ width: `${metrics.cpuUsagePercent}%` }}
                />
              </div>
              <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Hardened Assets: 42</span>
                <span className="text-violet-400">{metrics.cpuUsagePercent}%</span>
              </div>
            </div>

            {/* ⚡ WIRED: Adaptive Response → live Unified Memory */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8">
              <h3 className="mb-6 text-[11px] font-black tracking-[0.2em] uppercase text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4 text-fuchsia-500" /> Adaptive
                Response
              </h3>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-fuchsia-500 shadow-[0_0_10px_rgba(232,121,249,0.5)] transition-all"
                  style={{ width: `${metrics.memoryUsedPercent}%` }}
                />
              </div>
              <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Threat Suppression</span>
                <span className="text-fuchsia-400">{metrics.memoryUsedPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🎞️ TACTICAL SIDEBAR (Right - 3.5) */}
        {/* ⚡ WIRED: Defense Log → live Ollama streaming */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <DefenseLog />
        </aside>
      </div>
    </main>
  );
}
