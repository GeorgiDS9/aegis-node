import { useState, useCallback, memo } from 'react'
import { ShieldAlert, Loader2 } from 'lucide-react'
import { WAF_RULES } from '@/constants/waf-rules'
import type { WafRule } from '@/constants/waf-rules'
import { logRemediation } from '@/actions/vault'
import { AegisCard } from './ui/AegisCard'
import { CardHeader } from './ui/CardHeader'
import { StatusBadge } from './ui/StatusBadge'
import { SeverityTag } from './ui/SeverityTag'

interface RuleRowProps {
  rule: WafRule
  enabled: boolean
  logging: boolean
  onToggle: (rule: WafRule) => void
}

const RuleRow = memo(function RuleRow({ rule, enabled, logging, onToggle }: RuleRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 group hover:border-violet-500/20 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 transition-all ${
          enabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-700'
        }`} />
        <div className="min-w-0">
          <p className="text-[11px] font-black text-slate-200 uppercase tracking-widest">
            {rule.label}
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5 truncate uppercase tracking-tight font-medium">
            {rule.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
        <SeverityTag level={rule.risk} size="sm" />
        <button
          onClick={() => onToggle(rule)}
          disabled={logging}
          aria-label={enabled ? `Disable ${rule.label}` : `Enable ${rule.label}`}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            enabled ? 'bg-violet-600' : 'bg-slate-800'
          }`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${
            enabled ? 'translate-x-[1.375rem]' : 'translate-x-0.5'
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
      `[${new Date(ts).toLocaleTimeString('en-US', { hour12: false })}] ${next ? '▲ ENFORCE' : '▼ SUSPEND'} ${rule.label}`,
      ...prev.slice(0, 4),
    ])
    setLoggingRule(null)
  }, [activeRules])

  const activeCount = Object.values(activeRules).filter(Boolean).length

  return (
    <AegisCard>
      <CardHeader 
        title="Adaptive Shielding" 
        icon={ShieldAlert}
        rightElement={
          <div className="flex items-center gap-3">
            {loggingRule && (
              <Loader2 className="h-3.5 w-3.5 text-violet-400 animate-spin" />
            )}
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tabular-nums">
              {activeCount}/{WAF_RULES.length} On
            </span>
            <StatusBadge label="Simulation" type="default" />
          </div>
        }
      />

      <div className="space-y-2 mb-6">
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
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3 min-h-[100px]">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            Transmission Log → Vault
          </p>
          <div className="space-y-1.5">
            {eventLog.map((line, i) => (
              <p key={i} className="text-[10px] font-mono text-violet-400/70 leading-relaxed truncate">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </AegisCard>
  )
}
