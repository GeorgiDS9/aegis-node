import { Home, SearchX, Terminal } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* ── BACKGROUND AMBIANCE ───────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 blur-[160px] rounded-full -z-10 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_70%)] opacity-60" />

      <div className="max-w-xl w-full relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* ⬢ NOT FOUND ICON */}
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full scale-150" />
            <div className="relative h-20 w-20 flex items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-950/20 shadow-[0_0_40px_-10px_rgba(139,92,246,0.4)]">
              <SearchX className="h-10 w-10 text-violet-400" />
            </div>
          </div>

          {/* ⬢ ERROR TEXT */}
          <div className="space-y-6">
            <h1 className="text-[13px] font-black uppercase tracking-[0.3em] text-white">
              System_Status: Route_Not_Found
            </h1>

            <div className="py-4 px-6 rounded-xl border border-slate-800/60 bg-slate-900/10 backdrop-blur-sm max-w-sm mx-auto">
              <div className="flex items-start gap-3 text-left">
                <Terminal className="h-4 w-4 text-violet-400 mt-1 shrink-0" />
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                  The requested coordinate does not exist within the Aegis perimeter. No active
                  handler found.
                </p>
              </div>
            </div>
          </div>

          {/* ⬢ RECOVERY ACTIONS */}
          <Link href="/" className="w-full sm:w-auto">
            <div className="group flex items-center justify-center gap-3 px-10 py-5 rounded-2xl border border-violet-500/30 bg-violet-600/10 transition-all hover:bg-violet-600/20 hover:border-violet-500/60 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]">
              <Home className="h-4 w-4 text-violet-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-start leading-none gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-widest text-white">
                  Return to Hub
                </span>
                <span className="text-[7px] font-black text-violet-400/60 uppercase tracking-[0.2em]">
                  Restore Signal Path
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
