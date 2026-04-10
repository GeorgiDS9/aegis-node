import React from "react";
import Link from "next/link";
import { Hexagon, Zap, Shield, Cpu, Activity, ArrowRight } from "lucide-react";
import { AegisButton } from "@/components/ui/AegisButton";

export default function AegisLanding() {
  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center px-6 overflow-hidden relative font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 blur-[160px] rounded-full -z-10 animate-pulse" />

      {/* ⬢ TOP SIGNATURE: The Phase 3 Badge */}
      <div className="mb-12">
        <div className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
          <Zap className="h-3 w-3 text-violet-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">
            Agentic AI: Phase 3 Active Remediation
          </span>
        </div>
      </div>

      {/* ⬢ MAIN TITLE*/}
      <h1 className="flex flex-row items-center justify-center gap-8 text-7xl md:text-[6.5rem] font-black tracking-tighter uppercase mb-12 leading-none bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
        <span>Aegis Node</span>

        <div className="flex items-center justify-center self-center translate-y-[0.05em] relative">
          <div className="absolute inset-0 bg-violet-600/15 blur-3xl rounded-full scale-150" />

          <Shield
            strokeWidth={1.5}
            className="h-[4.2rem] w-[4.2rem] text-violet-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.8)] relative z-10"
          />
        </div>
      </h1>

      {/* ⬢ PRIMARY INTENT */}
      <div className="mx-auto max-w-4xl mb-20 text-center space-y-3">
        <p className="text-xs md:text-sm font-black tracking-[0.35em] text-slate-400 uppercase leading-relaxed">
          Autonomous hardware remediation for the{" "}
          <span className="text-violet-500 whitespace-nowrap">
            Vanguard Protocol 🛰️
          </span>
        </p>
        <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
          Translating global intelligence into local kernel hardening
        </p>
      </div>

      {/* ⬢ ACTION GATE*/}
      <div className="flex flex-col md:flex-row gap-8 mb-28">
        {/* Primary Action */}
        <Link href="/console">
          <AegisButton
            label="Initialize Defense Console"
            icon={ArrowRight}
            size="md"
            className="px-10 !py-4 shadow-[0_0_30px_rgba(139,92,246,0.2)]"
          />
        </Link>

        {/* Secondary Action */}
        <Link href="https://github.com/GeorgiDS9/aegis-node">
          <AegisButton
            label="Protocol Documentation"
            variant="outline"
            size="md"
            className="px-10 !py-4"
          />
        </Link>
      </div>

      {/* ⬢ STRATEGIC INTEL: Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl group hover:border-violet-500/30 transition-all">
          <Cpu className="h-6 w-6 text-violet-500 mb-6" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">
            Silicon Optimization
          </h3>
          <p className="text-[10px] text-slate-500 uppercase leading-relaxed font-black tracking-wider">
            Engineered for Apple M-Series Unified Memory. Real-time inference
            leveraging the Neural Engine.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl group hover:border-violet-500/30 transition-all">
          <Shield className="h-6 w-6 text-violet-500 mb-6" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">
            Kernel Remediation
          </h3>
          <p className="text-[10px] text-slate-500 uppercase leading-relaxed font-black tracking-wider">
            Direct integration with macOS security layers. Automated enforcement
            of <span className="text-violet-500/60">pfctl</span> policies.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl group hover:border-violet-500/30 transition-all">
          <Activity className="h-6 w-6 text-violet-500 mb-6" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">
            Protocol Sync
          </h3>
          <p className="text-[10px] text-slate-500 uppercase leading-relaxed font-black tracking-wider">
            Continuous telemetry bridge with the Vanguard Grid. Localized action
            from global cloud signals.
          </p>
        </div>
      </div>
    </main>
  );
}
