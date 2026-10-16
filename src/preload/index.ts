/**
 * Electron preload script — exposes safe APIs to the renderer via contextBridge.
 * 
 * Reconstructed from zwork-bootstrap-preload.cjs (34,345 lines, minified CJS bundle).
 * 
 * Pattern: All API exposure uses factory functions that wrap ipcRenderer
 */

import { contextBridge, ipcRenderer } from "electron";
import type { 
  Business, DashboardMetrics, Order, Template, BusinessConfig,
  AgentEvent, SessionState
} from "../shared/types";
import { IPC } from "../shared/types";

// ─── Helper: Create IPC invoke wrapper ───
function createIpcInvoker(channel: string) {
  return (...args: any[]) => ipcRenderer.invoke(channel, ...args);
}

// ─── Helper: Create event listener wrapper ───
function createEventEmitter(channel: string) {
  return {
    on: (callback: (data: any) => void) => {
      const listener = (_event: unknown, data: any) => callback(data);
      ipcRenderer.on(channel, listener);
      return () => ipcRenderer.removeListener(channel, listener);
    },
  };
}

// ─── Hub API (UMKM Business Dashboard) ───
contextBridge.exposeInMainWorld("ashanHub", {
  ping: () => ipcRenderer.invoke(IPC.HUB_PING),
  getBusinesses: () => ipcRenderer.invoke(IPC.HUB_GET_BUSINESSES),
  getDashboard: (connectionId: string) =>
    ipcRenderer.invoke(IPC.HUB_GET_DASHBOARD, connectionId),
  getConversations: (connectionId: string, limit = 50) =>
    ipcRenderer.invoke(IPC.HUB_GET_CONVERSATIONS, connectionId, limit),
  getOrders: (connectionId: string) =>
    ipcRenderer.invoke(IPC.HUB_GET_ORDERS, connectionId),
  getTemplates: () => ipcRenderer.invoke(IPC.HUB_GET_TEMPLATES),
  createBusiness: (config: BusinessConfig) =>
    ipcRenderer.invoke(IPC.HUB_CREATE_BUSINESS, config),
  openChat: () => ipcRenderer.invoke(IPC.HUB_OPEN_CHAT),
  takeOver: (sessionId: string) =>
    ipcRenderer.invoke(IPC.HUB_TAKEOVER, sessionId),
  releaseBot: (sessionId: string) =>
    ipcRenderer.invoke(IPC.HUB_RELEASE_BOT, sessionId),
});

// ─── Agent API ───
contextBridge.exposeInMainWorld("zworkAgent", {
  invoke: (input: any) => ipcRenderer.invoke(IPC.AGENT_INVOKE, input),
  query: (input: any) => ipcRenderer.invoke(IPC.AGENT_QUERY, input),
  subscribe: (callback: (event: AgentEvent) => void) => {
    const unsub = createEventEmitter(IPC.AGENT_PUBLICATION);
    return unsub.on(callback);
  },
});

// ─── Desktop API ───
contextBridge.exposeInMainWorld("zworkDesktop", {
  invoke: (request: { method: string; [key: string]: any }) =>
    ipcRenderer.invoke(IPC.DESKTOP_INVOKE, request),
  onShutdownFlush: (callback: (data: any) => void) =>
    createEventEmitter(IPC.DESKTOP_SHUTDOWN_FLUSH).on(callback),
});

// ─── Auth API ───
contextBridge.exposeInMainWorld("zworkAuth", {
  invoke: (method: string, params: any) =>
    ipcRenderer.invoke(IPC.AUTH_INVOKE, { method, params }),
  onSession: (callback: (session: SessionState) => void) =>
    createEventEmitter(IPC.AUTH_SESSION).on(callback),
});

// ─── Analytics API ───
contextBridge.exposeInMainWorld("zworkAnalytics", {
  track: (event: string, properties?: Record<string, any>) =>
    ipcRenderer.invoke(IPC.ANALYTICS_TRACK, event, properties),
  getIdentity: () =>
    ipcRenderer.invoke(IPC.ANALYTICS_IDENTITY),
  startupSurfaceReady: (surface: string) =>
    ipcRenderer.invoke(IPC.ANALYTICS_SURFACE_READY, surface),
});

// ─── A/B Testing API ───
contextBridge.exposeInMainWorld("zworkAbtest", {
  getVar: (key: string, defaultValue?: any) =>
    ipcRenderer.invoke(IPC.ABTEST_GET_VAR, key, defaultValue),
  refresh: () => ipcRenderer.invoke(IPC.ABTEST_REFRESH),
});

// ─── Language API ───
contextBridge.exposeInMainWorld("zworkProductLanguage", {
  getLanguage: () =>
    ipcRenderer.invoke(IPC.LANGUAGE_INVOKE, "get"),
  setLanguage: (lang: string) =>
    ipcRenderer.invoke(IPC.LANGUAGE_INVOKE, "set", lang),
  onChange: (callback: (lang: string) => void) =>
    createEventEmitter(IPC.LANGUAGE_CHANGED).on(callback),
});

// ─── Update API ───
contextBridge.exposeInMainWorld("zworkUpdate", {
  check: () => ipcRenderer.invoke(IPC.UPDATE_INVOKE, "check"),
  download: (version: string) =>
    ipcRenderer.invoke(IPC.UPDATE_INVOKE, "download", version),
});

// ─── Logging API ───
contextBridge.exposeInMainWorld("zworkLogging", {
  log: (level: string, message: string, data?: any) =>
    ipcRenderer.send("zwork:diagnostics:log", level, message, data),
});

// ─── Migration API ───
contextBridge.exposeInMainWorld("zworkAutoclawMigration", {
  detect: () => ipcRenderer.invoke("desktop.autoclaw_detect"),
  import: (request: any) =>
    ipcRenderer.invoke("desktop.autoclaw_import", request),
  hint: () => ipcRenderer.invoke("desktop.autoclaw_migration_hint"),
});

// ─── Type augmentation ───
declare global {
  interface Window {
    ashanHub: WindowAshanHub;
    zworkAgent: WindowZworkAgent;
    zworkDesktop: WindowZworkDesktop;
    zworkAuth: WindowZworkAuth;
    zworkAnalytics: WindowZworkAnalytics;
    zworkAbtest: WindowZworkAbtest;
    zworkProductLanguage: WindowZworkProductLanguage;
    zworkUpdate: WindowZworkUpdate;
    zworkLogging: WindowZworkLogging;
    zworkAutoclawMigration: WindowZworkMigration;
  }
}

interface WindowAshanHub {
  ping: () => Promise<{ ok: boolean; ts: number }>;
  getBusinesses: () => Promise<Business[]>;
  getDashboard: (connectionId: string) => Promise<DashboardMetrics>;
  getConversations: (connectionId: string, limit?: number) => Promise<any[]>;
  getOrders: (connectionId: string) => Promise<any[]>;
  getTemplates: () => Promise<Template[]>;
  createBusiness: (config: BusinessConfig) => Promise<{ ok: boolean; message: string }>;
  openChat: () => Promise<{ ok: boolean }>;
  takeOver: (sessionId: string) => Promise<{ ok: boolean }>;
  releaseBot: (sessionId: string) => Promise<{ ok: boolean }>;
}

interface WindowZworkAgent {
  invoke: (input: any) => Promise<any>;
  query: (input: any) => Promise<any>;
  subscribe: (callback: (event: AgentEvent) => void) => () => void;
}

interface WindowZworkDesktop {
  invoke: (request: { method: string; [key: string]: any }) => Promise<any>;
  onShutdownFlush: (callback: (data: any) => void) => () => void;
}

interface WindowZworkAuth {
  invoke: (method: string, params: any) => Promise<any>;
  onSession: (callback: (session: SessionState) => void) => () => void;
}

interface WindowZworkAnalytics {
  track: (event: string, properties?: Record<string, any>) => void;
  getIdentity: () => Promise<any>;
  startupSurfaceReady: (surface: string) => Promise<void>;
}

interface WindowZworkAbtest {
  getVar: (key: string, defaultValue?: any) => Promise<any>;
  refresh: () => Promise<void>;
}

interface WindowZworkProductLanguage {
  getLanguage: () => Promise<string>;
  setLanguage: (lang: string) => Promise<void>;
  onChange: (callback: (lang: string) => void) => () => void;
}

interface WindowZworkUpdate {
  check: () => Promise<any>;
  download: (version: string) => Promise<AsyncIterable<any>>;
}

interface WindowZworkLogging {
  log: (level: string, message: string, data?: any) => void;
}

interface WindowZworkMigration {
  detect: () => Promise<any>;
  import: (request: any) => Promise<any>;
  hint: () => Promise<any>;
}

export {};
