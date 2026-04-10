/**
 * Aegis auth utilities — HMAC-signed session cookie.
 *
 * No external dependencies. Uses the Web Crypto API (available in the
 * Next.js Edge Runtime used by middleware).
 *
 * The AEGIS_AUTH_SECRET env var must be set (base64-encoded 32-byte key).
 * The /console and /api/* routes (except /api/heartbeat from localhost)
 * require a valid signed session cookie to proceed.
 */

const COOKIE_NAME = 'aegis_session'
const SESSION_TTL = 8 * 60 * 60 * 1000 // 8 hours

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.AEGIS_AUTH_SECRET ?? ''
  const raw = Uint8Array.from(atob(secret), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

async function sign(payload: string): Promise<string> {
  const key = await getKey()
  const enc = new TextEncoder()
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

async function verify(payload: string, signature: string): Promise<boolean> {
  try {
    const key = await getKey()
    const enc = new TextEncoder()
    const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0))
    return await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payload))
  } catch {
    return false
  }
}

/** Build a signed session token string: <timestamp>.<signature> */
export async function createSessionToken(): Promise<string> {
  const ts = Date.now().toString()
  const sig = await sign(ts)
  return `${ts}.${sig}`
}

/** Validate a session token. Returns false if expired or tampered. */
export async function validateSessionToken(token: string): Promise<boolean> {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const ts = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const valid = await verify(ts, sig)
  if (!valid) return false
  const age = Date.now() - parseInt(ts, 10)
  return age < SESSION_TTL
}

export { COOKIE_NAME }
