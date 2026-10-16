# Ashan.ai Desktop - Open Source Reconstruction

## Disclaimer
This is a **reverse-engineered reconstruction** of the proprietary Ashan.ai desktop application (version 2.0.2, Apache-2.0 licensed, `private: true`). The original source code is not publicly available. This reconstruction documents the architecture, API surface, and data structures derived from static analysis of the compiled bundles using REA (Reverse Engineering Analyzer).

**Status:** Not affiliated with Zhipu AI. Educational/research reconstruction only.

## Overview

Ashan.ai is an Electron-based desktop AI agent product for UMKM (Usaha Mikro, Kecil, dan Menengah - small Indonesian businesses). It integrates WhatsApp messaging, AI conversation, and business workflow automation into a single desktop application.

### Key Technologies
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Electron | 32.x |
| Agent Engine | @earendil-works/pi-coding-agent | 0.83.0 |
| Renderer | React + Vite | Bundled |
| Database | node:sqlite | Built-in |
| Bundler | esbuild + Bun | N/A |
| Language | TypeScript → ESM/CJS | N/A |

## Project Layout (Reconstructed)

```
ashan-ai-desktop/                    # Root
├── dist/
│   ├── zwork-main-bootstrap.cjs     # Main process entrypoint (package.json:main)
│   ├── main.cjs                     # Electron main process bundle (~27.7MB)
│   ├── zwork-bootstrap-preload.cjs  # Renderer preload script (contextBridge)
│   ├── renderer/
│   │   ├── zwork.html               # Main renderer HTML
│   │   └── assets/
│   │       ├── zwork-Dhdb37SK.js    # Main React component bundle
│   │       ├── index.esm-CkQuduis.js # React app entrypoint
│   │       ├── zwork-C3xLYk_e.css   # Main stylesheet
│   │       └── ... (788 total assets)
│   ├── resources/                   # Static resources
│   ├── installer/                   # Installer files
│   └── channel.json                 # Release channel config
├── package.json                     # App manifest
└── node_modules/                    # Runtime dependencies
```

## Entry Points

### Main Process
- **Entrypoint:** `zwork-main-bootstrap.cjs` (declared in `package.json:main`)
- **Resolved to:** `main.cjs` (via `maps_to` relationship)
- **Responsibilities:**
  - Electron app lifecycle (`app.whenReady()`)
  - Main window creation and management
  - Tray icon with menu integration
  - IPC handler registration
  - Agent kernel initialization
  - Account/workspace partitioning
  - Database setup and migrations

### Renderer (UI)
- **Entrypoint:** `renderer/zwork.html`
- **Script:** `assets/zwork-Dhdb37SK.js` → lazy-loads `index.esm-CkQuduis.js`
- **Preload:** `zwork-bootstrap-preload.cjs`
- **Framework:** React (with JSX runtime)

## Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Main Process (main.cjs)               │
│                                                          │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │   Electron   │────│  pi-coding-  │───▶│  SQLite    │ │
│  │   App/API    │    │  agent v0.83 │    │  runtime   │ │
│  └─────────────┘    └──────────────┘    └────────────┘ │
│       │                   │                   │       │
│       │ IPC channels      │ Agent invoke          │       │
│       ▼                   ▼                   ▼       │
│  ┌────────────────────────┴────────────────────────┐   │
│  │             IPC Handler Registry                │   │
│  │  zwork:agent:* | zwork:desktop:* | ashan-hub:* │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │    Preload Script (contextBridge.expose...)    │     │
│  │  - zworkAgent, zworkDesktop, zworkAuth, etc.   │     │
│  │  - ashanHub (custom Hub API)                    │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                          │
         (Renderer Process - Context Isolated)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Renderer (React SPA)                  │
│                                                          │
│  zwork.html → zwork-Dhdb37SK.js → index.esm-CkQuduis.js │
│                                                          │
│  Uses window.zwork* and window.ashanHub APIs             │
│  for all Electron/native interactions                    │
└─────────────────────────────────────────────────────────┘
```

## Data Storage

### Account Partition Structure
```
userData/
├── accounts/
│   ├── <accountId>/
│   │   ├── whatsapp-connection.json   # WhatsApp credentials
│   │   ├── runtime/
│   │   │   └── runtime.sqlite         # Agent runtime DB (sqlite:DatabaseSync)
│   │   ├── sessions/                # Conversation sessions
│   │   └── im/                      # IM data
│   └── <accountId-2>/
│       └── ...
├── preferences.json
└── logs/
```

### SQLite Schema (Partial)
| Table | Purpose |
|-------|---------|
| `im_inbound_receipts` | Incoming WA messages |
| `im_delivery_outbox` | Outgoing messages |
| `work_sessions` | Conversation sessions |
| `im_integration_workspaces` | Integration config |
| `im_connections` | Connection state |

## Hub Integration

The Hub feature was integrated directly into the main Ashan.ai window:

### Modified Files
1. **`zwork-bootstrap-preload.cjs`** - Added `ashanHub` API via contextBridge
2. **`main.cjs`** - Added IPC handlers for `ashan-hub:*` channels
3. **Injected UI** - Floating panel with business dashboard

### Hub UI Components
- Floating panel (top-right corner)
- Toggle button (🏪 Hub)
- Business list with connection status
- Dashboard metrics (messages, orders, revenue)

### Hub IPC Channels
| Channel | Type | Description |
|---------|------|-------------|
| `ashan-hub:ping` | invoke | Health check |
| `ashan-hub:get-businesses` | invoke | List connected businesses |
| `ashan-hub:get-dashboard` | invoke | Dashboard metrics |
| `ashan-hub:get-conversations` | invoke | Message history |
| `ashan-hub:get-orders` | invoke | Order data |
| `ashan-hub:get-templates` | invoke | Business templates |
| `ashan-hub:create-business` | invoke | Onboard new business |
| `ashan-hub:open-chat` | invoke | Open chat window |
| `ashan-hub:takeover` | invoke | Take over session |
| `ashan-hub:release-bot` | invoke | Release to bot |

## Build Pipeline (Reconstructed)

```bash
# Development build sequence
bun run check:zwork-entry     # Verify entry points
bun run typecheck:zwork       # TypeScript checking
bun run build:main            # Bundle main.cjs (esbuild)
bun run build:bootstrap       # Bundle zwork-main-bootstrap.cjs
bun run build:preload-zwork   # Bundle zwork-bootstrap-preload.cjs
bun run build:renderer        # Bundle React app
bun run build:copy            # Copy assets to dist
```

### Build Commands
- **Main:** `esbuild --bundle --platform=node --format=cjs --target=node22`
- **Preload:** `bun scripts/esbuild-with-build-environment.ts`
- **Renderer:** Vite-based bundling

## Dependencies

### Runtime Dependencies
```
@earendil-works/pi-coding-agent@0.83.0  (Bundled in main.cjs)
electron@32.x                           (External)
node:sqlite                             (Built-in)
node:fs                                 (Built-in)
node:path                               (Built-in)
node:perf_hooks                         (Built-in)
```

### Notable node:sqlite Usage
```javascript
const { DatabaseSync } = require("node:sqlite")
const db = new DatabaseSync(dbPath, { readOnly: true })
const row = db.prepare("SELECT ... WHERE connection_id = ?").get(connectionId)
db.close()
```

## Limitations of This Reconstruction

1. **No source files** - Only reverse-engineered from compiled bundles
2. **Static analysis** - No runtime behavior captured (REA doesn't execute code)
3. **Partial parsing** - main.cjs (27.7MB) exceeded REA's analysis limits
4. **Minified bundles** - React renderer is heavily minified
5. **Proprietary dependencies** - pi-coding-agent API not fully documented

## Files

- [Architecture Overview](ARCHITECTURE.md)
- [Preload API Reference](PRELOAD_API.md)
- [IPC Channels Reference](IPC_CHANNELS.md)
- [Source Tree Map](SOURCE_TREE.md) *(pending)*
DOCEOF
echo "RECONSTRUCTION.md created"