'use server'

import { exec } from 'child_process'
import { promisify } from 'util'
import type { FirewallStatus } from '@/types/aegis'

const execAsync = promisify(exec)

/**
 * Read-only firewall audit via pfctl -s info.
 * SECURITY: This action NEVER calls pfctl with sudo, -e/-d (enable/disable),
 * or any write flags. It is a pure auditor — observation only.
 */
export async function getFirewallStatus(): Promise<FirewallStatus> {
  try {
    const { stdout, stderr } = await execAsync('pfctl -s info', { timeout: 3000 })
    const output = (stdout || stderr).trim()
    const enabled = /Status:\s*Enabled/i.test(output)

    const interfaces = Array.from(
      output.matchAll(/Interface:\s*(\S+)/gi),
      (m) => m[1]
    )

    return { enabled, interfaces, rawOutput: output }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const isPermission = /Permission denied|Operation not permitted/i.test(msg)

    return {
      enabled: false,
      interfaces: [],
      rawOutput: '',
      error: isPermission
        ? 'Auditor mode — elevated access required to read PF state'
        : msg,
    }
  }
}
