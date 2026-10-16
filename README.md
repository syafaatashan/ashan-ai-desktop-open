# Ashan.ai Desktop (Open Source Reconstruction)

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-32.x-47CE32.svg)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)

> **Open source reconstruction** of the Ashan.ai desktop application — an AI-powered agent for Indonesian UMKM (small businesses) with WhatsApp integration.

This project documents and reconstructs the architecture of the proprietary Ashan.ai desktop app through reverse engineering. It is **not** the official source code — see the [disclaimer](#disclaimer) below.

## Disclaimer

This is a **reverse-engineered reconstruction** created from static analysis of the compiled Electron bundles. The original application is proprietary. This project reconstructs the architecture, API surface, and patterns as documentation and reference implementation.

- The original app is owned by Zhipu AI (ZHIPU)
- This reconstruction is for educational/research purposes
- We do not redistribute any proprietary binaries or assets

## Features (Reconstructed)

### Core
- [x] Electron-based desktop app with React UI
- [x] Main/Agent chat interface
- [x] Tray integration
- [x] SQLite-backed memory store
- [x] Multi-account workspace partitioning
- [x] Internationalization (i18n)

### WhatsApp Business (UMKM)
- [ ] WhatsApp connection management
- [ ] Business account integration
- [ ] Message routing and processing
- [ ] Order management via CSV

### AI Agent
- [ ] Conversational AI (via @earendil-works/pi-coding-agent)
- [ ] Agent clustering for parallel subtasks
- [ ] Tool/skill execution
- [ ] Context management

## Project Structure

```
open-source-ashan/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── electron-builder.json
├── LICENSE
├── README.md
├── CHANGELOG.md
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts        # App entrypoint
│   │   ├── windows.ts      # Window management
│   │   ├── tray.ts         # Tray integration
│   │   ├── ipc-handlers.ts # IPC handler registry
│   │   └── agent.ts        # Agent kernel integration
│   ├── preload/        # ContextBridge preload
│   │   └── index.ts
│   ├── renderer/       # React renderer
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── src/
│   │       ├── App.tsx
│   │       ├── routes/
│   │       └── components/
│   └── shared/         # Shared types
│       └── types.ts
└── docs/
    ├── ARCHITECTURE.md
    ├── IPC_CHANNELS.md
    ├── PRELOAD_API.md
    └── RECONSTRUCTION.md
```

## Getting Started

### Prerequisites
- Node.js >= 20.0.0
- npm/yarn
- Electron build dependencies

### Development
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Package for all platforms
npm run package
```

## Architecture

### Main Process Flow

```
package.json:main
  → dist/main/main.js (zwork-main-bootstrap.cjs)
    → imports main.cjs (bundled ESM→CJS)
    ├── App lifecycle (app.whenReady)
    ├── Window management (BrowserWindow)
    ├── Tray (Tray + Menu)
    ├── IPC handlers (ipcMain.handle)
    ├── Agent kernel (pi-coding-agent)
    └── SQLite database (node:sqlite)
```

### Renderer

```
zwork.html
  → assets/index.esm-[hash].js (React entrypoint)
    → assets/zwork-[hash].js (Main bundle)
      → Uses window.zwork* + window.ashanHub APIs
```

### IPC Channel Patterns

| Direction | Pattern |
|-----------|---------|
| Renderer → Main | `ipcRenderer.invoke("channel", ...args)` |
| Main → Renderer | `webContents.send("channel", payload)` |
| Main → Renderer (stream) | `ipcMain.handle` with async generator |

## IPC Channels Reference

### Agent Channels
| Channel | Method | Description |
|---------|--------|-------------|
| `zwork:agent:invoke` | invoke | Execute agent message |
| `zwork:agent:query` | invoke | Query agent state |
| `zwork:agent:subscribe` | handle | Subscribe to events |
| `zwork:agent:publication` | send | Publish results |

### Desktop Channels
| Channel | Method | Description |
|---------|--------|-------------|
| `zwork:desktop:invoke` | invoke | Window management |
| `zwork:desktop:shutdown-flush` | handle | Graceful shutdown |

### Hub Channels
| Channel | Method | Description |
|---------|--------|-------------|
| `ashan-hub:ping` | invoke | Health check |
| `ashan-hub:get-businesses` | invoke | List businesses |
| `ashan-hub:get-dashboard` | invoke | Dashboard metrics |

## License

MIT License — (c) 2026 Ashan.ai Reconstruction Project

See [LICENSE](LICENSE) for details.

## Acknowledgements

- [REA (Reverse Engineering Analyzer)](https://github.com/morluto/rea) — Static analysis toolkit used for this reconstruction
- [Electron.js](https://www.electronjs.org/) — Desktop runtime
- [React](https://react.dev/) — UI framework
