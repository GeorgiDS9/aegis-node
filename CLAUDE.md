# ⬢ AEGIS NODE | Architecture & Governance

## 1. Project Intent

Aegis is the Active Defense node of the Vanguard Protocol. It provides autonomous remediation and edge hardening for local hardware (Mac M4).

## 2. Technical Stack

- **Framework:** Next.js 16 (App Router + React 19)
- **UI:** Tailwind CSS (Electric Violet Theme)
- **Sandbox:** OrbStack (Docker) limited to 4GB RAM
- **AI:** Local Ollama (Llama-3-8B-Q4) via host.docker.internal
- **Storage:** LanceDB (Embedded Vector Store)

## 3. Development Workflow (The Sprint Protocol)

- **Feature Branches:** e.g.: `feat/`, `fix/`, `refactor/`
- **Atomic Commits:** group changed files meaningfully and create several commits per feature. Separate concerns:
  1. UI/Layout
  2. API/Routes
  3. Logic/Service
  4. Integration/Testing
- **Commit Metadata:** Do not include "Co-authored-by: Claude" or any AI-attribution tags in commit messages.
- **No Merges:** Pushing to remote is encouraged, but merging is restricted to the Architect (User).
- **Modular Architecture:**
  - **Extraction:** If a component or file exceeds approximately 200 lines, extract logic into specialized sub-files within the same directory:
    - `[feature].types.ts` (Interfaces/Types)
    - `[feature].hooks.ts` (React hooks/State)
    - `[feature].utils.ts` (Pure helper functions)
    - `[feature].constants.ts` (Static config/strings)
  - **Separation of Concerns:** Keep Business Logic (Services) out of the UI (Components). Use Server Actions for hardware/database execution and maintain clean, declarative JSX.

## 4. Operational Commands

- `npm run dev` - Start UI
- `docker-compose up` - Start Sandbox
- `./setup.sh` - Run Pre-flight check
