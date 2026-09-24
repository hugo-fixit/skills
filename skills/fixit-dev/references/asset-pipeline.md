# Asset Pipeline

<!-- source: FixIt layouts/_partials/base/assets.html, CLAUDE.md -->

Hugo Pipes processes all assets. The orchestration happens in
`layouts/_partials/base/assets.html`.

## CSS Pipeline

### UnoCSS (Pre-built)

UnoCSS utility classes are pre-built to `assets/css/unocss.css` via
`pnpm unocss` (or `pnpm unocss:watch`). This runs outside Hugo and
produces a static CSS file that is loaded before the main SCSS bundle.

Root `uno.config.ts` is a thin wrapper around
`@hugo-fixit/unocss-preset`:

```typescript
import { createFixItConfig } from '@hugo-fixit/unocss-preset'

export default createFixItConfig({
  overrides: {
    content: {
      filesystem: ['layouts/**/*.html', 'assets/js/**/*.ts'],
      pipeline: { exclude: ['node_modules', 'dist'] },
    },
    cli: {
      entry: [
        {
          patterns: ['layouts/**/*.html', 'assets/js/**/*.ts'],
          outFile: 'assets/css/unocss.css',
        },
      ],
    },
  },
})
```

### `@hugo-fixit/unocss-preset` (packages/unocss-preset)

`createFixItConfig()` composes `presetIcons` (lucide + octicon),
`presetWind3`, and `presetFixIt`. Theme tokens, shortcuts, blocklist,
and safelist live in `packages/unocss-preset/src/index.ts` — do not
duplicate them in `uno.config.ts`.

- **theme.breakpoints** — `sm: 680px`, `md: 960px`, `lg: 1200px`, `xl: 1440px`
  (use `max-sm:` for xs < 680px)
- **theme.colors** — `primary/secondary/success/info/warning/danger`
  mapped to `var(--fi-*)` for runtime theme switching
- **shortcuts** — z-index scale (`z-hide`, `z-base`, `z-loading`,
  `z-sticky`, `z-fixed`); mirrors `core/mixins/_z-index.scss`
- **blocklist** — blocks `container`, `h1`–`h6`, `fa-*` false positives
- **preflights** — empty (FixIt has its own reset in `core/_reboot.scss`)
- **safelist** — classes used dynamically in templates
  (`text-*`, `bg-*`, `order-*`, `sm:hidden`, `max-sm:hidden`,
  `print:hidden`, `break-before-page`, `break-after-page`)

To add a safelist class (dynamically generated utility):

1. Append the class to `safelist` in `packages/unocss-preset/src/index.ts`
2. Run `pnpm unocss` to regenerate `assets/css/unocss.css`

```typescript
// packages/unocss-preset/src/index.ts
safelist: [
  // ...
  'sm:hidden',
  'order-first',
  'break-before-page',
],
```

Other conventions:

- Wrap SVG elements with `<!-- @unocss-skip-start -->` /
  `<!-- @unocss-skip-end -->` to avoid false positives from `d` attrs
- Prefer atomic classes (`hidden`, `me-1`, `text-center`) in templates

### Main SCSS Bundle

Entry point: `assets/scss/main.scss`

```scss
@charset "utf-8";

@use "core";
@use "content";
@use "widgets";
```

Directory structure:

```
assets/scss/
  _variables.scss       # Global SCSS variables
  main.scss             # Entry point
  core/                 # Framework styles (reset, typography, layout, mixins)
  content/              # Content element styles
  widgets/              # Sidebar/widget styles
  pages/                # Page-specific styles (generated per-page)
  custom.scss.example   # User custom stylesheet template
```

### SCSS Variables via hugo:vars

SCSS variables are configured at build time through Hugo's `hugo:vars`
directive. Two sources:

1. **User-configurable** — From `[params.appearance]` in hugo.toml
   (colors, fonts, widths)
2. **Theme internal** — System config values (breakpoints, z-index layers)

### CSS Custom Properties (`fi-var()`)

All theme-switchable values use CSS custom properties with the `--fi-`
prefix. **Always reference them with `fi-var()`** (auto-adds the `--fi-`
prefix) — never write `var(--fi-...)` directly.

```scss
// SCSS variable (static, set at build time)
$primary-color: #6d28d9;

// CSS custom property (dynamic, switchable at runtime)
--fi-primary: #{$primary-color};

// In rules — use fi-var(), not var(--fi-...)
.my-class {
  color: fi-var(primary);       // OK
  // color: var(--fi-primary);  // WRONG
}
```

## JS Pipeline

### Entry Point

`assets/js/main.ts` is the entry point. Built once (in `base/head/index.html`)
and registered via `store/script.html`:

```go-html-template
{{- dict "Resource" (.Site.Store.Get "mainJS") "Defer" true
   | dict "Page" . "Data" | partial "store/script.html" -}}
```

### Config Injection (`@params` vs `window.config`)

Two separate channels — do not confuse them:

1. **`@params`** — Build-time import alias mapped to
   `assets/js/types/params.d.ts`. Contains **only** `defaultTheme`.
   Used by `head/color-scheme.ts` (runs in `<head>` before body render).

   ```typescript
   import params from '@params'
   // params.defaultTheme === 'light' | 'dark' | ...
   ```

2. **`window.config`** — Per-page runtime config, emitted as a separate
   inline/external script by `gen/config.html` (wired in
   `base/assets.html`). Typed as `FixItConfig` from `types/config.ts`.

   ```go-html-template
   {{- $configJS := dict "Config" $config | partial "gen/config.html" -}}
   {{- $configPath := printf "%s/js/config/%s.js" $languagePrefix $uniqueFileId -}}
   {{- dict "Content" $configJS "Path" $configPath "Minify" hugo.IsProduction "Defer" true
      | dict "Page" . "Data" | partial "store/script.html" -}}
   ```

   ```typescript
   import type { FixItConfig } from './types'
   // window.config is a global (declared in types/global.ts)
   const config: FixItConfig = window.config
   ```

   `gen/config.html` emits `window.config=<JSON>;` (plus a `console.log`
   when `hugo.IsServer`).

`@params` path alias is configured in `assets/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@params": ["./js/types/params"]
    }
  }
}
```

### function/js-build.html Partial

Wraps Hugo's `js.Build` with minify-in-production defaults. Accepts a
**resource** (not a path) and returns the processed resource.

```go-html-template
{{- $resource := resources.Get "js/lib/echarts.ts" -}}
{{- $resource = dict "Resource" $resource "Build" true
   "Minify" hugo.IsProduction "Fingerprint" $fingerprint
   | partial "function/js-build.html" -}}
```

Fields:

- `Resource` — Hugo resource to process (required)
- `Build` — `true` for defaults, dict for custom `js.Build` options,
  omit/false to skip `js.Build`
- `Minify` — Extra minify flag (final minify is `Minify OR Build.minify`)
- `Fingerprint` — Fingerprint algorithm (e.g. `"sha256"`)

### store/script.html / plugin/script.html

`store/script.html` only **accumulates** entries
(`dict "Page" . "Data" <config> | partial "store/script.html"`).
The real rendering is `plugin/script.html`, which accepts:

| Field         | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `Source`      | Script source URL/path (or raw `<script...` HTML) |
| `Resource`    | Pre-built resource (skips build pipeline)         |
| `Content`     | Inline script content (requires `Path`)           |
| `Path`        | Target path for `Content`                         |
| `Template`    | `ExecuteAsTemplate` path (with `Context`)         |
| `Build`       | `true` or `js.Build` options dict                 |
| `Minify`      | Minify output (typically `hugo.IsProduction`)     |
| `Fingerprint` | Fingerprint algorithm for SRI                     |
| `Defer` / `Async` / `Crossorigin` / `Integrity` / `Attr` | Script attributes |

## Third-Party Libraries

### Vendored Libraries

Stored in `assets/lib/` (not managed by npm). These are vendored
directly into the theme. Wrappers live in `assets/js/lib/*.ts`.

Tracked by `assets/lib/librarybot.yml` and updated **quarterly** by the
`hugo-fixit/librarybot` GitHub Action
(`.github/workflows/librarybot.yml`, cron `0 0 1 */3 *`).

### CDN Override System

Users can override vendored libraries with CDN versions via config
files:

- `assets/data/cdn/jsdelivr.yml` — jsDelivr CDN mappings
- `assets/data/cdn/unpkg.yml` — unpkg CDN mappings

The template resolves CDN vs local:

```go-html-template
{{- $source := $cdn.lightgalleryJS
   | default "lib/lightgallery/lightgallery.min.js" -}}
```

### Library Registration Pattern

Libraries are conditionally registered based on feature flags:

```go-html-template
{{- if .Store.Get "hasEcharts"
   | and (not $isArchivesOrOffline) -}}
  {{- $source := $cdn.echartsJS
     | default "lib/echarts/echarts.min.js" -}}
  {{- dict "Source" $source "Fingerprint" $fingerprint "Defer" true
     | dict "Page" . "Data" | partial "store/script.html" -}}
  {{- dict "Source" "js/lib/echarts.ts" "Build" true
     "Fingerprint" $fingerprint "Defer" true
     | dict "Page" . "Data" | partial "store/script.html" -}}
{{- end -}}
```

Feature flags are set in earlier partials (shortcodes, render hooks)
via `.Store.Set`:

```go-html-template
{{- .Page.Store.Set "hasEcharts" true -}}
```

## TypeScript Configuration

`assets/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "paths": {
      "@params": ["./js/types/params"]
    },
    "typeRoots": ["./js/types"],
    "strict": true,
    "noUnusedLocals": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["js/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Key points:

- `@params` alias maps to `js/types/params` — **`defaultTheme` only**
- `typeRoots` points to `js/types/` for global type declarations
  (`global.ts` declares `Window.fixit` / `Window.config`)
- `strict: true` enforced
- Target: ESNext (Hugo's `js.Build` handles final transpilation)

## Asset Loading Order

The final HTML loads assets in this order:

1. **UnoCSS** — Pre-built utility classes
2. **Third-party CSS** — Vendored library stylesheets
3. **Main SCSS** — Compiled `main.scss` bundle
4. **Page-specific CSS** — Accumulated via `store/style.html`
5. **Third-party JS** — Vendored library scripts (defer)
6. **Config script** — `window.config` object (inline/generated)
7. **Main JS** — Compiled `main.ts` bundle (defer)
8. **Library wrappers** — `js/lib/*.ts` bundles (defer)
9. **Custom JS** — User's `custom.ts` or `custom.js` (defer)
10. **Page-specific JS** — Accumulated via `store/script.html`
11. **Analytics** — Production-only tracking scripts
