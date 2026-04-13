import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, COOKIE_NAME } from "@/lib/auth";
import { WAF_COOKIE_NAME } from "@/constants/waf-rules";

/**
 * Auth middleware for Aegis Node.
 *
 * Protected routes: /console, /api/* (except /api/auth/* and /api/heartbeat
 * when the request is from localhost — the browser pulse doesn't carry a
 * preflight cookie on every fetch in some environments).
 *
 * Unauthenticated requests are redirected to /login (for pages)
 * or receive a 401 JSON response (for API routes).
 *
 * WAF enforcement runs before auth on all matched routes. Rules are read
 * from the aegis-waf cookie (set by the waf-config server action). Each
 * enabled rule inspects the request URL and headers. POST bodies are not
 * inspected — Edge Runtime cannot consume a stream without destroying it.
 * See TECHNICAL_ADVISOR.md for the full rationale.
 */

// ── WAF patterns ──────────────────────────────────────────────────
const WAF_PATTERNS: Record<string, RegExp> = {
  'WAF-SQLi': /('--|%27--|;\s*--|\/\*.*\*\/|\bor\b\s+\w+\s*=\s*\w+|\bunion\b\s+\bselect\b|\bdrop\s+table\b|\binsert\s+into\b|\bdelete\s+from\b|xp_\w+)/i,
  'WAF-XSS':  /(<\s*script[\s>]|javascript\s*:|on\w+\s*=\s*["']|<\s*iframe[\s>]|document\.cookie|eval\s*\()/i,
  'WAF-PATH': /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/|\.\.%2f|%252e%252e)/i,
  'WAF-BOT':  /(scrapy|ahrefsbot|semrushbot|dotbot|petalbot|mj12bot|rogerbot|masscan|zgrab)/i,
}

// WAF-RATE is acknowledged by the toggle but not enforceable in Edge Runtime
// (no persistent cross-request state). Documented in TECHNICAL_ADVISOR.md.

function enforceWaf(req: NextRequest): NextResponse | null {
  const raw = req.cookies.get(WAF_COOKIE_NAME)?.value
  if (!raw) return null

  let activeRules: Record<string, boolean>
  try {
    activeRules = JSON.parse(raw) as Record<string, boolean>
  } catch {
    return null // Malformed cookie — fail open
  }

  const urlTarget = `${req.nextUrl.pathname}${req.nextUrl.search}`
  const ua        = req.headers.get('user-agent') ?? ''

  for (const [ruleId, pattern] of Object.entries(WAF_PATTERNS)) {
    if (!activeRules[ruleId]) continue

    const subject = ruleId === 'WAF-BOT' ? ua : urlTarget
    if (pattern.test(subject)) {
      return new NextResponse(
        JSON.stringify({ error: 'Request blocked by Aegis WAF', rule: ruleId }),
        {
          status:  403,
          headers: {
            'Content-Type':  'application/json',
            'X-Aegis-WAF':   ruleId,
          },
        }
      )
    }
  }

  return null
}

// ── Auth helpers ──────────────────────────────────────────────────
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // WAF runs first — blocks malicious requests before auth logic
  const wafBlock = enforceWaf(req)
  if (wafBlock) return wafBlock

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow heartbeat from localhost without a session cookie
  // (the browser's 5s interval poll may not carry cookies in all contexts)
  if (pathname === "/api/heartbeat") {
    const host = req.headers.get("host") ?? "";
    const ip   = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
    const isLocal =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      ip.startsWith("127.") ||
      ip.startsWith("::1");
    if (isLocal) return NextResponse.next();
  }

  // All other protected routes need a valid session
  const token = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const valid  = token ? await validateSessionToken(token) : false;

  if (!valid) {
    // API routes → 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Pages → redirect to login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/console/:path*", "/api/:path*"],
};
