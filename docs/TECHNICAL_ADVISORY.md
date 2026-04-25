# TECHNICAL ADVISORY — Aegis Node

This document records the architectural decisions, constraints, and deliberate
trade-offs made during the build of Aegis Node. It exists so these decisions
are not lost between sessions and so any operator running this project
understands exactly what is real, what is advisory, and why.

---

## 1. pfctl Firewall Execution — Advisory-Only by Design

### What the system does

Aegis translates Vanguard cloud alerts into pfctl commands via `kinetic-bridge.ts`.
The commands are built correctly, displayed in PatchModal with full context
(target IP, risk level, description), authorized by the operator via the HITL
gate, logged to the LanceDB vault, and acknowledged to disk. An example command:

```
sudo pfctl -t aegis_blocklist -T add 192.168.1.50
```

### What the system does NOT do

The command is never executed. No `child_process.execFile` or equivalent is
called anywhere in the codebase. The firewall is never touched automatically.

### Why

**The sudo constraint.** On macOS, `pfctl` requires root to modify firewall
rules. Without it, the command fails silently or throws `Permission denied`.
There is no way to execute pfctl rule changes without elevated access.

The options considered were:

| Approach | Decision | Reason |
|---|---|---|
| Run Next.js server with `sudo` | Rejected | Grants root to the entire web process — unacceptable attack surface |
| Add `NOPASSWD: /sbin/pfctl` to sudoers | Deferred | Permanent OS-level change; out of scope for this machine |
| macOS XPC privileged helper | Deferred | Requires code signing; significant engineering lift |

**The machine constraint.** Aegis Node runs on the operator's sole development
machine. Auto-executing firewall rules — even correctly validated ones — on a
machine that cannot be rebooted without consequence is a risk that outweighs
the automation benefit. A false positive from the Vanguard feed blocking a
legitimate IP (e.g. a DNS server or API gateway) could disrupt the working
environment with no easy recovery path.

### The pf table mechanism

Adding an IP to the `aegis_blocklist` table with `-T add` only blocks traffic
if pf is active **and** has a loaded ruleset that references that table with a
`block` rule. On stock macOS, pf is inactive by default. A freshly added table
entry has no effect without prior pf configuration. This means the commands
shown in PatchModal are inert on most machines without deliberate pf setup.

### The HITL model as a feature

The current design is deliberate: Aegis builds and authorizes the exact command
the operator needs, logs it to the vault as a permanent record, and provides a
copy button in PatchModal. The operator runs it manually in a terminal with
full awareness. This is Human-in-the-Loop by design — the system advises,
the operator executes.

### If you want to implement execution

1. Create a one-time setup script that adds a scoped sudoers entry:
   ```
   username ALL=(ALL) NOPASSWD: /sbin/pfctl -t aegis_blocklist -T add *
   ```
2. Add strict IPv4 regex validation before any exec call (reject anything not
   matching `^(\d{1,3}\.){3}\d{1,3}$` with octet range check).
3. Add a server action that calls `execFile('sudo', ['pfctl', '-t', 'aegis_blocklist', '-T', 'add', ip])`.
4. For the blocklist to actually drop traffic, load a pf ruleset that references it:
   ```
   table <aegis_blocklist> persist
   block drop in quick from <aegis_blocklist>
   ```
   Load with: `sudo pfctl -f /etc/pf.conf`

---

## 2. Adaptive Shielding — Scope Decision

### What the WAF protects

The Adaptive Shielding rules are enforced via Next.js middleware, which runs
on every request matched by the middleware config (`/console/:path*`,
`/api/:path*`). This means the WAF protects the Aegis Node application itself:
the dashboard, the vault API routes, the AI streaming endpoint, and the
heartbeat.

### What it does not protect

The WAF does not protect other processes or services running on the machine.
A request hitting a separate server on port 8080, a database on 5432, or any
other process is invisible to Next.js middleware. Protecting other services
would require a network-layer solution (nginx reverse proxy, pf packet filter)
or a host-level proxy, which is out of scope for this node.

### Why Next.js middleware

Middleware runs in the Edge Runtime (V8 isolate, not Node.js). This imposes
real constraints:

- No `fs` module — cannot read files
- No persistent in-process memory across requests
- Cannot consume a POST body stream without destroying it for the handler

These constraints drove two design decisions:

**Cookie-based rule state.** Middleware cannot read `data/.waf-config.json`
directly. The WAF rule state is instead stored in an `httpOnly` cookie
(`aegis-waf`) that middleware can read from `req.cookies`. This cookie is
written by the `saveWafConfig` server action whenever a toggle changes, and
refreshed on each console page load from the on-disk config. On-disk config
is the source of truth; the cookie is the transport layer to middleware.

**URL inspection only.** POST request bodies cannot be inspected in middleware
without consuming the stream, which would prevent the body from reaching the
route handler. The WAF therefore inspects only:
- The URL pathname and query string (SQLi, XSS, path traversal patterns)
- The `User-Agent` header (bot signature patterns)

Form fields, JSON payloads, and multipart bodies are not inspected. This is a
known limitation documented here rather than silently omitted.

### Rate limiting (WAF-RATE) — acknowledged, not enforced at edge

Real per-IP rate limiting requires persistent cross-request state (a counter
store). The Edge Runtime has no such mechanism — each invocation is stateless.
WAF-RATE toggle is available in the UI and logs to the vault when enabled, but
the middleware does not attempt to count or limit requests. If rate limiting is
required, it should be implemented at the infrastructure layer (nginx
`limit_req`, a Redis-backed middleware, or a CDN-level rule).

---

## 3. Perimeter Health — Read-Only Audit

The Perimeter Health card runs `pfctl -s info` to read firewall state. This
is a read-only operation; it does not modify any rules. On many macOS
configurations, even this read fails with `Permission denied`, in which case
the card displays "Auditor Mode" — an honest label meaning Aegis can see the
firewall exists but cannot interrogate its state.

No attempt is made to escalate permissions for the read. The card degrades
gracefully and does not block any other functionality.

---

## 4. Vault Embeddings — Fallback Behavior

All remediations logged to LanceDB are stored with a 4096-dimensional vector
embedding generated by Ollama (`llama3:8b-instruct-q4_K_M` via `/api/embeddings`).

If Ollama is offline when a log entry is written, `generateEmbedding` returns
a zero vector (`Array(4096).fill(0)`) rather than failing the write. This means
the entry is stored correctly and queryable by all non-semantic methods, but
vector similarity search will return it with near-zero relevance to any real
query. This is the correct trade-off: vault integrity is preserved at the cost
of semantic search quality for that specific entry.

---

## 5. Vanguard Feed — External Dependency

The cloud alert feed calls `VANGUARD_API_URL` (default: `http://localhost:3001/api`)
with a bearer token. If the Vanguard server is not running, the feed returns
`connected: false` with an error string and zero alerts — the UI degrades to
an empty Cloud Grid with no crash.

A circuit breaker (`src/lib/vanguard-cache.ts`) enforces a 1-second timeout
per heartbeat poll and returns cached alerts if Vanguard is slow. Cached
results go stale after 30 seconds. This prevents a slow or unresponsive
Vanguard instance from blocking the 5-second heartbeat loop.

---

## 6. Authentication

Session tokens are HMAC-signed cookies (`aegis-session`). The signing key is
`AUTH_SECRET` from the environment. Without a valid signed token, all
`/console` and `/api` routes return 401 or redirect to `/login`. The heartbeat
endpoint (`/api/heartbeat`) is exempt from auth when called from localhost to
allow the browser's 5-second polling interval to function without a preflight
cookie in all environments.
