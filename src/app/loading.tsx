import React from "react";
import { Shield, Loader2, Zap } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* ── BACKGROUND AMBIANCE ───────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 blur-[160px] rounded-full -z-10 animate-pulse" />

      <div className="flex flex-col items-center space-y-10 max-w-sm w-full">
        {/* ⬢ CENTRAL LOGO LOADER */}
        <div className="relative">
          {/* Outer Rotating Ring */}
          <div className="absolute -inset-4 border border-violet-500/10 rounded-full animate-[spin_4s_linear_infinite]" />
          <div className="absolute -inset-8 border border-slate-800/40 rounded-full animate-[spin_8s_linear_infinite_reverse]" />

          {/* Main Shield */}
          <div className="relative h-20 w-20 flex items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-950/20 shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]">
            <Shield className="h-10 w-10 text-violet-400 animate-pulse" />

            {/* Small floating zap */}
            <Zap className="absolute -top-1 -right-1 h-4 w-4 text-violet-500 animate-bounce" />
          </div>
        </div>

        {/* ⬢ LOADING STATUS */}
        <div className="w-full flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-white text-center w-full">
              Initializing Node
            </h2>
            <div className="flex items-center justify-center gap-2 relative">
              <div className="absolute -left-4 h-1 w-1 rounded-full bg-violet-500 animate-ping" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400/80 text-center">
                Secure Interlock Engaged
              </span>
            </div>
          </div>

          {/* ⬢ TACTICAL OUTPUT SIMULATION */}
          <div className="py-4 px-6 rounded-xl border border-slate-800/60 bg-slate-900/10 backdrop-blur-sm min-w-[280px]">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-3 w-3 text-violet-500 animate-spin" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                Boot_Sequence.log
              </span>
            </div>
            <div className="space-y-1.5 text-left">
              <p className="text-[10px] font-mono text-slate-400 animate-[pulse_2s_infinite]">
                <span className="text-violet-500">$</span> Establishing Vanguard Bridge...
              </p>
              <p className="text-[10px] font-mono text-slate-500 opacity-60">
                <span className="text-slate-700">$</span> Verifying Kernel Integrity...
              </p>
              <p className="text-[10px] font-mono text-slate-500 opacity-30">
                <span className="text-slate-800">$</span> Mapping Remediation Vault...
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
