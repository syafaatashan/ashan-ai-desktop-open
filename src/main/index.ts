/**
 * Electron main process entrypoint for Ashan.ai Desktop
 * 
 * Reconstructed from: zwork-main-bootstrap.cjs → main.cjs
 * The bundle is ESM built from TypeScript source, compiled to CJS.
 */

import { app, BrowserWindow, Tray, Menu, nativeImage } from "electron";
import * as path from "node:path";

// ─── Product Constants ───
export const PRODUCT_NAME = "Ashan.ai";

// ─── Global State ───
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// ─── Window Management ───
export function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load renderer
  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../../renderer/index.html"));
  } else {
    win.loadURL("http://localhost:5173");
  }

  win.on("close", (e) => {
    e.preventDefault();
    win.hide();
  });

  return win;
}

export function openMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow();
  }
  mainWindow.show();
  mainWindow.focus();
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

// ─── Tray Integration ───
export function createTray(): Tray {
  const iconPath = path.join(__dirname, "../resources/tray-icon.png");
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);
  tray.setToolTip(PRODUCT_NAME);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => openMainWindow(),
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    openMainWindow();
  });

  return tray;
}

// ─── App Lifecycle ───
async function initializeApp(): Promise<void> {
  // Create tray first
  createTray();

  // Create main window
  openMainWindow();

  // Register IPC handlers
  registerIPCHandlers();

  // Initialize agent kernel (lazy-loaded from pi-coding-agent)
  await initializeAgentKernel();
}

async function initializeAgentKernel(): Promise<void> {
  try {
    // Agent module stub: full implementation requires @earendil-works/pi-coding-agent
    // In dev mode, agents are mocked. See docs/ARCHITECTURE.md for integration points.
    console.log("Agent kernel initialized (stub)");
  } catch (e) {
    console.warn("Agent kernel initialization failed:", e);
  }
}

app.whenReady().then(initializeApp);

app.on("window-all-closed", () => {
  // Keep app in tray
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    openMainWindow();
  }
});

// ─── IPC Handlers ───
function registerIPCHandlers(): void {
  // Desktop operations
  const { ipcMain } = require("electron");
  
  ipcMain.handle("zwork:desktop:invoke", async (_event: any, request: any) => {
    const { shell } = require("electron");
    switch (request.method) {
      case "show":
        openMainWindow();
        return { ok: true };
      case "openPath":
        await shell.openPath(request.path);
        return { ok: true };
      case "openURL":
        await shell.openExternal(request.url);
        return { ok: true };
      default:
        return { ok: false, error: "Unknown method" };
    }
  });

  // Hub IPC handlers
  const userDataDir = app.getPath("userData");
  ipcMain.handle("ashan-hub:ping", () => ({ ok: true, ts: Date.now() }));

  ipcMain.handle("ashan-hub:get-businesses", () => {
    return getBusinesses(userDataDir);
  });

  ipcMain.handle("ashan-hub:get-dashboard", (_event: any, connectionId: string) => {
    return { connectionId, todayMessages: 0, orders: [] };
  });

  // Agent IPC
  ipcMain.handle("zwork:agent:invoke", async (_event: any, input: any) => {
    return { ok: true, message: "Agent invoke not fully reconstructed" };
  });

  ipcMain.handle("zwork:agent:query", async (_event: any, input: any) => {
    return { ok: true, response: "Agent query not fully reconstructed" };
  });

  // Auth IPC
  ipcMain.handle("zwork:auth:invoke", async (_event: any, input: { method: string, params: any }) => {
    return { ok: true, result: "Auth not fully reconstructed" };
  });

  // Analytics
  ipcMain.handle("zwork:analytics:track", () => ({ ok: true }));
  ipcMain.handle("zwork:analytics:get-identity", () => ({ ok: true, userId: "anon" }));
  ipcMain.handle("zwork:analytics:startup-surface-ready", () => ({ ok: true }));

  // A/B Testing
  ipcMain.handle("zwork:abtest:get-var", () => true);
  ipcMain.handle("zwork:abtest:refresh", () => ({ ok: true }));

  // Language
  ipcMain.handle("zwork:product-language:invoke", async (_event: any, method: string, ...args: any[]) => {
    if (method === "get") return app.getLocale();
    return { ok: true };
  });
}

// ─── Business Helpers ───
import * as fs from "node:fs";

function findWAConfig(dir: string): string | null {
  try {
    const accountsDir = path.join(dir, "accounts");
    if (!fs.existsSync(accountsDir)) return null;
    for (const entry of fs.readdirSync(accountsDir)) {
      const cfgPath = path.join(accountsDir, entry, "whatsapp-connection.json");
      if (fs.existsSync(cfgPath)) return cfgPath;
    }
    return null;
  } catch {
    return null;
  }
}

function getBusinesses(dir: string): any[] {
  const cfgPath = findWAConfig(dir);
  if (!cfgPath) return [];

  try {
    const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    const results: any[] = [];

    if (cfg.connections && typeof cfg.connections === "object") {
      for (const [slotId, rec] of Object.entries(cfg.connections)) {
        if (!(rec as any).accountId) continue;
        results.push({
          connectionId: (rec as any).accountId,
          label: (rec as any).accountId,
          connected: (rec as any).enabled === true,
          enabled: (rec as any).enabled === true,
          provider: "whatsapp",
          slotId,
        });
      }
    }

    return results;
  } catch {
    return [];
  }
}

export { app, BrowserWindow };
