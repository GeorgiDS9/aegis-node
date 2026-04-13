# VANGUARD PROTOCOL — Security Advisory

**Classification:** Internal — Aegis Node Operations
**Advisory ID:** AEGIS-ADV-003
**Issued:** 2026-04-13
**Status:** Active

---

## Executive Summary

This advisory documents the Red Team Probe Sequence capability introduced to the Aegis Node Active Defense console. The capability performs read-only, self-targeted security probes against the local edge node to provide continuous posture visibility. It does not communicate with external networks, does not write to any system state, and does not execute privileged commands.

---

## 1. Capability Overview

The Red Team Probe Sequence (`/api/red-team/run`) is a streaming server-side intelligence gather that operates in three sequential phases:

| Phase | Code     | Description                                                 |
| ----- | -------- | ----------------------------------------------------------- |
| 1     | `PROBE`   | Five automated probe categories against the local node      |
| 2     | `ASSESS`  | AI-driven posture assessment of findings via Ollama         |
| 3     | `VERIFY`  | Consolidated summary of control verification and advisories |

All phases are **read-only**. The route opens no sockets beyond localhost, makes no external HTTP calls (except to `host.docker.internal:11434` for the local Ollama instance), and does not modify any files, firewall rules, or system configuration.

---

## 2. Probe Categories

### 2.1 WAF Coverage Audit

**What it does:** Reads the persisted WAF configuration from `data/.waf-config.json` and reports which pattern-match rules are currently enforced by the Next.js middleware layer.

**Rules evaluated:**

| Rule ID  | Pattern Target                                             | Risk Class |
| -------- | ---------------------------------------------------------- | ---------- |
| WAF-SQLi | SQL injection in URL params and query strings              | CRITICAL   |
| WAF-XSS  | Script injection vectors in inputs and hrefs               | HIGH       |
| WAF-PATH | Directory traversal sequences (`../`, `%2e%2e`)            | CRITICAL   |
| WAF-BOT  | Known scraper and scanner user-agent strings               | MEDIUM     |
| WAF-RATE | Rate limit advisory (logged, not enforced at Edge Runtime) | HIGH       |

**Threat model:** A disabled rule represents a gap in the middleware defense surface. The probe makes this visible without requiring manual inspection of config files.

### 2.2 Auth Boundary Sweep

**What it does:** Issues HTTP requests to known local endpoints and verifies that each returns the expected status code.

**Endpoints probed:**

| Path             | Method | Expected   | Rationale                                   |
| ---------------- | ------ | ---------- | ------------------------------------------- |
| `/api/heartbeat` | GET    | 200        | Public system telemetry — must be reachable |
| `/api/ai/stream` | GET    | 405 or 404 | POST-only endpoint — GET must be rejected   |
| `/console`       | GET    | 200        | Primary interface — must be accessible      |

**Threat model:** A 200 response from `/api/ai/stream` on GET indicates a missing method guard, which could allow unauthenticated prompt injection via a crafted GET request.

### 2.3 Port Survey

**What it does:** Attempts `net.connect` to localhost on eight ports with a 1500ms timeout. Reports open ports as informational findings, not failures.

**Ports surveyed:** 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (App), 5432 (Postgres), 6379 (Redis), 8080 (Alt-HTTP), 27017 (MongoDB)

**Threat model:** Unexpected open ports indicate shadow services that may expose additional attack surface. This is particularly relevant on a developer workstation where background services may be running without the operator's awareness.

**Note:** An open port is classified `info`, not `fail`. Port presence alone is not a vulnerability. Context from the AI analyst phase determines actual risk.

### 2.4 Sensitive File Exposure

**What it does:** Issues HTTP GET requests for three high-value static paths and checks whether the server returns a 200 response.

**Paths probed:**

| Path            | Classification         | Expected         |
| --------------- | ---------------------- | ---------------- |
| `/.env`         | Credentials / secrets  | 404 (not served) |
| `/.git/HEAD`    | Source code disclosure | 404 (not served) |
| `/package.json` | Dependency enumeration | 404 (not served) |

**Threat model:** Next.js serves files from `/public/` only. None of the probed paths should be accessible in a standard configuration. A 200 response is a critical finding — it indicates either a misconfigured Next.js `public/` directory or a custom route handler inadvertently serving static files.

### 2.5 Security Header Audit

**What it does:** Issues a GET request to `/console` and inspects the response headers for the presence of five security directives.

**Headers evaluated:**

| Header                      | Purpose                            |
| --------------------------- | ---------------------------------- |
| `x-frame-options`           | Clickjacking protection            |
| `x-content-type-options`    | MIME-type sniffing prevention      |
| `x-xss-protection`          | Legacy browser XSS filter          |
| `strict-transport-security` | HTTPS enforcement (HSTS)           |
| `content-security-policy`   | Script and resource origin control |

**Threat model:** Absent security headers are classified as advisories (`warn`), not failures. On a local-only node they carry reduced risk. However, this changes immediately if the node is exposed via a tunnel (ngrok, Tailscale, etc.) — the advisory surfaces before that exposure creates a real attack vector.

---

## 3. AI Posture Assessment (ASSESS Phase)

After the PROBE phase completes, all findings (pass, warn, fail, info) are serialized into a structured prompt and sent to the local Ollama instance (`llama3:8b-instruct-q4_K_M`). The model is asked to deliver a three-bullet posture assessment based solely on the probe findings.

**Prompt constraints:**

- No external network calls (Ollama runs on `host.docker.internal:11434`)
- No tool use or function calls — pure text generation
- Response is streamed directly to the terminal output panel
- If Ollama is offline, the phase emits a single advisory message and the VERIFY phase continues

**Data boundary:** The AI prompt contains only probe findings (status codes, open ports, header presence/absence). It does not include credentials, vault contents, or hardware telemetry.

---

## 4. Threat Model Boundaries

### In Scope (what this probe does)

- Read-only observation of local system posture
- Verification of WAF rule coverage
- HTTP status code probing of localhost endpoints
- TCP port reachability on 127.0.0.1
- Static file path probing via HTTP GET
- HTTP response header inspection
- AI-driven risk summarization of findings

### Out of Scope (what this probe deliberately does not do)

- Writing to any file, database, or system state
- Executing shell commands or pfctl rules
- Sending traffic outside localhost (beyond Ollama on Docker host network)
- Authenticated probing (no session tokens are used in probes)
- Exploit delivery or payload injection
- Fuzzing or brute-force techniques

---

## 5. Human-in-the-Loop Posture

The Red Team probe sequence is **operator-initiated only**. There is no scheduled execution, no background polling, and no automatic trigger. The probe runs when the operator clicks **Commence Probe** and terminates when the stream closes or the browser tab is closed.

No probe output is automatically acted upon. Findings are displayed in the terminal panel for operator review. Follow-on remediation (e.g., enabling a disabled WAF rule via AdaptiveShield) requires explicit operator action.

---

## 6. Operational Notes

**Runtime:** The probe route runs on the `nodejs` runtime (not Edge Runtime) because `net.connect` (TCP port scan) requires Node.js APIs unavailable in the V8 isolate environment.

**Timeout behavior:** Each HTTP probe carries a 3-second `AbortSignal.timeout`. Port probes carry a 1500ms socket timeout. The Ollama generation request carries a 60-second timeout. A probe that times out is reported as `warn` (unreachable), not `fail`.

**Concurrent probing:** Port probes are issued concurrently via `Promise.all`. Auth boundary and file exposure probes are sequential to avoid generating confusing interleaved output in the terminal stream.

**False positives:** The `.env` file probe may report `Not reachable` rather than `Not served (404)` if the dev server rejects the connection before sending a response. Both outcomes are classified `pass` — the file is not accessible.

---

## 7. Revision History

| Version | Date       | Author     | Change                                      |
| ------- | ---------- | ---------- | ------------------------------------------- |
| 1.0     | 2026-04-13 | Aegis Node | Initial release — five-phase probe sequence |
