'use server'

import os from 'os'
import type { HardwareMetrics } from '@/app/aegis/types'

export async function getHardwareMetrics(): Promise<HardwareMetrics> {
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem

  return {
    cpuUsagePercent: getCpuUsagePercent(),
    memoryUsedPercent: Math.round((usedMem / totalMem) * 100),
    memoryUsedGB: Math.round((usedMem / 1024 / 1024 / 1024) * 10) / 10,
    totalMemoryGB: Math.round(totalMem / 1024 / 1024 / 1024),
  }
}

function getCpuUsagePercent(): number {
  const cpus = os.cpus()
  let totalIdle = 0
  let totalTick = 0

  for (const cpu of cpus) {
    for (const type of Object.keys(cpu.times) as (keyof typeof cpu.times)[]) {
      totalTick += cpu.times[type]
    }
    totalIdle += cpu.times.idle
  }

  const idlePercent = (totalIdle / totalTick) * 100
  return Math.min(99, Math.max(1, Math.round(100 - idlePercent)))
}
