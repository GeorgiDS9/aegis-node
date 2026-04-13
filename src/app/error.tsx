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
        <div className="flex flex-col items-center text-center space-y-10">
          
          {/* ⬢ FAILURE ICON */}
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full scale-150" />
            <div className="relative h-20 w-20 flex items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]">
              <ShieldAlert className="h-10 w-10 text-red-400" />
            </div>
          </div>

          {/* ⬢ ERROR TEXT */}
          <div className="space-y-6">
            <h1 className="text-[13px] font-black uppercase tracking-[0.3em] text-white">
              Localized Remediation Grid Failure
            </h1>
            
            <div className="py-5 px-6 rounded-xl border border-red-900/40 bg-red-950/10 backdrop-blur-sm max-w-md mx-auto">
              <div className="flex items-start gap-4 text-left">
                <Terminal className="h-4 w-4 text-red-400 mt-1 shrink-0" />
                <div className="space-y-2">
                  <p className="text-[11px] font-mono text-red-200/90 leading-relaxed break-all">
                    {error.message || 'An unhandled exception has desynchronized the remediation grid.'}
                  </p>
                  {error.digest && (
                    <p className="text-[9px] font-mono text-red-500/60 uppercase tracking-widest">
                      ID: {error.digest}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ⬢ RECOVERY ACTIONS */}
          <div className="flex items-center gap-4">
            <AegisButton
              label="Reboot Node"
              icon={RefreshCw}
              onClick={() => reset()}
              size="md"
              className="py-4 px-10 rounded-xl"
            />
            
            <Link href="/" className="inline-block">
              <AegisButton
                label="Return to Hub"
                icon={Home}
                variant="outline"
                size="md"
                className="py-4 px-10 rounded-xl"
              />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
