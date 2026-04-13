# ⬢ Aegis Node: Autonomous Remediation & Multi-Layer Hardening

**Agentic AI - Phase 3 Active Remediation | Next.js 16 | Ollama Llama-3 | Unified Memory Optimized | macOS Native Enforcement | Response Layer for the Vanguard Protocol**

## What is Aegis Node?

**While Vanguard provides passive observation and reconnaissance, Aegis executes autonomous remediation and perimeter hardening at the edge.**

Aegis is the **Active Remediation Node** of the ecosystem. It turns Vanguard's intelligence into automated threat neutralization through real-time patching, adaptive WAF rules, and self-healing infrastructure. It extends protection from the cloud perimeter down to edge hardware and kernel-level distributed systems on Apple Silicon (M4).

## What is Vanguard Protocol?

Protocol Definition: Vanguard is a decentralized intelligence grid providing real-time vulnerability reconnaissance. Aegis is the authorized remediation node for the local Mac-Silicon (M4) perimeter.

## 🛰️ System Identity

- **Ecosystem:** Vanguard Protocol
- **Role:** Active Defense / Autonomous Remediation
- **Primary Environment:** Apple Silicon (M4) Edge Node **(macOS Native)**

## 🛠️ Technical Stack

- **Framework:** Next.js 15 (App Router / React 18)
- **Engine:** Ollama (Llama-3-8B-Q4) for Local Intelligence
- **Database:** LanceDB (Embedded Vector Store for Local Sovereignty)
- **Sandbox:** OrbStack (Containerized Node.js Environment)
- **Styling:** Tailwind CSS + Lucide React

## 🖼️ Product Snapshot

> Aegis Node - Landing Page

### ![Aegis Node - Landing Page](./docs/assets/aegis-node-landing-page.png)

> Aegis Node - Defense Console

### ![Aegis Node - Defense Console - Top](./docs/assets/aegis-node-defense-console-1.png)

### ![Aegis Node - Defense Console - Bottom](./docs/assets/aegis-node-defense-console-2.png)

### ![Aegis Node - Defense Console - Deploy Remediation](./docs/assets/aegis-node-deploy-remediation.png)

### ![Aegis Node - Defense Console - Small devices](./docs/assets/aegis-node-defense-console-small.png)

## 🔒 Safety & Isolation

### Firewall Audit — Read-Only, Always

`getFirewallStatus()` (`src/actions/firewall.ts`) calls `pfctl -s info` — the information-only flag. Hard constraints:

- **Never** runs with `sudo`
- **Never** uses `-e` (enable), `-d` (disable), `-f` (load ruleset), or any write flag
- The UI shows **Auditor Mode** when elevated access is unavailable (normal in sandboxed/Docker environments)
- The action distinguishes `Permission denied` (expected) from unexpected failures

Aegis reads the perimeter — it does not own it.

### Adaptive Shielding — Simulation Layer

WAF rule toggles are **mock/simulation only**. No system calls, no kernel hooks, no network configuration is modified. Each toggle writes an enforcement event to LanceDB for audit trail. The **Simulation** badge in the UI makes this explicit at all times.

### Vault (LanceDB)

Runs embedded within the Next.js process. No external port, no remote connection, no credentials. Data stored at `data/vault/` — local only.

> [!TIP]
> **Architecture & Security Context:** For runtime flow diagrams covering WAF enforcement, vault logging, the Kinetic HITL gate, and the Red Team probe sequence, see [ARCHITECTURE_FLOWS.md](./ARCHITECTURE_FLOWS.md).
> For adversarial probe methodology, threat model, and control verification outcomes, see [SECURITY_ADVISORY.md](./SECURITY_ADVISORY.md) (AEGIS-ADV-003).
> For engineering rationale behind the pfctl advisory model, WAF Edge Runtime constraints, and vault zero-vector fallback, see [TECHNICAL_ADVISORY.md](./TECHNICAL_ADVISORY.md).

## ⚡ Red Team Validation

Aegis includes a built-in self-probe capability that runs a read-only Scout → Attack → Audit sequence against the local node. It verifies WAF coverage, auth boundary behavior, open ports, sensitive file exposure, and security header posture — then feeds all findings to the local Ollama instance for AI-driven risk summarization.

See [`SECURITY_ADVISORY.md`](./SECURITY_ADVISORY.md) (AEGIS-ADV-003) for probe methodology, threat model, and control verification outcomes.

---

## 🚦 Getting Started

Follow this four-stage protocol to initialize the Aegis Node and verify its active defense layers.

### 1. Environment Initialization

```bash
git clone https://github.com/GeorgiDS9/aegis-node
cd aegis-node
npm install
```

### 2. Infrastructure Configuration

Aegis requires no API keys — all intelligence runs locally. You will need:

**OrbStack** (Docker sandbox, Apple Silicon optimized):

```bash
# Install from https://orbstack.dev, then:
docker-compose up
```

**Ollama** (local AI engine, macOS native):

```bash
# Install from https://ollama.com, then pull the inference model:
ollama pull llama3:8b-instruct-q4_K_M
```

Ollama must be running on `localhost:11434` before starting the dev server. The application bridges to it at `host.docker.internal:11434` from inside the OrbStack sandbox.

### 3. Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page. The defense console is at `/console`.

### 4. Automated Security Audits

Aegis uses **Vitest** for fast offline unit tests covering probe logic, WAF pattern matching, kinetic command generation, vault operations, and Defense Log utilities. **GitHub Actions** runs lint, TypeScript strict check, security audit, and unit tests on every push and pull request to `main`.

**Unit tests (Vitest)**

```bash
npm test               # single run
npm test -- --watch    # watch mode
```

Current coverage: **119 tests across 6 files** — all offline, no Ollama or LanceDB required.

| Suite | Tests | What it covers |
|-------|-------|----------------|
| `waf-patterns` | 26 | WAF regex patterns (SQLi, XSS, PATH, BOT) |
| `defense-log.utils` | 24 | Log mapping, time formatting, AI context builder |
| `red-team-probes` | 34 | WAF audit, auth boundary, port survey, file exposure, headers |
| `kinetic-bridge` | 14 | pfctl command derivation and HITL defaults |
| `alert-id` | 11 | Stable content-hash alert ID generation |
| `vault` | 10 | LanceDB logging, embedding fallback, semantic search |

**End-to-end (Playwright)** — _coming in the next branch_

Playwright e2e tests for the COMMENCE PROBE flow, WAF toggle → badge change, and Defense Log scan trigger are tracked for the next release.

**CI (GitHub Actions)**

Four gates run in parallel on every push:

| Job | What it checks |
|-----|----------------|
| Security Audit | `npm audit --audit-level=high` |
| Clinical Code Standards | ESLint strict (Next.js flat config) |
| TypeScript Strict Check | `tsc --noEmit` |
| Unit Tests | Vitest (`npm test`) |

---

## 🧭 Engineering Philosophy

**Aegis Node** demonstrates that **Active Defense** does not require autonomous execution. By applying a **Human-in-the-Loop (HITL)** gate to every remediation command and keeping all intelligence local (no cloud APIs, no telemetry), this project provides a blueprint for **governed edge security** that prioritizes **Operator Authority**, **Execution Safety**, and **Local Sovereignty**.

---

## 🧭 How to Use the Aegis Console

Aegis output is most valuable when treated as an operational decision aid backed by live system telemetry — not a passive dashboard to glance at.  
Use it to accelerate secure triage while preserving verification discipline.

### A) Immediate Operator Workflow

After the console loads, use it to:

1. **Assess the edge surface**  
   Review the Shield Integrity and Active Alerts metric cards. Cross-reference Edge Queue alerts with Cloud Queue Vanguard signals to distinguish local drift from remote threat activity.

2. **Review kinetic recommendations**  
   The Cloud Queue surfaces pfctl commands derived from Vanguard alerts. Read the command, understand the IP or target, then decide whether to **Authorize** before opening the Patch Modal.

3. **Execute with HITL discipline**  
   Open Initialize Patch, copy the command manually, and run it in your own terminal. Aegis never executes firewall rules on your behalf — operator intent is the execution layer.

4. **Log and close**  
   Every authorized command is logged to the Vault before the modal closes. The Defense Log reflects the action in the live feed automatically.

### B) Red Team Operator Workflow

Use the Red Team panel for periodic self-assessment:

1. Click **Commence Probe** to initiate the Scout → Attack → Audit sequence.
2. Review SCOUT findings phase by phase — WAF coverage gaps (`⚠`) and file exposure failures (`✗`) require immediate action; open ports (`→`) are informational.
3. Read the AI posture assessment (ATTACK phase) as an operator brief, not a verdict. It synthesizes findings but does not have full network or process context.
4. Use `[AUDIT]` summary counts to decide whether to escalate to a formal review.

### C) Compliance and Audit Workflow

For governance-aligned environments:

- Treat Vault entries as append-only remediation evidence — every action is timestamped and embedded for semantic retrieval.
- Use VaultSearch to surface past decisions by natural language query ("what was remediated for port scan alerts last week").
- Use the Defense Log AI scan as a first-pass threat surface narrative suitable for shift handoffs or incident tickets.
- Preserve HITL authorization context (who clicked Authorize, which command, at what time) alongside vault records.

### D) Good Usage Practices

To get reliable value:

- Run the Red Team probe at the start of a session and after any infrastructure change.
- Keep WAF toggles intentional — every change is logged to the Vault and reflected in Red Team probe output.
- Treat `⚠ warn` probe results as investigation leads. A missing security header is not a breach; an exposed `.env` file is.
- Do not rely on AI threat summaries alone — they summarize telemetry, they do not replace it.

### E) What Aegis Is Not

Aegis is not an autonomous firewall manager.  
Its purpose is governed edge hardening with operator authority and auditable decision flow at the center. No system state changes without an explicit human action.

---

## 🎯 How to Engage the Defense Console

Use the console for concrete, targeted remediation actions.  
Best results come from one clear objective per session.

**Effective use patterns:**

- Open the console, check the Edge Queue for new integrity alerts, click **Fix** on the highest-severity item, review the streamed remediation plan, then log it.
- When Vanguard surfaces a new IP threat, open the Cloud Queue, review the derived pfctl command, authorize it if warranted, copy it from the Patch Modal, and run it manually.
- Click **Scan Threats** in the Defense Log to get an AI-synthesized surface analysis of the current CPU, memory, firewall, and alert state in under 10 seconds.
- Run **Commence Probe** in the Red Team panel after enabling or disabling WAF rules to verify the rule change is reflected in the probe output.
- Use VaultSearch with natural language queries to retrieve semantic matches from past remediation history.

✅ **Operator note:** When authorizing a Kinetic command, read the full pfctl command before clicking Authorize. The command is constructed from the Vanguard alert's source IP or target field. Verify the IP is what you expect before executing it in your terminal.

---

## 🏗️ Core Architecture

- **Edge-Middleware WAF:** Request inspection runs in the Next.js Edge Runtime (middleware.ts) before every route. Pattern-matching rules (SQLi, XSS, PATH traversal, Bot signatures) are applied to URL + query string + User-Agent. Matched requests receive a `403` with `X-Aegis-WAF: <rule-id>`.
- **HITL Kinetic Gate:** pfctl commands are derived from Vanguard alerts by `buildKineticCommands()` with `authorized: false`. No command executes automatically — the operator must Authorize, open PatchModal, and copy-paste into their own terminal.
- **Vault Memory (LanceDB):** Every remediation event is embedded via Ollama (4096-dim) and stored as a `RemediationSignature`. Zero-vector fallback ensures logging continues when Ollama is offline. The vault is append-only and supports semantic similarity search.
- **Local AI Inference (Ollama):** All LLM calls route to `host.docker.internal:11434` — no Anthropic, OpenAI, or external API. The model (`llama3:8b-instruct-q4_K_M`) runs inside the OrbStack sandbox. No prompt data or telemetry leaves the host network.
- **Red Team Self-Probe:** Five-phase read-only probe sequence (WAF coverage → auth boundary → port survey → file exposure → security headers) followed by AI posture assessment. All probe functions accept injected fetcher/connector interfaces for offline testability.
- **Heartbeat Polling:** `useAegisPulse()` polls `/api/heartbeat` every 5 seconds via `Promise.all` across four data sources: `sysctl`/`vm_stat` (hardware metrics), `pfctl -s info` (firewall), file integrity scanner (edge alerts), and Vanguard feed (cloud alerts).
- **Vanguard Protocol Integration:** Cloud alert feed from Vanguard is ingested on every heartbeat. Alerts are stable-ID'd via content hash, acknowledged to disk (`data/.ack-file.json`), and filtered from the Cloud Queue after deploy.
- **Server-First Architecture:** All hardware reads, vault writes, and WAF config persistence run as Next.js Server Actions. No sensitive system data is fetched client-side. The Edge Runtime gate runs before server logic, not inside it.
- **Streaming AI Output:** All AI responses (remediation plans, threat scans, red team posture assessment) stream token-by-token via `ReadableStream`. The UI appends chunks in real time — no full-response wait.
- **Modular Extraction Pattern:** Files approaching ~150 lines are split into `[feature].types.ts`, `[feature].hooks.ts`, `[feature].utils.ts` — keeping each concern independently testable and the UI declarative.

---

## ✅ Operational Validation

Aegis is validated across WAF enforcement, HITL safety, vault integrity, and red team probe accuracy.

- **WAF Pattern Test:** Send a request with `?q=UNION+SELECT+*+FROM+users` to any console route.
  - **Expect:** `403 Forbidden` with `X-Aegis-WAF: WAF-SQLi` header. The request never reaches the route handler.

- **HITL Gate Test:** Authorize a Kinetic command in the Cloud Queue, open Initialize Patch, observe the pfctl command in the modal.
  - **Expect:** Command is displayed with a copy button and a "Logged to vault — firewall execution requires sudo" sublabel. No firewall change occurs until you manually run the command.

- **Red Team Probe Test:** Click Commence Probe with all WAF rules disabled.
  - **Expect:** All WAF rules appear as `⚠ disabled`. Auth boundary shows `/api/heartbeat → 200 ✓`. File exposure shows `.env → Not served (404) ✓`. AI ATTACK phase streams a posture summary.

- **Vault Semantic Search Test:** Resolve an Edge Queue alert, then search "file integrity" in VaultSearch.
  - **Expect:** The vault returns the logged remediation record with a similarity score, even if the exact wording differs from the stored action.

- **Ollama Offline Resilience:** Stop Ollama and click Scan Threats in the Defense Log.
  - **Expect:** The AI panel displays "AI Engine Offline — Ensure Ollama is running on Host" without crashing the component or the page.

---

## 🚀 Project Roadmap

- [x] **Edge WAF Enforcement:** Next.js middleware pattern-matching (SQLi, XSS, PATH traversal, Bot signatures) with cookie-based state persistence across Edge Runtime boundary.
- [x] **Kinetic HITL Gate:** Vanguard alert → pfctl command derivation → operator authorization → PatchModal copy flow. No autonomous firewall execution.
- [x] **LanceDB Vault:** Append-only remediation memory with Ollama embeddings, zero-vector fallback, and semantic similarity search.
- [x] **Live Heartbeat:** 5-second polling loop across hardware metrics, firewall status, file integrity scanner, and Vanguard cloud feed.
- [x] **Vanguard Protocol Integration:** Cloud alert ingestion, stable content-hash IDs, disk-persisted acknowledgement, and immediate client-side suppression after deploy.
- [x] **Adaptive Shield (WAF Toggles):** Per-rule enable/disable with disk + cookie persistence, logged to vault on every change.
- [x] **Defense Log + AI Threat Scan:** Live vault feed with on-demand AI posture assessment streamed from Ollama. Captured in collapsible Threat Analysis blocks.
- [x] **Red Team Probe Sequence:** Five-phase read-only self-probe (Scout → Attack → Audit) with streaming terminal output and AI synthesis.
- [x] **Unit Test Suite:** 119 Vitest tests across 6 suites — all offline, injectable dependencies. WAF patterns, probe logic, kinetic bridge, vault, alert IDs, Defense Log utils.
- [x] **CI/CD:** GitHub Actions — Security Audit, ESLint, TypeScript strict check, and Vitest on every push to `main`.
- [x] **Architecture & Security Docs:** `ARCHITECTURE_FLOWS.md` (8 Mermaid diagrams), `SECURITY_ADVISORY.md` (AEGIS-ADV-003), `TECHNICAL_ADVISORY.md`.
- [ ] **Playwright e2e:** COMMENCE PROBE flow, WAF toggle → badge change, Defense Log scan trigger — tracked for next branch.
- [ ] **Auth hardening review:** Re-evaluate HMAC session cookie approach against a lightweight auth library; preserve `/console` and `/api/*` protection posture.
- [ ] **WAF-RATE enforcement:** Persistent rate-limit state requires an upstream reverse proxy or edge KV store — out of scope for the current Edge Runtime model.
