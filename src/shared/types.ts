/**
 * Shared type definitions reconstructed from reverse-engineering Ashan.ai desktop
 */

// ─── IPC Channels ───
export const IPC = {
  // Agent channels
  AGENT_INVOKE: "zwork:agent:invoke",
  AGENT_QUERY: "zwork:agent:query",
  AGENT_SUBSCRIBE: "zwork:agent:subscribe",
  AGENT_UNSUBSCRIBE: "zwork:agent:unsubscribe",
  AGENT_PUBLICATION: "zwork:agent:publication",
  
  // Desktop channels
  DESKTOP_INVOKE: "zwork:desktop:invoke",
  DESKTOP_SHUTDOWN_FLUSH: "zwork:desktop:shutdown-flush",
  DESKTOP_PREFERENCES_CHANGED: "zwork:desktop:general-preferences-changed",
  DESKTOP_NOTIFICATION: "zwork:desktop:notification-activation",
  DESKTOP_RESTART: "zwork:desktop:restart-application",
  
  // Auth channels
  AUTH_INVOKE: "zwork:auth:invoke",
  AUTH_SESSION: "zwork:auth:session",
  
  // Analytics
  ANALYTICS_TRACK: "zwork:analytics:track",
  ANALYTICS_IDENTITY: "zwork:analytics:get-identity",
  ANALYTICS_SURFACE_READY: "zwork:analytics:startup-surface-ready",
  
  // A/B Testing
  ABTEST_GET_VAR: "zwork:abtest:get-var",
  ABTEST_REFRESH: "zwork:abtest:refresh",
  
  // Language
  LANGUAGE_INVOKE: "zwork:product-language:invoke",
  LANGUAGE_CHANGED: "zwork:product-language:changed",
  
  // Update
  UPDATE_INVOKE: "zwork:updater:invoke",
  
  // Hub (UMKM Business dashboard)
  HUB_PING: "ashan-hub:ping",
  HUB_GET_BUSINESSES: "ashan-hub:get-businesses",
  HUB_GET_DASHBOARD: "ashan-hub:get-dashboard",
  HUB_GET_CONVERSATIONS: "ashan-hub:get-conversations",
  HUB_GET_ORDERS: "ashan-hub:get-orders",
  HUB_GET_TEMPLATES: "ashan-hub:get-templates",
  HUB_CREATE_BUSINESS: "ashan-hub:create-business",
  HUB_OPEN_CHAT: "ashan-hub:open-chat",
  HUB_TAKEOVER: "ashan-hub:takeover",
  HUB_RELEASE_BOT: "ashan-hub:release-bot",
} as const;

// ─── Window State ───
export interface WindowState {
  mainWindowOpened: boolean;
  accountUnlocked: boolean;
  preferencesApplied: boolean;
  firstTime: boolean;
}

// ─── Account/Partition ───
export interface AccountPartition {
  accountKey: string;
  runtimeDataDirectory: string;
  credentials: {
    accessToken: Buffer;
    refreshToken: Buffer;
  };
}

export interface ConnectionState {
  status: "disconnected" | "connecting" | "connected";
  provider: string;
}

// ─── Chat Message ───
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface ConversationRequest {
  messages: Message[];
  context?: Record<string, any>;
  model?: string;
  temperature?: number;
}

export interface AgentEvent {
  type: "message" | "tool-result" | "state" | "complete";
  payload: any;
}

// ─── Hub Types (UMKM) ───
export type Business = {
  connectionId: string;
  label: string;
  connected: boolean;
  enabled?: boolean;
  provider: "whatsapp";
  slotId?: string;
}

export interface DashboardMetrics {
  connectionId: string;
  todayMessages: number;
  todayOrders: number;
  todayRevenue: number;
  weekRevenue: number;
  recentConversations: any[];
  orders: Order[];
  products: any[];
  topProducts: any[];
}

export interface Order {
  orderId: string;
  customer: string;
  items: string;
  total: number;
  status: string;
  date: string;
}

export interface Template {
  type: string;
  label: string;
  description: string;
  itemsFile: string;
  itemsLabel: string;
  stockTracked: boolean;
}

export interface BusinessConfig {
  type: string;
  storeName: string;
  storeTagline: string;
  storeCity: string;
  storePhone: string;
  adminWa: string;
  operationalHours: string;
  shippingFee: number;
  freeShippingThreshold: number;
  qrisPayload: string;
}

// ─── Auth ───
export interface SessionState {
  authenticated: boolean;
  profile?: Record<string, any>;
  expiresAt?: number;
}

// ─── Analytics ───
export interface AnalyticsIdentity {
  userId: string;
  deviceId: string;
}
