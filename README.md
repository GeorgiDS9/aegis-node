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
