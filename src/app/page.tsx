import React from "react";
import {
  Shield,
  Zap,
  Activity,
  Lock,
  Crosshair,
  ChevronRight,
  Terminal,
} from "lucide-react";
import Link from "next/link";

export default function AegisNodePage() {
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

            <div className="space-y-4">
              {[
                {
                  id: "AE-2026-01",
                  target: "Nginx 1.18",
                  action: "Patch: CVE-2024-22024",
                  risk: "CRITICAL",
                },
                {
                  id: "AE-2026-02",
                  target: "OpenSSL 3.0",
                  action: "Update: Library v3.1",
                  risk: "HIGH",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between rounded-xl border border-slate-800/40 bg-slate-950/40 p-4 transition-all hover:border-violet-500/30"
                >
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-[10px] text-violet-500">
                      {item.id}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-200">
                        {item.target}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 tracking-wide">
                        {item.action}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 rounded bg-violet-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white hover:bg-violet-500">
                    Execute <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SYSTEM HEALTH CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8">
              <h3 className="mb-6 text-[11px] font-black tracking-[0.2em] uppercase text-slate-400 flex items-center gap-2">
                <Lock className="h-4 w-4 text-violet-500" /> Shield Integrity
              </h3>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 w-[94%] shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
              </div>
              <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Hardened Assets: 42</span>
                <span className="text-violet-400">94.2%</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8">
              <h3 className="mb-6 text-[11px] font-black tracking-[0.2em] uppercase text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4 text-fuchsia-500" /> Adaptive
                Response
              </h3>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-fuchsia-500 w-[78%] shadow-[0_0_10px_rgba(232,121,249,0.5)]" />
              </div>
              <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Threat Suppression</span>
                <span className="text-fuchsia-400">78.0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🎞️ TACTICAL SIDEBAR (Right - 3.5) */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d] p-8 lg:sticky lg:top-24">
            <div className="mb-10 flex items-center gap-3">
              <Terminal className="h-5 w-5 text-violet-400" />
              <h2 className="text-[12px] font-black tracking-widest uppercase text-white">
                Defense Log
              </h2>
            </div>

            <div className="space-y-8 relative">
              <div className="absolute left-2.5 top-2 h-[85%] w-px border-l border-dashed border-slate-800/60" />

              {[
                { title: "WAF Rule Update", time: "2 min ago" },
                { title: "Library Isolated", time: "14 min ago" },
                { title: "Patch Verified", time: "1 hour ago" },
              ].map((log, i) => (
                <div key={i} className="relative pl-9 group">
                  <div className="absolute left-[-2px] top-1 h-5 w-5 rounded-full border border-slate-700 bg-[#020617] flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  </div>
                  <p className="text-[11px] font-black tracking-widest text-slate-200 uppercase">
                    {log.title}
                  </p>
                  <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">
                    {log.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
