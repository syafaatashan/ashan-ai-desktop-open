# Ashan.ai IPC Channel Reference

## Main Process to Renderer Channels

### ZWORK Namespace Channels
```
zwork:desktop:invoke                     - Desktop operations (show, open, quit)
zwork:desktop:shutdown-flush            - Shutdown with data flush
zwork:desktop:general-preferences-changed - Preferences updates
zwork:desktop:sidebar-unread            - Sidebar unread count
zwork:desktop:notification-activation   - Click notification events
zwork:desktop:restart-application       - App relaunch

zwork:desktop:capabilities              - Agent capabilities stream
zwork:desktop:capabilities:invoke      - Execute capability

zwork:desktop:browser:invoke           - Browser window control
zwork:desktop:browser-state           - Browser state events

zwork:agent:invoke                     - Execute agent command
zwork:agent:query                     - Query agent state
zwork:agent:subscribe                 - Subscribe to agent events
zwork:agent:unsubscribe                - Unsubscribe from agent
zwork:agent:publication               - Published results

zwork:analytics:track                 - Track events
zwork:analytics:get-identity           - Get user identity
zwork:analytics:startup-surface-ready - Surface ready notification

zwork:auth:invoke                     - Auth operations
zwork:auth:session                     - Session state changes

zwork:abtest:get-var                  - Feature flag getter
zwork:abtest:refresh                  - Refresh flags

zwork:product-language:invoke          - Language operations
zwork:product-language:changed         - Language changed

zwork:updater:invoke                  - Update check/download

zwork:skill-store:changed            - Skills list updated

zwork:im:domestic                   - IM provider (domestic)
zwork:im:overseas                   - IM provider (overseas)
```

### Desktop.autoclaw Namespace (Migration)
```
desktop.autoclaw_detect               - Detect migration sources
desktop.autoclaw_import              - Import from source
desktop.autoclaw_migration_hint      - Get migration hints
```

### ashna-hub Namespace (Hub Integration)
```
ashan-hub:ping                      - Health check → {ok, ts}
ashan-hub:get-businesses            - List businesses → Business[]
ashan-hub:get-dashboard             - Dashboard metrics (connectionId)
ashan-hub:get-conversations         - Message history (connectionId, limit?)
ashan-hub:get-orders                - Order data (connectionId)
ashan-hub:get-templates             - Templates list
ashan-hub:create-business           - Create business (config)
ashan-hub:open-chat                 - Open main chat window
ashan-hub:takeover                  - Take over session (sessionId)
ashan-hub:release-bot               - Release bot (sessionId)
```

## ContextBridge Exposed APIs

### zworkAgent
Agent conversation interface.
```typescript
interface ZworkAgentAPI {
  invoke(input: ConversationRequest): Promise<ConversationResult>
  query(input: QueryRequest): Promise<QueryResult>
  subscribe(callback: (event: AgentEvent) => void): void
  unsubscribe(callback?: (event: AgentEvent) => void): void
}

interface ConversationRequest {
  messages: Message[]
  context?: Record<string, any>
  model?: string
  temperature?: number
}

interface AgentEvent {
  type: 'message' | 'tool-result' | 'state' | 'complete'
  payload: any
}
```

### zworkDesktop
Desktop window management.
```typescript
interface ZworkDesktopAPI {
  invoke(channel: string, request: any): Promise<any>
}

const desktopChannels = {
  showMainWindow: 'zwork:desktop:invoke'
  openPath: 'zwork:desktop:invoke'
  openURL: 'zwork:desktop:invoke'
  relaunch: 'zwork:desktop:restart-application'
}
```

### zworkAuth
Authentication.
```typescript
interface ZworkAuthAPI {
  invoke(method: string, params: any): Promise<any>
  subscribe(callback: (session: SessionState) => void): void
}

type SessionState = {
  authenticated: boolean
  profile?: UserProfile
  expiresAt?: number
}
```

### zworkAnalytics
Analytics tracking.
```typescript
interface ZworkAnalyticsAPI {
  track(event: AnalyticsEvent, properties?: Record<string, any>): void
  getIdentity(): Promise<AnalyticsIdentity>
  startupSurfaceReady(surface: string): Promise<void>
}
```

### zworkAbtest
Feature flags.
```typescript
interface ZworkAbtestAPI {
  getVar(key: string, defaultValue?: any): Promise<any>
  refresh(): Promise<void>
}
```

### zworkProductLanguage
Internationalization.
```typescript
interface ZworkProductLanguageAPI {
  invoke(method: 'get' | 'set', lang?: string): Promise<string>
  subscribe(callback: (lang: string) => void): void
}
```

### zworkUpdate
Update management.
```typescript
interface ZworkUpdateAPI {
  invoke(channel: 'check' | 'download' | 'install', ...args): Promise<any>
  subscribe(callback: (update: UpdateEvent) => void): void
}

type UpdateEvent = {
  type: 'checking' | 'available' | 'downloaded' | 'error'
  version?: string
  message?: string
}
```

### zworkLogging
Diagnostic logging.
```typescript
interface ZworkLoggingAPI {
  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void
}
```

### zworkDesktopCapabilities
Agent capabilities registry.
```typescript
interface ZworkDesktopCapabilitiesAPI {
  invoke(request: CapabilityRequest): Promise<any>
  subscribe(callback: (event: CapabilityEvent) => void): void
}
```

### zworkDesktopBrowser
Browser window control.
```typescript
interface ZworkDesktopBrowserAPI {
  invoke(request: BrowserRequest): Promise<BrowserResponse>
  subscribe(callback: (state: BrowserState) => void): void
}

interface BrowserState {
  tabs: BrowserTab[]
  activeTabId: string
}
```

### zworkAutoclawMigration
Migration utilities.
```typescript
interface ZworkAutoclawMigrationAPI {
  detect(): Promise<MigrationSource[]>
  import(request: ImportRequest): Promise<ImportResult>
  hint(): Promise<MigrationHint>
}

interface MigrationSource {
  type: string
  name: string
  path: string
  available: boolean
}
```

### zworkSelectionAnnotation
Text selection.
```typescript
interface ZworkSelectionAnnotationAPI {
  request(selection: SelectionRequest): Promise<AnnotationResult>
}

interface SelectionRequest {
  text: string
  context?: string
}
```

### zworkLocalPerformance
Performance monitoring.
```typescript
interface ZworkLocalPerformanceAPI {
  getMetrics(): Promise<PerformanceMetrics>
  mark(label: string): void
  measure(label: string, startMark: string, endMark?: string): Promise<number>
}
```

### zworkOfficePlugin
Office document plugins.
```typescript
interface ZworkOfficePluginAPI {
  invoke(channel: string, ...args: any[]): Promise<any>
  subscribe(callback: (event: OfficeEvent) => void): void
}
```
