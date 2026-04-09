# ⬢ AEGIS NODE | Architecture & Governance

## 1. Project Intent

Aegis is the Active Defense node of the Vanguard Protocol. It provides autonomous remediation and edge hardening for local hardware (Mac M4).

## 2. Technical Stack

- **Framework:** Next.js 16 (App Router + React 19)
- **UI:** Tailwind CSS (Electric Violet Theme)
- **Sandbox:** OrbStack (Docker) limited to 4GB RAM
- **AI:** Local Ollama (Llama-3-8B-Q4) via host.docker.internal
- **Storage:** LanceDB (Embedded Vector Store)

## 2.1 Version Governance & Stability Lock

**Strict Version Policy:** This project is locked to **Next.js 15 LTS** and **React 18**. Do not attempt to upgrade dependencies to Next.js 16 or React 19.

- **Reasoning:** Aegis is a Phase 3 Enforcement Node. We prioritize the "Hardened Stability" of the v15 Async Request APIs and Middleware over the bleeding-edge features of v16.
- **Memory Optimization:** v15 maintains a leaner footprint, preserving maximum Unified Memory for local Llama-3 inference on the M4.
- **Ecosystem Parity:** While Vanguard (Phase 2) operates on v16 for cloud-scale reconnaissance, Aegis operates on v15 to ensure 100% uptime during kernel-level remediation.
- **Constraint:** If the Agent detects an "upgrade available" notice, it must be ignored. All new code must conform to React 18 patterns (avoiding React 19 specific hooks like `useActionState`).

## 3. Development Workflow (The Sprint Protocol)

- **Feature Branches:** e.g.: `feat/`, `fix/`, `refactor/`
- **Atomic Commits:** group changed files meaningfully and create several commits per feature. Separate concerns:
  1. UI/Layout
  2. API/Routes
  3. Logic/Service
  4. Integration/Testing
- **Commit Metadata:** never include "Co-authored-by: Claude", "Co-Authored-By:", or any AI attribution tags in commit messages.
  - **How to apply:** Write all commit messages without any trailing attribution lines. This applies to every commit, on every branch, always.
- **No Merges:** Pushing to remote is encouraged, but merging is restricted to the Architect (User).
- **Modular Architecture:**
  - **Extraction:** If a component or file exceeds approximately 200 lines, extract logic into specialized sub-files within the same directory:
    - `[feature].types.ts` (Interfaces/Types)
    - `[feature].hooks.ts` (React hooks/State)
    - `[feature].utils.ts` (Pure helper functions)
    - `[feature].constants.ts` (Static config/strings)
  - **Separation of Concerns:** Keep Business Logic (Services) out of the UI (Components). Use Server Actions for hardware/database execution and maintain clean, declarative JSX.

## 4. Code Layout & Architecture

Maintain thin entrypoints. Logic must be extracted once a file exceeds approx. 150 lines.

### Directory Mapping

| Area                    | Purpose                                                                       |
| :---------------------- | :---------------------------------------------------------------------------- |
| `src/app/`              | **Routing Only:** `page.tsx`, `layout.tsx`, `loading.tsx`. Minimal logic.     |
| `src/actions/`          | **Server Actions:** Hardware (CPU/RAM) & AI (Ollama/Llama-3) bridge logic.    |
| `src/components/ui/`    | **Primitives:** Tactical buttons, Hexagon icons, Progress bars.               |
| `src/components/aegis/` | **Features:** Kinetic Queue, Defense Log, Shield Integrity cards.             |
| `src/lib/`              | **Glue:** Ollama client initialization, LanceDB connection, formatting utils. |
| `src/hooks/`            | **State:** Shared logic like `useAegis.ts` or `useOllamaStream.ts`.           |
| `src/constants/`        | **Truth:** Fixed status strings, color hexes, M4 hardware caps.               |
| `src/types/`            | **Safety:** Shared TypeScript interfaces for Remediation and Logs.            |

### Naming Conventions & Hygiene

- **Markdown Files:** All `.md` files must be **ALL_CAPS** (e.g., `README.MD`, `CLAUDE.MD`).
- **React Hooks:** Use **camelCase** for hook filenames (e.g., `src/hooks/useAegis.ts`, `src/hooks/useOllamaStream.ts`).

### Architectural Rules

- **No Magic Strings:** All status text (e.g., "Edge Remediation Grid: Engaged") belongs in `constants/`.
- **Pure Helpers:** Extraction into `lib/` must be file-specific (e.g., `lib/parse-logs.ts`).
- **Path Aliases:** Strictly use `@/*` for all internal imports to maintain a clinical dependency graph.
- **Colocation:** One-off hooks or components stay next to the feature until reuse is required across multiple routes.
- **Server-First:** Prioritize Server Actions over Client-side fetching to protect local hardware data.

## 5. Operational Commands

- `npm run dev` - Start UI
- `docker-compose up` - Start Sandbox
- `./setup.sh` - Run Pre-flight check
