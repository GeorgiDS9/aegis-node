'use client'

import { useState, useCallback } from 'react'
import { Zap, X, Terminal, CheckCircle, Loader2, ShieldAlert } from 'lucide-react'
import { AegisButton } from './ui/AegisButton'
import type { KineticCommand } from '@/types/aegis'
import { logRemediation } from '@/actions/vault'
import { acknowledgeCloudAlerts } from '@/actions/cloud-ack'

interface Props {
  commands: KineticCommand[]
  onClose: () => void
  onDeployed: (ids: string[]) => void
}

const RISK_COLOR: Record<KineticCommand['risk'], string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
  HIGH:     'text-amber-400 bg-amber-500/10 border-amber-500/20',
  MEDIUM:   'text-slate-400 bg-slate-700/20 border-slate-700/40',
}

export default function PatchModal({ commands, onClose, onDeployed }: Props) {
  const [deploying, setDeploying] = useState<boolean>(false)
  const [deployed, setDeployed]   = useState<boolean>(false)

  const authorizedCommands = commands.filter((c) => c.authorized)

  const handleDeploy = useCallback(async () => {
    if (authorizedCommands.length === 0 || deploying) return
    setDeploying(true)

    // Log each authorized command to vault and persist ack to disk
    const deployedIds = authorizedCommands.map((c) => c.alertId)
    await Promise.all(
      authorizedCommands.map((cmd) =>
        logRemediation({
          id:        `KINETIC-${cmd.alertId}-${Date.now()}`,
          cve_id:    cmd.alertId,
          target:    'Local PF Firewall',
          action:    cmd.command,
          risk:      cmd.risk,
          outcome:   'authorized',
          source:    'CLOUD',
          timestamp: new Date().toISOString(),
        })
      )
    )
    await acknowledgeCloudAlerts(deployedIds)

    setDeploying(false)
    setDeployed(true)
    onDeployed(deployedIds)
  }, [authorizedCommands, deploying, onDeployed])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#080d1a] shadow-[0_0_80px_-20px_rgba(139,92,246,0.3)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-violet-400" />
            <span className="text-[11px] font-black tracking-widest uppercase text-white">
              Initialize Patch
            </span>
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded border text-violet-400 bg-violet-500/10 border-violet-500/20 tracking-widest">
              HITL Gate
            </span>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {authorizedCommands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <ShieldAlert className="h-8 w-8 text-slate-700" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                No authorized commands
              </p>
              <p className="text-[9px] text-slate-600 text-center">
                Authorize individual Vanguard commands in the Cloud Grid first.
              </p>
            </div>
          ) : (
            authorizedCommands.map((cmd) => (
              <div
                key={cmd.alertId}
                className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/40">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate pr-3">
                    {cmd.description}
                  </span>
                  <span className={`flex-shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded border ${RISK_COLOR[cmd.risk]}`}>
                    {cmd.risk}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Terminal className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                  <code className="text-[11px] font-mono text-violet-300 break-all">
                    {cmd.command}
                  </code>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/60 bg-slate-950/40">
          <p className="text-[9px] text-slate-600 uppercase tracking-widest">
            {authorizedCommands.length} command{authorizedCommands.length !== 1 ? 's' : ''} authorized
          </p>
          {deployed ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Logged to Vault</span>
            </div>
          ) : (
            <AegisButton
              label={deploying ? "Deploying..." : "Deploy Remediation"}
              icon={deploying ? Loader2 : Zap}
              loading={deploying}
              disabled={authorizedCommands.length === 0}
              onClick={handleDeploy}
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  )
}
