# TypeScript Module System

<!-- source: FixIt assets/js/core/tokens.ts, assets/js/main.ts -->

FixIt uses a service-class architecture with constructor injection.
All modules live in `assets/js/`.

## Directory Layout

```
assets/js/
  main.ts              # Entry point — creates PublicAPI, runs init on DOMContentLoaded
  core/
    tokens.ts          # Service interfaces for all modules
    event-bus.ts       # Typed event bus singleton (CustomEvent wrapper)
    public-api.ts      # PublicAPI facade (window.fixit)
    banner.ts          # Console banner
  modules/
    core.ts            # CoreModule — config, theme mode, mask overlay
    theme.ts           # ThemeModule — color scheme, theme switching
    menu.ts            # MenuModule — desktop/mobile menu
    toc.ts             # TocModule — table of contents sidebar
    search/            # SearchModule — search overlay (fuse/algolia/pagefind/cse)
    content.ts         # ContentModule — SVG icons, link guards, details/summaries
    code.ts            # CodeModule — code blocks, copy buttons, tabs
    encryption.ts      # EncryptionModule — content decryption
    events.ts          # EventsModule — scroll, resize, click handlers
    misc.ts            # MiscModule — site time, rewards, comments
    pwa.ts             # PWAModule — service worker registration
  lib/                 # Third-party library wrappers
    aplayer.ts         # APlayer music player
    echarts.ts         # ECharts charting
    mermaid.ts         # Mermaid diagrams
    mathjax.ts         # MathJax rendering
    lightgallery.ts    # Image gallery
    mapbox.ts          # Mapbox GL maps
    fixit-decryptor.ts # Content decryption engine
    file-tree.ts       # File tree component
  utils/               # Pure utility functions (no side effects)
    index.ts           # Re-exports all utilities
  types/
    config.ts          # FixItConfig and sub-types
    ui.ts              # FixItPublicAPI, Window augmentation
    third-party.ts     # Types for vendored libraries
    params.d.ts        # @params type declaration
  head/
    color-scheme.ts    # Runs in <head> to prevent flash of wrong theme
  pages/
    link.ts            # Link guard redirection page
```

## Service Interfaces (core/tokens.ts)

Every module implements a service interface defined in
`core/tokens.ts`. This provides type safety for the public API
and constructor injection.

```typescript
export interface CoreService {
  readonly config: FixItConfig
  readonly version: string
  isDark: boolean
  themeMode: string
  registerMaskOverlay: (name: string, handlers: MaskOverlayHandler) => void
  openMaskOverlay: (name: string) => void
  closeMaskOverlay: (name: string, skipSync?: boolean) => void
  toggleMaskOverlay: (name: string) => void
  closeActiveMaskOverlay: () => void
  syncMaskState: () => void
}

export interface ThemeService {
  setThemeMode: (mode: string, persist?: boolean) => void
  initThemeColor: () => void
  initSwitchTheme: () => void
  setup: () => void
}

export interface MenuService {
  initDesktop: () => void
  initMobile: () => void
  setup: () => void
}

export interface SearchService { setup: () => void }
export interface CodeService {
  initCodeWrapper: () => void
  initCodeTabs: () => void
  initDiagramCopyBtn: () => void
}
export interface TocService {
  renderToc: () => void
  syncTocHeight: () => void
  syncTocActiveState: () => void
  setup: () => void
}
export interface EncryptionService { setup: () => void }
export interface ContentService {
  initSVGIcon: () => void
  initLinkGuardDialog: (target?: Element | Document) => void
  initContent: (target?: Element | Document) => void
  setup: () => void
}
export interface MiscService {
  initSiteTime: () => void
  initAutoMark: () => void
  initReward: () => void
  initComment: () => void
  initPostChat: () => void
  setup: () => void
}
export interface PWAService { setup: () => void }
export interface EventsService {
  onScroll: () => void
  onResize: () => void
  onClickMask: () => void
  initPrint: () => void
  setup: () => void
}
```

## Constructor Injection (core/public-api.ts)

Modules receive dependencies through their constructors.
No global state access.

```typescript
export class PublicAPI implements FixItPublicAPI {
  readonly core
  readonly theme
  readonly code
  readonly toc
  readonly menu
  readonly search
  readonly enc
  readonly pwa
  readonly misc
  readonly content
  readonly events
  readonly eventBus = eventBus

  constructor() {
    this.core = new CoreModule()
    this.theme = new ThemeModule(this.core)
    this.code = new CodeModule()
    this.toc = new TocModule()
    this.menu = new MenuModule(this.core)
    this.search = new SearchModule(this.core)
    this.enc = new EncryptionModule(this.core)
    this.pwa = new PWAModule(this.core)
    this.misc = new MiscModule(this.core)
    this.content = new ContentModule(this.core, this.code)
    this.events = new EventsModule(this.core, this.code)
  }
}
```

## Module Initialization Sequence (main.ts)

All modules are initialized on `DOMContentLoaded` in a
specific dependency order:

```typescript
function bootstrap(): void {
  window.fixit = new PublicAPI()

  function init() {
    window.fixit.menu.setup()      // 1. UI framework — menu
    window.fixit.theme.setup()     // 2. UI framework — theme
    window.fixit.toc.setup()       // 3. Interactive — toc
    window.fixit.search.setup()    // 4. Interactive — search
    window.fixit.content.setup()   // 5. Content — details, tooltips
    window.fixit.enc.setup()       // 6. Content — decryption
    window.fixit.pwa.setup()       // 7. Global — PWA service worker
    window.fixit.misc.setup()      // 8. Global — comments, rewards
    window.fixit.events.setup()    // 9. Global — scroll, resize
  }

  document.addEventListener('DOMContentLoaded', init, false)
}

bootstrap()
```

## Event Bus (core/event-bus.ts)

A typed event bus wrapping DOM `CustomEvents`. All modules
and library wrappers import the same singleton instance.

```typescript
export interface FixItEventMap {
  'fixit:switch-theme': { isDark: boolean, mode: string, isChanged: boolean }
  'fixit:scroll': void
  'fixit:resize': void
  'fixit:content-decrypted': { target: HTMLElement, isPage: boolean }
  'fixit:toc-decrypted': { html: string }
  'fixit:re-encrypt': void
  'fixit:code-tab-sync': { lang: string, source: HTMLElement }
  'fixit:sw-update': void
}

export class TypedEventBus {
  #target = document

  on<K extends keyof FixItEventMap>(
    event: K, handler: Handler<FixItEventMap[K]>
  ): void {
    this.#target.addEventListener(event as string, handler as EventListener)
  }

  off<K extends keyof FixItEventMap>(
    event: K, handler: Handler<FixItEventMap[K]>
  ): void {
    this.#target.removeEventListener(event as string, handler as EventListener)
  }

  emit<K extends keyof FixItEventMap>(
    event: K,
    ...args: FixItEventMap[K] extends void ? [] : [FixItEventMap[K]]
  ): void {
    const detail = args[0]
    this.#target.dispatchEvent(
      detail !== undefined
        ? new CustomEvent(event as string, { detail })
        : new CustomEvent(event as string),
    )
  }
}

/** Shared singleton — import this, do not create new instances. */
export const eventBus = new TypedEventBus()
```

Usage pattern in modules:

```typescript
import { eventBus } from '../core/event-bus'

// Listen
eventBus.on('fixit:switch-theme', (e) => {
  console.log(e.detail.isDark)
})

// Emit
eventBus.emit('fixit:switch-theme', {
  isDark: true, mode: 'dark', isChanged: true
})
```

## Public API Facade (window.fixit)

The `FixItPublicAPI` interface exposes typed access to all
modules:

```typescript
export interface FixItPublicAPI {
  readonly config: FixItConfig
  readonly version: string
  readonly themeMode: string
  readonly isDark: boolean
  readonly core: CoreService
  readonly theme: ThemeService
  readonly code: CodeService
  readonly toc: TocService
  readonly menu: MenuService
  readonly search: SearchService
  readonly enc: EncryptionService
  readonly pwa: PWAService
  readonly misc: MiscService
  readonly content: ContentService
  readonly events: EventsService
  readonly eventBus: TypedEventBus
  setThemeMode: (mode: string, persist?: boolean) => void
}
```

User custom scripts (`assets/js/custom.ts`) access this via
`window.fixit`.

## Coding Conventions

- **ES6 `#` private fields** — Use `#fieldName`, not
  TypeScript `private _fieldName`
- **One module per file** — Each module is a single class
  in its own file
- **Constructor injection** — Dependencies passed via
  constructor, no global access
- **Event bus for cross-module communication** — Import
  `eventBus` from `core/event-bus`
- **Pure functions in utils/** — No side effects, no DOM
  state, re-exported from `utils/index.ts`
- **TSDoc comments** — Follow https://tsdoc.org/ conventions

## Library Wrappers (lib/)

Third-party integrations wrap vendored libraries from
`assets/lib/`. Each wrapper imports the shared `eventBus`
singleton for cross-module communication.

Examples:

- `aplayer.ts` — Music player integration
- `echarts.ts` — Chart rendering with light/dark theme support
- `mermaid.ts` — Diagram rendering with panzoom support
- `mathjax.ts` — Mathematical notation rendering
- `lightgallery.ts` — Image gallery with zoom/thumbnail plugins
- `fixit-decryptor.ts` — Content decryption engine
- `file-tree.ts` — File/directory tree visualization
