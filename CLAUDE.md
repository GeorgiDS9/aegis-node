# ⬢ AEGIS NODE | Architecture & Governance

## 1. Project Intent

Aegis is the Active Defense node of the Vanguard Protocol. It provides autonomous remediation and edge hardening for local hardware (Mac M4).

## 2. Technical Stack

- **Framework:** Next.js 15 (App Router + React 18)
- **UI:** Tailwind CSS (Electric Violet Theme)
- **Sandbox:** OrbStack (Docker) limited to 4GB RAM
- **AI:** Local Ollama (Llama-3-8B-Q4) via host.docker.internal
- **Storage:** LanceDB (Embedded Vector Store)

## 2.1 Version Governance & Stability Lock

**Strict Version Policy:** This project is locked to **Next.js 15.0.0** (exact pin) and **React 18**. Do not upgrade without an explicit decision from the Architect.

- **Reason:** The codebase is built and tested on these versions. An upgrade mid-project introduces churn with no concrete benefit — wait until there is a specific feature or fix that warrants it.
- **Constraint:** All new code must use React 18 patterns. Do not use React 19-specific APIs (e.g. `useActionState`). If an "upgrade available" notice appears, ignore it.

## 3. Development Workflow (The Sprint Protocol)

- **Repo Layout:** `spectra/` is the root container. `apps/spectra-app/` and `apps/spectra-api/` are independently deployable sub-projects, each with their own `package.json`.
- **Feature Branches:** `feat/`, `fix/`, `refactor/` — **always required** for any UI change, refactor, or code change. Only documentation updates (`.md` files) may be committed directly to `main`.
- **Atomic Commits:** Group changed files meaningfully. Separate concerns across multiple commits (not just 1-2) where applicable:
  1. Infrastructure / IaC
  2. API Routes / Lambda handlers
  3. Agent logic / LangGraph graph
  4. UI / Components
  5. Config / Env / CI
- **Commit Metadata:** Never include "Co-authored-by: Claude", "Co-Authored-By:", or any AI attribution tags in commit messages.
  - **How to apply:** Write all commit messages without any trailing attribution lines. This applies to every commit, on every branch, always.
- **Lock file rule:** Always stage `package-lock.json` alongside `package.json`. Every `npm install` updates both — committing one without the other leaves a dirty working tree.
- **Prettier config:** Every new repo or sub-app must include a `.prettierrc` at its root on day one. Config: `singleQuote: false` (double quotes), `semi: true`, `tabWidth: 2`, `trailingComma: "all"`, `printWidth: 100`. Run `prettier --write "**/*.{ts,tsx}"` after adding the config to normalize existing files.
- **No Merges:** Pushing to remote is encouraged, but merging is restricted to the Architect (User).
- **Branch Hygiene Gate:** Before creating any new branch, run `git branch --merged` and delete any merged local branches. If genuinely unmerged branches exist, stop and alert the Architect — never create a new branch or merge until older branches are resolved and the Architect confirms CI is green.
- **Platform steps:** After each Phase, alert the Architect with a list of AWS Console / external platform steps required to support the changes (e.g., enabling Bedrock model access, creating Supabase project, adding Inngest app, setting Upstash env vars).
- **Modular Architecture:**
  - **Extraction:** If a component or file exceeds 200-300 lines, extract logic into specialized sub-files within the same directory (with the **exception** of long sequential functions that can go up to 400-500 lines):
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

- **Markdown Files:** All `.md` files must have **ALL_CAPS** names (e.g., `README.md`, `CLAUDE.md`). The extension itself stays lowercase (e.g., `.md`)
- **React Hooks:** Use **camelCase** for hook filenames (e.g., `src/hooks/useAegis.ts`, `src/hooks/useOllamaStream.ts`).

### TypeScript Strictness

- **No `any` types:** Never use `any`. Use `unknown` with a type guard, explicit interfaces, or `Record<string, unknown>` where the shape is dynamic.
- **Explicit `useState` generics:** Always annotate state with its type — e.g., `useState<boolean>(false)`, `useState<string>('')`, `useState<MyType | null>(null)`. Never rely on inference alone.
- **Explicit `useRef` generics:** Always annotate — e.g., `useRef<HTMLParagraphElement>(null)`, `useRef<AbortController | null>(null)`.

### Architectural Rules

- **No Magic Strings:** All status text (e.g., "Edge Remediation Grid: Engaged") belongs in `constants/`.
- **Pure Helpers:** Extraction into `lib/` must be file-specific (e.g., `lib/parse-logs.ts`).
- **Path Aliases:** Strictly use `@/*` for all internal imports to maintain a clinical dependency graph.
- **Colocation:** One-off hooks or components stay next to the feature until reuse is required across multiple routes.
- **Server-First:** Prioritize Server Actions over Client-side fetching to protect local hardware data.

## 4.1 UI Consistency & Tactical Sizing

Strict adherence to the "Mission Control" aesthetic is mandatory. Do not use ad-hoc Tailwind classes for typography or status markers if a primitive exists.

- **Component Reuse:** Prioritize `AegisButton`, `StatusBadge`, `SystemLabel`, and `SeverityTag`.
- **Component Lifecycle:** If a specific UI pattern or style (e.g., a specific glow+border combo) is used more than twice, it MUST be extracted into a reusable component in `src/components/ui/`.
- **Surgical Font Scale:**
  - **11px (Black/Uppercase):** Primary card headers and terminal titles (e.g., `Remediation_Protocol`).
  - **10px (Black/Uppercase):** Card-level status indicators (e.g., `SIMULATION`, `LIVE`, `STANDBY`). Use `size="md"` for badges.
  - **10px (Mono/Medium):** Metadata labels and system info (Standard `SystemLabel` default).
  - **9px (Black/Uppercase):** Internal item tags and row-level markers (e.g., `CRITICAL`, `HITL: ACTIVE`, `RESTRICTED`). Use `size="sm"` for badges.
- **Color Discipline:**
  - **Violet-600/500:** Active protocol engagement / AI streams.
  - **Slate-800/900:** Passive/Standby containers and neutral feeds.
  - **Emerald/Amber/Red:** Functional status only (Success/Sync/Alert).

## 5. Operational Commands

- `npm run dev` - Start UI
- `docker-compose up` - Start Sandbox
- `./setup.sh` - Run Pre-flight check
