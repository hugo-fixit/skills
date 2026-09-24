# TypeScript Module System

<!-- source: FixIt assets/js/core/tokens.ts, assets/js/main.ts -->

FixIt uses a service-class architecture with constructor injection.
All modules live in `assets/js/`.

## Directory Layout

```
assets/js/
  main.ts              # Entry — creates PublicAPI, runs init on DOMContentLoaded
  service-worker.template.js  # PWA service worker template (ExecuteAsTemplate)
  core/
    tokens.ts          # Service interfaces + FixItPublicAPI
    event-bus.ts       # Typed event bus singleton (CustomEvent wrapper)
    public-api.ts      # PublicAPI class — window.fixit facade
    banner.ts          # Console banner
  modules/
    core.ts            # CoreModule — config (window.config), theme mode, mask overlay
    theme.ts           # ThemeModule — color scheme, theme switching
    menu.ts            # MenuModule — desktop/mobile menu
    toc.ts             # TocModule — table of contents sidebar
    search/            # SearchModule — overlay + engines/
      index.ts         # Search facade
      types.ts         # SearchConfig, PagefindConfig, CSEConfig
      engines/         # algolia.ts, cse.ts, fuse.ts, pagefind.ts
    content.ts         # ContentModule — SVG icons, link guards, collection sort
    code.ts            # CodeModule — code blocks, copy buttons, tabs
    encryption.ts      # EncryptionModule — content decryption
    events.ts          # EventsModule — scroll, resize, click, print
    misc.ts            # MiscModule — site time, rewards, comments, post-chat
    pwa.ts             # PWAModule — service worker registration
  lib/                 # Third-party library wrappers (import shared eventBus)
    aplayer.ts         artalk.ts        cookieconsent.ts  echarts.ts
    file-tree.ts       fixit-decryptor.ts fuse.ts         giscus.ts
    gitalk.ts          json-viewer.ts   lightgallery.ts   mapbox.ts
    mathjax.ts         mermaid.ts       pangu.ts          table-sort.ts
    twemoji.ts         twikoo.ts        typeit.ts         utterances.ts
    valine.ts          waline.ts        watermark.ts
  utils/               # Pure utility functions (no side effects, no DOM state)
    index.ts           # Re-exports all
    animation.ts clipboard.ts comment.ts dom.ts file.ts
    media.ts string.ts theme.ts tooltip.ts validate.ts
  types/
    config.ts          # FixItConfig and all config sub-types
    global.ts          # Window / DocumentEventMap augmentation
    index.ts           # Re-exports config, global, third-party
    third-party.ts     # Types for vendored libraries (Mermaid, Panzoom…)
    params.d.ts        # @params module declaration (defaultTheme only)
    vendor-modules.d.ts # Declarations for vendored .mjs modules
  i18n/                # JS-only runtime translations (19 languages)
    index.ts           # t(key) with English fallback
    ar de en es fa fr hi it ja ko pl pt-BR ro ru sr ur vi zh-CN zh-TW
  head/
    index.ts           # Head entry — runs color-scheme + platform
    color-scheme.ts    # Uses @params.defaultTheme; prevents flash of wrong theme
    platform.ts        # Sets data-platform=mac on <html>
  pages/
    link.ts            # Link guard redirection page
```

## Service Interfaces (core/tokens.ts)

Every module implements a service interface defined in `core/tokens.ts`.
This provides type safety for the public API and constructor injection.

```typescript
export interface CoreService {
  readonly config: FixItConfig
  readonly version: string
  isDark: boolean
  isRTL: boolean
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
  initCollectionSort: () => void
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

  get config() { return this.core.config }
  get version() { return this.core.version }
  get themeMode() { return this.core.themeMode }
  get isDark() { return this.core.isDark }
  get isRTL() { return this.core.isRTL }

  setThemeMode(mode: string, persist?: boolean) {
    this.theme.setThemeMode(mode, persist)
  }
}
```

## Module Initialization Sequence (main.ts)

All modules are initialized on `DOMContentLoaded` in a specific
dependency order:

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
    printBanner(window.fixit.version)
  }

  document.addEventListener('DOMContentLoaded', init, false)
}

bootstrap()
```

## Event Bus (core/event-bus.ts)

A typed event bus wrapping DOM `CustomEvents`. All modules and library
wrappers import the same singleton instance.

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

Usage pattern:

```typescript
import { eventBus } from '../core/event-bus'

eventBus.on('fixit:switch-theme', (e) => {
  console.log(e.detail.isDark)
})

eventBus.emit('fixit:switch-theme', {
  isDark: true, mode: 'dark', isChanged: true,
})
```

## Public API Facade (window.fixit)

`FixItPublicAPI` is declared in `core/tokens.ts`, implemented by
`PublicAPI` in `core/public-api.ts`. User custom scripts
(`assets/js/custom.ts`) access it via `window.fixit`.

```typescript
export interface FixItPublicAPI {
  readonly config: FixItConfig
  readonly version: string
  readonly themeMode: string
  readonly isDark: boolean
  readonly isRTL: boolean
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

## Type Declarations (types/)

| File                    | Contents                                          |
| ----------------------- | ------------------------------------------------- |
| `config.ts`             | `FixItConfig` and sub-types (typed `window.config`) |
| `global.ts`             | `declare global` — `Window.fixit`, `Window.config`, third-party libs |
| `params.d.ts`           | `declare module '@params'` — `defaultTheme` only   |
| `third-party.ts`        | Mermaid/Panzoom etc. runtime types                |
| `vendor-modules.d.ts`   | Declarations for vendored `.mjs` (e.g. fuse)      |
| `index.ts`              | Re-exports config, global, third-party            |

Config access at runtime (not via `@params`):

```typescript
import type { FixItConfig } from './types'
// window.config is emitted by layouts/_partials/gen/config.html
const config: FixItConfig = window.config
```

## JS I18n (i18n/)

Runtime translations for strings that cannot be passed via Hugo
templates (`T` function or `data-*` attributes). Each language is a
separate file exporting a `Translations` object. Language codes match
Hugo i18n filenames and `document.documentElement.lang`.

```typescript
import { t } from './i18n'

// Falls back to English when the key/lang is missing
alert(t('decryptionFailed'))
```

- **Add a language**: create `<lang>.ts`, import it in `i18n/index.ts`,
  add to the `translations` map.
- **Add a key**: add to the `Translations` interface and to **every**
  language file.

19 languages: `ar`, `de`, `en`, `es`, `fa`, `fr`, `hi`, `it`, `ja`,
`ko`, `pl`, `pt-BR`, `ro`, `ru`, `sr`, `ur`, `vi`, `zh-CN`, `zh-TW`.

## Coding Conventions

- **ES6 `#` private fields** — Use `#fieldName`, not TypeScript `private _fieldName`
- **One module per file** — Each module is a single class in its own file
- **Constructor injection** — Dependencies via constructor, no global access
- **Event bus for cross-module communication** — Import `eventBus` from `core/event-bus`
- **Pure functions in utils/** — No side effects, no DOM state, re-exported from `utils/index.ts`
- **TSDoc comments** — Follow https://tsdoc.org/ conventions

## Library Wrappers (lib/)

Third-party integrations wrap vendored libraries from `assets/lib/`.
Each wrapper imports the shared `eventBus` singleton. All 23 files:

`aplayer.ts`, `artalk.ts`, `cookieconsent.ts`, `echarts.ts`, `file-tree.ts`,
`fixit-decryptor.ts`, `fuse.ts`, `giscus.ts`, `gitalk.ts`, `json-viewer.ts`,
`lightgallery.ts`, `mapbox.ts`, `mathjax.ts`, `mermaid.ts`, `pangu.ts`,
`table-sort.ts`, `twemoji.ts`, `twikoo.ts`, `typeit.ts`, `utterances.ts`,
`valine.ts`, `waline.ts`, `watermark.ts`
