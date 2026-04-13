'use client'

import { useEffect } from 'react'
import { ShieldAlert, RefreshCw, Terminal, Home } from 'lucide-react'
import Link from 'next/link'
import { AegisButton } from '@/components/ui/AegisButton'

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log catastrophic failure to local console for debugging
    console.error('[AEGIS KERNEL PANIC]:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* ── BACKGROUND AMBIANCE ───────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 blur-[160px] rounded-full -z-10 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_70%)] opacity-60" />

      <div className="max-w-xl w-full relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* ⬢ FAILURE ICON */}
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
            <div className="relative h-20 w-20 flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/20 shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)]">
              <ShieldAlert className="h-10 w-10 text-red-400" />
            </div>
          </div>

          {/* ⬢ ERROR TEXT */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/80">
                System_Status: Fault_Detected
              </span>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-sm">
                Kernel <span className="text-red-500">Panic</span>
              </h1>
            </div>
            
            <div className="py-4 px-6 rounded-xl border border-red-900/40 bg-red-950/10 backdrop-blur-sm max-w-md mx-auto">
              <div className="flex items-start gap-3 text-left">
                <Terminal className="h-4 w-4 text-red-400 mt-1 shrink-0" />
                <div className="space-y-2">
                  <p className="text-[11px] font-mono text-red-200/90 leading-relaxed break-all">
                    {error.message || 'An unhandled exception has desynchronized the remediation grid.'}
                  </p>
                  {error.digest && (
                    <p className="text-[9px] font-mono text-red-500/60 uppercase">
                      Digest: {error.digest}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ⬢ RECOVERY ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <AegisButton
              label="Reboot Node"
              icon={RefreshCw}
              onClick={() => reset()}
              size="lg"
              className="w-full sm:w-auto px-10 py-4 bg-red-600/10 border-red-500/30 hover:bg-red-600/20 hover:border-red-500/60 text-red-400 min-w-[200px]"
            />
            
            <Link href="/" className="w-full sm:w-auto">
              <div className="group flex items-center justify-center gap-3 px-10 py-4 rounded-xl border border-slate-800 bg-slate-900/40 transition-all hover:border-slate-700 hover:bg-slate-900/60 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white">
                <Home className="h-4 w-4" />
                Return to Hub
              </div>
            </Link>
          </div>

          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] pt-8">
            Localized Defense Disruption // Reference Security_Advisory.md
          </p>
        </div>
      </div>
    </main>
  )
}
