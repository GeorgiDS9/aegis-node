# 📘 Operations Runbook — Aegis Node

This document provides technical procedures for maintaining Aegis Node, resolving common failure modes, and conducting adversarial validation via the Red Team sequence.

---

## 🛰️ Heartbeat Semantics (`/api/heartbeat`)

Aegis uses a background polling loop to maintain system state. The heartbeat endpoint consolidates four critical data streams.

- **Status 200**: All systems communicating.
- **Status 200 (Degraded)**: One or more sensors returned an error (e.g., `Sensor Restricted` for pfctl). The UI renders these as advisories.
- **Status 500**: "Pulse Failure" — The server process is unable to execute core logic or reached an unhandled exception.

### Dependency Health Check

| Dependency | Component | Failure Sign | Remediation |
| :--- | :--- | :--- | :--- |
| **Ollama** | Local AI | "AI Engine Offline" in UI | Verify `ollama serve` is running; check `OLLAMA_API_URL`. |
| **LanceDB** | Vault Memory | Zero-vector logs; write errors | Check `VECTOR_DB_PATH` permissions and disk space. |
| **Vanguard** | Cloud Feed | "Vanguard Bridge Offline" | Validate `VANGUARD_API_URL` and `VANGUARD_API_KEY`. |
| **pfctl** | Firewall | "Sensor Restricted" | Expected on macOS if not running as root/service. |

---

## 🛠️ Common Failure Modes

### 1. Ollama/AI Intelligence Failure
*   **Symptom**: Threat Scan stuck or "AI Engine Offline".
*   **Verification**: `curl http://127.0.0.1:11434/api/tags`
*   **Fix**:
    1.  Ensure Ollama is running (`brew services start ollama` or macOS App).
    2.  Verify the model is pulled: `ollama pull llama3:8b-instruct-q4_K_M`.
    3.  Check `host.docker.internal` mapping if running inside OrbStack.

### 2. Vault Synchronization Issues
*   **Symptom**: New remediations don't appear in Defense Log.
*   **Fix**:
    1.  Inspect `./data/vault` for locking files (`.lock`).
    2.  Check for `Zero Vector Fallback` in logs (indicates Ollama was unreachable during write).
    3.  Verify the Next.js server has write permission to the root `./data/` directory.

### 3. Vanguard Integration Timeout
*   **Symptom**: Cloud Queue is empty despite alerts being active on Vanguard.
*   **Fix**:
    1.  The Aegis bridge has a 1s circuit breaker. If Vanguard is slow, it will skip it.
    2.  Test connectivity: `npm run verify:vanguard` (if implemented) or manual curl with bearer token.
    3.  Check `src/lib/vanguard-cache.ts` for stale cache entries (30s TTL).

---

## 🥊 Red Team Mode (`/api/red-team/run`)

The Red Team sequence is a **controlled adversarial run**. It is **advisory-only** and **read-only**.

### Usage Protocol
*   **Standard Usage**: Keep Red Team mode inactive unless performing a scheduled posture audit.
*   **Controlled Runs**: Click "Commence Probe" to trigger the sequence.
*   **Isolation**: The probe sequence strictly targets `127.0.0.1`. It does not send packets to the LAN or WAN.
*   **CI Validation**: The Red Team sequence is mocked in Playwright for CI, but can be run live in a staging environment to verify `middleware.ts` enforcement.

### Troubleshooting Probes
*   **"Auth Boundary 200 FAIL"**: Check if `/api/ai/stream` has a missing `POST` method guard in `route.ts`.
*   **"File Exposure 200 FAIL"**: Verify `.env` is NOT in the `public/` directory and that Next.js isn't being tricked by path traversal.

---

## 🚨 Immediate Remediation (SOP)

1.  **Stop/Start Circuit**: If Heartbeat returns 500, restart the dev server: `npm run dev`.
2.  **Auth Lockout**: If the Operator PIN is lost, check `.env.local` for `AEGIS_OPERATOR_PIN`.
3.  **WAF Bypass**: If you are locked out of the console by a WAF rule, clear your browser cookies (specifically `aegis-waf`) or manually edit `data/.waf-config.json` and set all rules to `false`.
4.  **Firewall Recovery**: To clear the `aegis_blocklist` manually:
    ```bash
    sudo pfctl -t aegis_blocklist -T flush
    ```

---

## 📂 Operational Assets

- **Heartbeat**: [`src/app/api/heartbeat/route.ts`](../src/app/api/heartbeat/route.ts)
- **Deployment Script**: [`setup.sh`](../setup.sh)
- **WAF Config**: `data/.waf-config.json`
- **Acknowledgment Log**: `data/.ack-file.json`
