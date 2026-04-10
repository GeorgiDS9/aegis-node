'use client'

import { useState, useCallback, memo } from 'react'
import { ShieldAlert, Loader2 } from 'lucide-react'
import { WAF_RULES } from '@/constants/waf-rules'
import type { WafRule } from '@/constants/waf-rules'
import { logRemediation } from '@/actions/vault'

const RISK_BADGE: Record<WafRule['risk'], string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
  HIGH:     'text-amber-400 bg-amber-500/10 border-amber-500/20',
  MEDIUM:   'text-slate-400 bg-slate-700/20 border-slate-700/40',
}

interface RuleRowProps {
  rule: WafRule
  enabled: boolean
  logging: boolean
  onToggle: (rule: WafRule) => void
}

const RuleRow = memo(function RuleRow({ rule, enabled, logging, onToggle }: RuleRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800 group hover:border-slate-700 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-slate-700'}`} />
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">
            {rule.label}
          </p>
          <p className="text-[8px] text-slate-600 mt-0.5 truncate">
            {rule.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${RISK_BADGE[rule.risk]}`}>
          {rule.risk}
        </span>
        <button
          onClick={() => onToggle(rule)}
          disabled={logging}
          aria-label={enabled ? `Disable ${rule.label}` : `Enable ${rule.label}`}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            enabled ? 'bg-emerald-600' : 'bg-slate-700'
          }`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-4' : 'translate-x-0.5'
          }`} />
        </button>
      </div>
    </div>
  )
})

export default function AdaptiveShield() {
  const [activeRules, setActiveRules] = useState<Record<string, boolean>>(
    () => Object.fromEntries(WAF_RULES.map((r) => [r.id, false]))
  )
  const [loggingRule, setLoggingRule] = useState<string | null>(null)
  const [eventLog, setEventLog]       = useState<string[]>([])

  const handleToggle = useCallback(async (rule: WafRule) => {
    const next = !activeRules[rule.id]
    setActiveRules((prev) => ({ ...prev, [rule.id]: next }))
    setLoggingRule(rule.id)

    const ts = new Date().toISOString()

    await logRemediation({
      id:        `WAF-${rule.id}-${Date.now()}`,
      cve_id:    rule.id,
      target:    'Adaptive WAF',
      action:    `${next ? 'ENABLE' : 'DISABLE'}: ${rule.label}`,
      risk:      rule.risk,
      outcome:   next ? 'enforced' : 'suspended',
      source:    'EDGE',
      timestamp: ts,
    })

    setEventLog((prev) => [
      `[${new Date(ts).toLocaleTimeString('en-US', { hour12: false })}] ${next ? '▲ ENABLE' : '▼ DISABLE'} ${rule.label}`,
      ...prev.slice(0, 4),
    ])
    setLoggingRule(null)
  }, [activeRules])

  const activeCount = Object.values(activeRules).filter(Boolean).length

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-4 w-4 text-violet-400" />
          <span className="text-[11px] font-black tracking-widest uppercase text-white">
            Adaptive Shielding
          </span>
        </div>
        <div className="flex items-center gap-2">
          {loggingRule && (
            <Loader2 className="h-3 w-3 text-violet-400 animate-spin" />
          )}
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {activeCount}/{WAF_RULES.length} Active
          </span>
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded border text-violet-400 bg-violet-500/10 border-violet-500/20 tracking-widest">
            Simulation
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {WAF_RULES.map((rule) => (
          <RuleRow
            key={rule.id}
            rule={rule}
            enabled={activeRules[rule.id]}
            logging={loggingRule === rule.id}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {eventLog.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-800/60 bg-slate-950/60 px-4 py-3 space-y-1">
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">
            Enforcement Log → Vault
          </p>
          {eventLog.map((line, i) => (
            <p key={i} className="text-[9px] font-mono text-violet-400/70 leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
