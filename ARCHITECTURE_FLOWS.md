# AEGIS NODE — Architecture Flows

System architecture and data flow diagrams for the Aegis Active Defense Node.

---

## 1. Top-Level System Overview

```mermaid
graph TD
    subgraph CLIENT["Client (Browser)"]
        UI["Console UI\n(React 18 / Next.js 15)"]
    end

    subgraph EDGE["Edge Layer (Next.js Middleware)"]
        WAF["WAF Enforcement\nmiddleware.ts"]
    end

    subgraph SERVER["Server Layer (Node.js)"]
        SA["Server Actions\n/src/actions/"]
        API["API Routes\n/src/app/api/"]
    end

    subgraph STORAGE["Storage"]
        LANCE["LanceDB\n(Embedded Vector Store)"]
        DISK["Disk\ndata/.waf-config.json\ndata/.ack-file.json"]
    end

    subgraph AI["AI Layer"]
        OLLAMA["Ollama\nLlama-3-8B-Q4\nhost.docker.internal:11434"]
    end

    subgraph EXTERNAL["External"]
        VAN["Vanguard Protocol\nCloud Alert Feed"]
        HW["macOS Hardware\npfctl / sysctl / vm_stat"]
    end

    UI -->|"HTTP Request"| EDGE
    EDGE -->|"Pass / 403 Block"| SA
    EDGE -->|"Pass / 403 Block"| API
    SA -->|"Read/Write"| LANCE
    SA -->|"Read/Write"| DISK
    SA -->|"Embed / Generate"| OLLAMA
    API -->|"Stream"| OLLAMA
    SA -->|"sysctl / vm_stat"| HW
    SA -->|"Fetch alerts"| VAN
    UI -->|"SSE / Streaming"| API
```

---

## 2. WAF Enforcement Flow

Every inbound HTTP request passes through Next.js middleware before reaching any route.

```mermaid
sequenceDiagram
    participant Browser
    participant Middleware as middleware.ts (Edge)
    participant Cookie as aegis-waf Cookie
    participant Route as Next.js Route

    Browser->>Middleware: HTTP Request
    Middleware->>Cookie: Read aegis-waf state
    Cookie-->>Middleware: { WAF-SQLi: true, WAF-XSS: true, ... }

    alt WAF rule enabled AND pattern matches URL/UA
        Middleware-->>Browser: 403 Forbidden\n(X-Aegis-WAF: WAF-SQLi)
    else No match or rule disabled
        Middleware->>Route: Forward request
        Route-->>Browser: Normal response
    end
```

**Key design constraint:** WAF state is transported via an httpOnly cookie set by a server action on page load. The Edge Runtime (middleware) cannot read `fs`, so disk state is synced to the cookie before it is needed.

---

## 3. Vault Logging Flow (LanceDB)

All remediation actions are embedded and stored as vector signatures for semantic search.

```mermaid
flowchart LR
    A["Remediation Event\n(Edge alert resolved\nor Kinetic command deployed)"] --> B["logRemediation()\nsrc/actions/vault.ts"]
    B --> C["Ollama Embedding\nllama3:8b-instruct-q4_K_M\n4096-dim vector"]
    C -->|"embed() → float[]"| D["LanceDB table.add()\nRemediationSignature"]
    D --> E["Vault\n~/.lancedb/aegis_vault"]

    B -->|"Ollama offline fallback"| F["Zero Vector\nfloat[4096] = 0"]
    F --> D
```

---

## 4. Kinetic Command HITL Gate

pfctl commands are generated and displayed but **never auto-executed**. Human authorization is required.

```mermaid
stateDiagram-v2
    [*] --> Detected: Vanguard alert arrives
    Detected --> Built: buildKineticCommands()\n(authorized: false)
    Built --> Displayed: Rendered in Cloud Queue\nwith Authorize button
    Displayed --> Authorized: User clicks Authorize\n(authorized: true)
    Authorized --> PatchModal: User clicks Initialize Patch
    PatchModal --> Copied: User copies pfctl command
    PatchModal --> Logged: acknowledgeCloudAlerts()\nlogRemediation()
    Copied --> Executed: User manually runs\n$ pfctl -t aegis_blocklist -T add <ip>
    Logged --> [*]
    Executed --> [*]

    note right of Built
        command: pfctl -t aegis_blocklist -T add <ip>
        authorized: false
        This gate prevents autonomous firewall changes
        on the operator's only machine.
    end note
```

---

## 5. Defense Log AI Analysis Flow

The AI threat surface scan is triggered on demand from the Defense Log card.

```mermaid
sequenceDiagram
    participant User
    participant DefenseLog as DefenseLog.tsx
    participant Stream as /api/ai/stream
    participant Ollama as Ollama (llama3:8b-instruct-q4_K_M)
    participant Vault as LanceDB

    User->>DefenseLog: Click "Scan Threats"
    DefenseLog->>DefenseLog: buildScanContext(alerts, firewall, metrics, vanguardCount, recentLogs)
    DefenseLog->>Stream: POST /api/ai/stream { prompt }
    Stream->>Ollama: POST /api/generate { model, prompt, stream: true }
    Ollama-->>Stream: Streaming JSON chunks { response: "..." }
    Stream-->>DefenseLog: Text/event-stream
    DefenseLog->>DefenseLog: Append chunk to display
    DefenseLog->>Vault: logRemediation() on stream complete
    Vault-->>DefenseLog: Stored
```

---

## 6. Red Team Probe Sequence

The Red Team panel runs a five-phase read-only probe against the local node.

```mermaid
sequenceDiagram
    participant User
    participant Panel as RedTeamPanel.tsx
    participant Hook as useRedTeam()
    participant Route as /api/red-team/run (nodejs)
    participant Probes as red-team-probes.ts
    participant Ollama as Ollama

    User->>Panel: Click "Commence Probe"
    Panel->>Hook: commence()
    Hook->>Route: GET /api/red-team/run (streaming)

    Route->>Route: readEnabledWafRules() [disk]

    Note over Route,Probes: Phase 1 — SCOUT
    Route->>Probes: probeWafRules(enabledRules)
    Route->>Probes: probeAuthBoundary(baseUrl)
    Route->>Probes: probePorts([22, 80, 443, 3000, ...])
    Route->>Probes: probeFileExposure(baseUrl)
    Route->>Probes: probeSecurityHeaders(baseUrl)
    Probes-->>Route: ProbeResult[]

    Route-->>Hook: Stream [SCOUT] lines

    Note over Route,Ollama: Phase 2 — ATTACK
    Route->>Ollama: POST /api/generate { findings context }
    Ollama-->>Route: Streaming AI posture assessment
    Route-->>Hook: Stream AI chunks

    Note over Route: Phase 3 — AUDIT
    Route-->>Hook: Stream [AUDIT] summary
    Route-->>Hook: Stream closed

    Hook-->>Panel: output updated (React state)
    Panel->>Panel: Auto-scroll terminal output
```

---

## 7. Heartbeat Polling Loop

System state is refreshed every 5 seconds from the client.

```mermaid
flowchart TD
    A["useAegisPulse()\nsetInterval 5s"] -->|"GET /api/heartbeat"| B["heartbeat/route.ts"]
    B --> C["getHardwareMetrics()\n(sysctl / vm_stat)"]
    B --> D["getFirewallStatus()\n(pfctl -s info)"]
    B --> E["getScanAlerts()\n(file integrity scanner)"]
    B --> F["getVanguardFeed()\n(remote alert API)"]
    C & D & E & F -->|"Promise.all"| G["JSON response"]
    G -->|"setData(next)"| A
```

---

## 8. Component Hierarchy

```mermaid
graph TD
    PAGE["console/page.tsx\n(Server Component)"] --> CLIENT["ConsoleClient.tsx\n(Client Root)"]

    CLIENT --> RQ["RemediationQueue\n(Edge + Cloud queues)"]
    CLIENT --> PH["PerimeterHealth\n(pfctl status)"]
    CLIENT --> VS["VaultSearch\n(LanceDB semantic search)"]
    CLIENT --> DL["DefenseLog\n(Live vault + AI scan)"]
    CLIENT --> AS["AdaptiveShield\n(WAF toggles)"]
    CLIENT --> RT["RedTeamPanel\n(Probe sequence)"]

    RQ --> PM["PatchModal\n(HITL deploy gate)"]

    subgraph ATOMS["UI Atoms"]
        ACard["AegisCard"]
        ABtn["AegisButton"]
        CH["CardHeader"]
        SB["StatusBadge"]
        ST["SeverityTag"]
    end

    DL & AS & RT & PH & VS --> ATOMS
```
