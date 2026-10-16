# Ashan.ai Preload API Reference

## Preload File
- **Path:** `dist/zwork-bootstrap-preload.cjs`
- **Format:** CommonJS bundle (ESM → CJS compiled)
- **Size:** ~1MB (34,345 lines)
- **SHA256:** `b09a0ddaee0e8b1b2ff8ff848c3c6472` (post-Hub-injection)

## Dependencies
```json
{
  "electron": "^32.0.0",
  "node:crypto": builtin,
  "node:fs": builtin,
  "node:path": builtin,
  "node:url": builtin
}
```

## Exposed APIs (contextBridge.exposeInMainWorld)

### 1. `zworkDesktop`
Main desktop window management API.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `showMainWindow` | none | void | Show/unminimize main window |
| `openPath` | `path: string` | `Promise<string>` | Open file/folder in system |
| `openURL` | `url: string` | `Promise<void>` | Open URL externally |
| `relaunch` | none | void | Relaunch app |
| `quit` | none | void | Quit application |

### 2. `zworkDesktopBrowser`
Browser window management within the app.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `create` | `{ url, width, height }` | `Promise<number>` | Create new browser window, returns webContentsId |
| `navigate` | `webContentsId, url` | void | Navigate browser window |
| `close` | `webContentsId` | void | Close browser window |

### 3. `zworkDesktopLifecycle`
Application lifecycle and shutdown management.

Events (via `on(channel, listener)`):
- `zwork:desktop:shutdown-flush` - Shutdown request with flush

### 4. `zworkDesktopNotificationActivation`
Notification click handling.

Events:
- `zwork:desktop:notification-activation` - Notification clicked with payload

### 5. `zworkWorkbenchCapabilities`
Agent capability registry for the main window.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `getCapabilities` | none | `Promise<object>` | Get available agent capabilities |
| `executeCommand` | `command: object` | `Promise<any>` | Execute agent command |

Events:
- `zwork:desktop:capabilities:invoke` - Capability invocation stream

### 6. `zworkAutoclawMigration`
Migration/import utilities.

| Method | Parameters | Returns |
|--------|-----------|---------|
| `detect` | none | `Promise<object>` | Detect migration sources |
| `import` | `source: object` | `Promise<object>` | Import from source |
| `hint` | none | `Promise<object>` | Get migration hints |

### 7. `ashanHub` (Hub Integration)
Business dashboard API for UMKM (small business) management.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `ping` | none | `{ ok: boolean, ts: number }` | Health check |
| `getBusinesses` | none | `Business[]` | List connected businesses |
| `getDashboard` | `connectionId: string` | `Dashboard` | Dashboard metrics |
| `getConversations` | `connectionId, limit?` | `Conversation[]` | Message history |
| `getOrders` | `connectionId` | `Order[]` | Order data from CSV |
| `getTemplates` | none | `Template[]` | Business templates |
| `createBusiness` | `config: object` | `{ ok, message }` | Create new business |
| `openChat` | none | `{ ok }` | Open main chat window |
| `takeOver` | `sessionId` | `{ ok }` | Take over conversation |
| `releaseBot` | `sessionId` | `{ ok }` | Release back to bot |

#### Types

```typescript
interface Business {
  connectionId: string;
  label: string;
  connected: boolean;
  enabled: boolean;
  provider: "whatsapp";
  slotId: string;
}

interface Dashboard {
  connectionId: string;
  todayMessages: number;
  todayOrders: number;
  todayRevenue: number;
  weekRevenue: number;
  recentConversations: any[];
  orders: Order[];
  products: any[];
  topProducts: any[];
  dbError?: string;
}

interface Conversation {
  messageId: string;
  text: string;
  sender: string;
  timestamp: string;
  sessionId?: string;
}

interface Order {
  orderId: string;
  customer: string;
  items: string;
  total: number;
  status: string;
  date: string;
}

interface Template {
  type: string;
  label: string;
  description: string;
  itemsFile: string;
  itemsLabel: string;
  stockTracked: boolean;
}
```

### 8. `zworkUpdate`
Update management with streaming.

| Method | Parameters | Returns |
|--------|-----------|---------|
| `check` | none | `Promise<object>` |
| `download` | `version: string` | `AsyncIterable<object>` |
| `install` | none | never |

### 9. `zworkAbtest`
Feature flag management.

| Method | Parameters | Returns |
|--------|-----------|---------|
| `getVar` | `name: string` | `Promise<any>` |
| `refresh` | none | `Promise<void>` |

### 10. `zworkAnalytics`
Analytics event tracking.

| Method | Parameters | Returns |
|--------|-----------|---------|
| `track` | `event: object` | `void` |
| `getIdentity` | none | `Promise<object>` |

### 11. `zworkAuth`
Authentication session management.

| Method | Parameters | Returns |
|--------|-----------|---------|
| `invoke` | `method: string, params: object` | `Promise<object>` |
| `getSession` | none | `Promise<object|null>` |

Events:
- `zwork:auth:session` - Session state changes

### 12. `zworkProductLanguage`
Internationalization.

| Method | Parameters | Returns |
|--------|-----------|---------|
| `getLanguage` | none | `Promise<string>` |
| `setLanguage` | `lang: string` | `Promise<void>` |

Events:
- `zwork:product-language:changed` - Language changed

### 13. `zworkLogging`
Diagnostic logging.

| Method | Parameters | Returns |
|--------|-----------|---------|
| `log` | `message: object` | void |

### 14. `zworkOfficePlugin`
Office document plugin support.

| Method | Parameters | Returns |
|--------|-----------|---------|
| `invoke` | `channel: string, args` | `Promise<any>` |

Events:
- `zwork:office-plugin:*` - Plugin events

### 15. `zworkSelectionAnnotation`
Text selection and annotation.

| Method | Parameters | Returns |
|--------|-----------|---------|
| `request` | `request: object` | `Promise<object>` |

## IPC Channels (zwork: namespace)

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `zwork:desktop:invoke` | R→M | Desktop operations |
| `zwork:desktop:shutdown-flush` | R↔M | Shutdown flush |
| `zwork:desktop:sidebar-unread` | R↔M | Sidebar unread updates |
| `zwork:desktop:notification-activation` | M→R | Notification clicked |
| `zwork:desktop:restart-application` | R→M | App relaunch |
| `zwork:desktop:selection-annotation-request` | R→M | Selection annotation |
| `zwork:desktop:capabilities` | R↔M | Agent capabilities |
| `zwork:desktop:capabilities:invoke` | R↔M | Execute capability |
| `zwork:desktop:browser:invoke` | R↔M | Browser window control |
| `zwork:desktop:browser-state` | M→R | Browser state updates |
| `zwork:desktop:general-preferences-changed` | M→R | Preferences update |
| `zwork:analytics:track` | R→M | Track event |
| `zwork:analytics:get-identity` | R→M | Get identity |
| `zwork:analytics:startup-surface-ready` | R→M | Surface ready |
| `zwork:abtest:get-var` | R→M | Get feature flag |
| `zwork:abtest:refresh` | R↔M | Refresh flags |
| `zwork:auth:invoke` | R↔M | Auth operations |
| `zwork:auth:session` | M→R | Session state |
| `zwork:product-language:invoke` | R↔M | Language ops |
| `zwork:product-language:changed` | M→R | Language changed |
| `zwork:skill-store:changed` | M→R | Skills updated |
| `zwork:diagnostics:log` | R→M | Diagnostic logs |

## IPC Channels (ashan-hub: namespace)

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `ashan-hub:ping` | R↔M | Health check |
| `ashan-hub:get-businesses` | R↔M | List businesses |
| `ashan-hub:get-dashboard` | R↔M | Dashboard data |
| `ashan-hub:get-conversations` | R↔M | Message history |
| `ashan-hub:get-orders` | R↔M | Order data |
| `ashan-hub:get-templates` | R↔M | Templates list |
| `ashan-hub:create-business` | R→M | Create business |
| `ashan-hub:open-chat` | R→M | Open chat |
| `ashan-hub:takeover` | R→M | Take over |
| `ashan-hub:release-bot` | R→M | Release bot |
