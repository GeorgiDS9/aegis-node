'use client'

import { memo } from 'react'
import { Scale, ShieldCheck, Activity, FileCheck, Info } from 'lucide-react'
import { AegisCard } from './ui/AegisCard'
import { CardHeader } from './ui/CardHeader'
import { StatusBadge } from './ui/StatusBadge'
import SystemLabel from './ui/SystemLabel'

interface GovernancePulseProps {
  wafActiveCount: number
  wafTotalCount: number
  mttrSeconds?: number
  vaultStatus: 'IMMUTABLE' | 'SYNCING' | 'DEGRADED' | 'READ_ONLY'
  hitlStatus: 'ACTIVE' | 'BYPASS' | 'PAUSED'
  nodeId: string
}

const VAULT_MAP: Record<string, 'blue' | 'amber' | 'red' | 'default'> = {
  IMMUTABLE: 'blue',
  SYNCING:   'amber',
  DEGRADED:  'red',
  READ_ONLY: 'default',
}

const HITL_MAP: Record<string, 'emerald' | 'red' | 'amber'> = {
  ACTIVE: 'emerald',
  BYPASS: 'red',
  PAUSED: 'amber',
}

function GovernancePulse({
  wafActiveCount,
  wafTotalCount,
  mttrSeconds = 14.2,
  vaultStatus,
  hitlStatus,
  nodeId
}: GovernancePulseProps) {
  const protectPercent = (wafActiveCount / wafTotalCount) * 100

  return (
    <AegisCard className="flex flex-col h-full">
      <CardHeader 
        title="GOVERNANCE: NIST_CSF_V2" 
        icon={Scale}
        rightElement={
          <StatusBadge label="V2.0_2024" type="default" size="md" />
        }
      />

      <div className="space-y-6 mt-2 pb-2">
        {/* IDENTIFY (ID) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 tracking-widest uppercase">
              <Info className="h-3 w-3 text-slate-600" />
              IDENTIFY (ID)
            </div>
            <SystemLabel className="text-slate-200 font-bold">
              {nodeId}
            </SystemLabel>
          </div>
          <div className="h-[1px] w-full bg-slate-800/50" />
        </div>

        {/* PROTECT (PR) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 tracking-widest uppercase">
              <ShieldCheck className="h-3 w-3 text-violet-500" />
              PROTECT (PR)
            </div>
            <SystemLabel className="text-slate-200 font-bold">
              {wafActiveCount}/{wafTotalCount} COVERAGE
            </SystemLabel>
          </div>
          <div className="relative h-[1px] w-full bg-slate-800/50 overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-slate-500 transition-all duration-1000 ease-out"
              style={{ width: `${protectPercent}%` }}
            />
          </div>
        </div>

        {/* RESPOND (RS) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 tracking-widest uppercase">
              <Activity className="h-3 w-3 text-emerald-500" />
              RESPOND (RS)
            </div>
            <div className="flex items-center gap-3">
               <SystemLabel className="text-slate-200 font-bold">
                MTTR: {mttrSeconds}s
              </SystemLabel>
              <StatusBadge label={`HITL: ${hitlStatus}`} type={HITL_MAP[hitlStatus]} size="sm" />
            </div>
          </div>
          <div className="h-[1px] w-full bg-slate-800/50" />
        </div>

        {/* RECOVER (RC) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 tracking-widest uppercase">
              <FileCheck className="h-3 w-3 text-blue-500" />
              RECOVER (RC)
            </div>
            <div className="flex items-center gap-2">
               <StatusBadge label={`SYNC: ${vaultStatus}`} type={VAULT_MAP[vaultStatus]} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </AegisCard>
  )
}

export default memo(GovernancePulse)
