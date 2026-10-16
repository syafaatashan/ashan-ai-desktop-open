# Ashan.ai Desktop (AutoClaw) - Architecture Reconstruction

## Overview
Electron-based desktop AI agent application by Zhipu AI, version 2.0.2.

## Project Structure (Runtime)

```
autoclaw-wa-cs/runtime/resources/app/
├── package.json              # App metadata (private, Apache-2.0)
├── dist/
│   ├── main.cjs              # Electron main process (27.7MB CJS bundle)
│   ├── zwork-bootstrap-preload.cjs  # Renderer preload (34k+ lines)
│   ├── zwork-main-bootstrap.cjs    # Main bootstrap entrypoint
│   ├── renderer/
│   │   ├── zwork.html         # Main HTML entry
│   │   └── assets/            # React/JS bundles
│   └── resources/             # Static resources
```

## Core Components

### 1. Main Process (`main.cjs`)
- Electron BrowserWindow management
- IPC handlers registration
- Main agent runtime (pi-coding-agent integration)
- Tray integration
- Window lifecycle management
- SQLite database access (node:sqlite)

### 2. Preload (`zwork-bootstrap-preload.cjs`)
- Context isolation enabled
- Exposes APIs to renderer via contextBridge:
  - `zworkDesktop` - Desktop management
  - `zworkDesktopBrowser` - Browser control
  - `zworkDesktopLifecycle` - App lifecycle
  - `zworkDesktopNotification` - Notifications
  - `zworkWorkbench` - Agent capabilities
  - `ashanHub` - Business Hub API (Hub integration)
  - `zworkUpdate` - Update management
  - `zworkAbtest` - A/B testing
  - `zworkAnalytics` - Analytics

### 3. Renderer (`zwork.html`)
- React SPA loaded from `/assets/zwork-*.js`
- Uses contextBridge APIs for electron integration

## IPC Channels

### System Channels
- `zwork-launcher-*` - Launcher communication
- `zwork-update-*` - Update flow
- `zwork-abtest-*` - Feature flags

### Ashan Hub Channels (added)
- `ashan-hub:ping` - Health check
- `ashan-hub:get-businesses` - List connected businesses
- `ashan-hub:get-dashboard` - Dashboard metrics
- `ashan-hub:get-conversations` - Message history
- `ashan-hub:get-orders` - Order data
- `ashan-hub:get-templates` - Business templates
- `ashan-hub:create-business` - Onboarding
- `ashan-hub:open-chat` - Open chat window
- `ashan-hub:takeover` - Take over conversation
- `ashan-hub:release-bot` - Release conversation

## Data Layer

### SQLite Database
Location: `accounts/<connection>/runtime/runtime.sqlite`

Key tables:
- `im_inbound_receipts` - Incoming messages
- `im_delivery_outbox` - Outgoing messages
- `work_sessions` - Conversation sessions
- `im_integration_workspaces` - Integration config

### Workspace Files
Location: `<inbox_root>/data/`
- `pesanan.csv` - Orders
- `produk.csv` - Products

## Business Integrations

### WhatsApp Integration
- Config: `accounts/<connection>/whatsapp-connection.json`
- Supports multi-connection (connections object)
- Uses Baileys or similar WhatsApp client library
