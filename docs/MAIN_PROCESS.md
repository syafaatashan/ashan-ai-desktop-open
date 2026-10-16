# Ashan.ai Main Process Architecture

## Overview
- **File:** `dist/main.cjs` (CommonJS bundle, 27.7MB, 827,903 lines)
- **SHA256:** `2c526f636dd7de0b145c60357c0edca7`
- **Build:** ESBuild bundle of ESM→CJS from source via Bun
- **Frameworks:** Electron 32, @earendil-works/pi-coding-agent v0.83.0

## Imports

```typescript
import electron from "electron"
import { DatabaseSync } from "node:sqlite"     // Runtime data
import path from "node:path"
import fs from "node:fs"
import { sha256 } from "node:crypto"
import { pathToFileURL } from "node:url"
import { createRequire } from "node:module"

// Dynamic imports (lazy-loaded)
const piCodingAgent = await import("@earendil-works/pi-coding-agent")
```

## Constants & Channel Definitions

### ZWORK_* IPC Channel Constants
All channels use the `zwork:` or `desktop.` namespace.

```typescript
var ZWORK_OFFICIAL_CHANNEL = "official"
var ZWORK_DESKTOP_INVOKE_CHANNEL = "zwork:desktop:invoke"
var ZWORK_DESKTOP_SHUTDOWN_FLUSH_CHANNEL = "zwork:desktop:shutdown-flush"
var ZWORK_DESKTOP_GENERAL_PREFERENCES_CHANGED_CHANNEL = "zwork:desktop:general-preferences-changed"
var ZWORK_DESKTOP_BROWSER_INVOKE_CHANNEL = "zwork:desktop:browser:invoke"
var ZWORK_DESKTOP_BROWSER_STATE_CHANNEL = "zwork:desktop:browser-state"
var ZWORK_DESKTOP_CAPABILITIES_CHANNEL = "zwork:desktop:capabilities"
var ZWORK_DESKTOP_CAPABILITIES_INVOKE_CHANNEL = "zwork:desktop:capabilities:invoke"
var ZWORK_DESKTOP_NOTIFICATION_ACTIVATION_CHANNEL = "zwork:desktop:notification-activation"
var ZWORK_DESKTOP_SIDEBAR_UNREAD_CHANNEL = "zwork:desktop:sidebar-unread"
var ZWORK_DESKTOP_RESTART_APPLICATION_CHANNEL = "zwork:desktop:restart-application"

var ZWORK_AGENT_CHANNELS = {
  invoke: "zwork:agent:invoke",
  query: "zwork:agent:query",
  subscribe: "zwork:agent:subscribe",
  unsubscribe: "zwork:agent:unsubscribe",
  publication: "zwork:agent:publication"
}

var ZWORK_ANALYTICS_TRACK_CHANNEL = "zwork:analytics:track"
var ZWORK_ANALYTICS_GET_IDENTITY_CHANNEL = "zwork:analytics:get-identity"
var ZWORK_ANALYTICS_STARTUP_SURFACE_READY_CHANNEL = "zwork:analytics:startup-surface-ready"
var ZWORK_AUTH_INVOKE_CHANNEL = "zwork:auth:invoke"
var ZWORK_AUTH_SESSION_CHANNEL = "zwork:auth:session"
var ZWORK_ABTEST_GET_VAR_CHANNEL = "zwork:abtest:get-var"
var ZWORK_ABTEST_REFRESH_CHANNEL = "zwork:abtest:refresh"
var ZWORK_PRODUCT_LANGUAGE_INVOKE_CHANNEL = "zwork:product-language:invoke"
var ZWORK_PRODUCT_LANGUAGE_CHANGED_CHANNEL = "zwork:product-language:changed"
var ZWORK_UPDATE_INVOKE_CHANNEL = "zwork:updater:invoke"
var ZWORK_SKILL_STORE_CHANGED_CHANNEL = "zwork:skill-store:changed"
var ZWORK_DOMESTIC_IM_CHANNEL = "zwork:im:domestic"
var ZWORK_OVERSEA_IM_CHANNEL = "zwork:im:overseas"
```

### IPC Handlers Registration

**Count:** 28 `ipcMain.handle()` channels + 4 `ipcMain.on()` listeners

```typescript
// Agent IPC
ipcMain.handle(ZWORK_AGENT_CHANNELS.invoke, async (event, input) => agent.invoke(input))
ipcMain.handle(ZWORK_AGENT_CHANNELS.query, async (event, input) => agent.query(input))
ipcMain.handle(ZWORK_AGENT_CHANNELS.subscribe, (event, input) => agent.subscribe(event, input))
ipcMain.removeHandler(ZWORK_AGENT_CHANNELS.unsubscribe) // Removed dynamically

// Desktop IPC
ipcMain.handle(ZWORK_DESKTOP_INVOKE_CHANNEL, async (event, input) => desktop.invoke(input))
ipcMain.handle(ZWORK_DESKTOP_CAPABILITIES_INVOKE_CHANNEL, (event, input) => capabilities.invoke(input))
ipcMain.handle(ZWORK_DESKTOP_BROWSER_INVOKE_CHANNEL, async (event, raw) => browser.invoke(raw))
ipcMain.handle(ZWORK_DESKTOP_RESTART_APPLICATION_CHANNEL, () => app.relaunch())

// Auth
ipcMain.handle(ZWORK_AUTH_INVOKE_CHANNEL, handler)

// Analytics
ipcMain.handle(ZWORK_ANALYTICS_TRACK_CHANNEL, async (event, e, p) => analytics.track(e, p))
ipcMain.handle(ZWORK_ANALYTICS_GET_IDENTITY_CHANNEL, async () => analytics.getIdentity())
ipcMain.handle(ZWORK_ANALYTICS_STARTUP_SURFACE_READY_CHANNEL, async (event, surface) => ...)

// A/B Testing
ipcMain.handle(ZWORK_ABTEST_GET_VAR_CHANNEL, async (event, key, defaultValue) => abtest.getVar(key, defaultValue))
ipcMain.handle(ZWORK_ABTEST_REFRESH_CHANNEL, async () => abtest.refresh())

// Language
ipcMain.handle(ZWORK_PRODUCT_LANGUAGE_INVOKE_CHANNEL, async (event, raw) => language.invoke(raw))

// Updates
ipcMain.handle(ZWORK_UPDATE_INVOKE_CHANNEL, async (event, raw) => updater.invoke(raw))

// Migration
ipcMain.handle(ZWORK_AUTOCLAW_DETECT_CHANNEL, (event) => migration.detect())
ipcMain.handle(ZWORK_AUTOCLAW_IMPORT_CHANNEL, (event, rawRequest) => migration.import(rawRequest))
ipcMain.handle(ZWORK_AUTOCLAW_HINT_CHANNEL, (event) => migration.hint())
```

## Core Modules

### 1. Agent Runtime Integration (@earendil-works/pi-coding-agent)
```typescript
// v0.83.0 - Lazy loaded
const { createAgentKernel, AgentKernel } = await import("@earendil-works/pi-coding-agent")
```

**Responsibilities:**
- LLM conversation processing
- Tool/skill execution
- Conversation memory management
- Agent clustering

### 2. Workspace Management
```typescript
interface WorkspaceManager {
  createPartition(id): Promise<AccountPartition>
  getPartition(id): AccountPartition
  switchPartition(id): Promise<void>
  shutdownAll(): Promise<void>
}

interface AccountPartition {
  accountKey: string
  runtimeDataDirectory: string
  credentials: CredentialStore
  connection: ConnectionState
}
```

### 3. Tray Integration
```typescript
function installZworkTrayIntegration(
  slots: Slots,
  resourcesRoot: string,
  productLanguage: string,
  shutdownCoordinator: ShutdownCoordinator,
  openMainWindow: () => void
): void
```

Tray menu items:
- **Open** (default) - `tray.open`
- **Quit** - `tray.quit`

### 4. Window Management
```typescript
interface ZworkWindowManager {
  getMainWindow(): BrowserWindow | null
  openMainWindow(surface?: string): Promise<void>
  createMainWindow(options: WindowOptions): BrowserWindow
  showWindow(window: BrowserWindow): Promise<void>
}

interface WindowOptions {
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  webPreferences?: WebPreferences
  url: string
}
```

### 5. IPC Infrastructure
```typescript
// IPC handler pattern (all use invoke-style)
const handler = async (_event: IpcMainInvokeEvent, request: any) => {
  const startTime = performance.now()
  try {
    const result = await processRequest(request)
    return { ok: true, result, duration: performance.now() - startTime }
  } catch (error) {
    return { ok: false, error: error.message, duration: performance.now() - startTime }
  }
}
```

## Key Data Structures

### AccountPartition
```typescript
interface AccountPartition {
  accountKey: string          // Unique account identifier
  runtimeDataDirectory: string // Path to account runtime
  credentials: {              // Encrypted credential store
    accessToken: Buffer
    refreshToken: Buffer
  }
  connection: ConnectionState // Current connection status
}
```

### Runtime Data
```
accounts/<accountId>/
├── runtime/
│   └── runtime.sqlite       # Node:sqlite database
├── whatsapp-connection.json  # WhatsApp config
├── sessions/                 # Conversation sessions
└── im/                       # IM data
```

### SQLite Tables (identified)
- `im_inbound_receipts` - Incoming messages
- `im_delivery_outbox` - Outgoing messages
- `work_sessions` - Conversation sessions
- `im_integration_workspaces` - Integration config
- `im_connections` - Connection state

## Build Configuration
From `package.json`:
```json
{
  "main": "dist/zwork-main-bootstrap.cjs",
  "type": "module",
  "dependencies": {
    "@earendil-works/pi-coding-agent": "0.83.0"
  }
}
```

Build pipeline:
```
check:zwork-entry → typecheck:zwork → build:main → build:bootstrap → 
build:preload-zwork → build:renderer → build:copy
```
