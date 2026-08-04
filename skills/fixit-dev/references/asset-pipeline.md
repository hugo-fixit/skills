# Asset Pipeline

<!-- source: FixIt layouts/_partials/base/assets.html, CLAUDE.md -->

Hugo Pipes processes all assets. The orchestration happens
in `layouts/_partials/base/assets.html`.

## CSS Pipeline

### UnoCSS (Pre-built)

UnoCSS utility classes are pre-built to
`assets/css/unocss.css` via `pnpm unocss`. This runs
outside Hugo and produces a static CSS file that is loaded
before the main SCSS bundle.

Config: `uno.config.ts`

```typescript
import { defineConfig, presetIcons, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      prefix: '',
      collections: {
        lucide: () => import('@iconify/json/json/lucide.json')
          .then(i => i.default),
        octicon: () => import('@iconify/json/json/octicon.json')
          .then(i => i.default),
      },
    }),
    presetWind3(),
  ],
  theme: {
    breakpoints: {
      sm: '680px', md: '960px', lg: '1200px', xl: '1440px'
    },
    colors: {
      primary: 'var(--fi-primary)',
      secondary: 'var(--fi-secondary)',
      success: 'var(--fi-success)',
      info: 'var(--fi-info)',
      warning: 'var(--fi-warning)',
      danger: 'var(--fi-danger)',
    },
  },
  preflights: [],  // No reset — FixIt has its own in core/_reboot.scss
  shortcuts: {
    'z-hide': 'z--1', 'z-base': 'z-1', 'z-loading': 'z-10',
    'z-sticky': 'z-100', 'z-fixed': 'z-200',
  },
  safelist: [
    'text-success', 'text-error', 'text-warning',
    'text-info', 'text-primary',
  ],
})
```

Key conventions:

- Theme colors use CSS custom properties (`var(--fi-primary)`)
  for theme switching
- Responsive breakpoints: `sm:` (>=680px), `md:` (>=960px),
  `lg:` (>=1200px), `xl:` (>=1440px)
- Use `max-sm:` for xs (<680px)
- Wrap SVG elements with `<!-- @unocss-skip-start -->` /
  `<!-- @unocss-skip-end -->`
- `safelist` for dynamically generated classes

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

SCSS variables are configured at build time through Hugo's
`hugo:vars` directive. Two sources:

1. **User-configurable** — From `[params.appearance]` in
   hugo.toml (colors, fonts, widths)
2. **Theme internal** — System config values (breakpoints,
   z-index layers)

### CSS Custom Properties

All theme-switchable values use CSS custom properties with
the `--fi-` prefix:

```scss
// SCSS variable (static, set at build time)
$primary-color: #6d28d9;

// CSS custom property (dynamic, switchable at runtime)
--fi-primary: #{$primary-color};
```

## JS Pipeline

### Entry Point

`assets/js/main.ts` is the entry point. Hugo's `js.Build`
processes it:

```go-html-template
{{- dict "Resource" (.Site.Store.Get "mainJS") "Defer" true
   | dict "Page" . "Data" | partial "store/script.html" -}}
```

### Config Injection (@params)

Hugo injects page/site config into TypeScript at build time
via the `@params` import alias.

The `gen/config.html` partial generates a JS config object
from collected params:

```go-html-template
{{- $configJS := dict "Config" $config
   | partial "gen/config.html" -}}
{{- dict "Content" $configJS "Path" $configPath
   "Minify" hugo.IsProduction "Defer" true
   | dict "Page" . "Data" | partial "store/script.html" -}}
```

TypeScript accesses this via:

```typescript
import type { FixItConfig } from '@params'

const config: FixItConfig = window.config
```

The `@params` path alias is configured in
`assets/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@params": ["./js/types/params"]
    }
  }
}
```

### js-build.html Partial

Wraps Hugo's `js.Build` with sensible defaults:

```go-html-template
{{- dict "Source" "js/lib/echarts.ts" "Build" true
   "Fingerprint" $fingerprint "Defer" true
   | dict "Page" . "Data" | partial "store/script.html" -}}
```

Fields:

- `Source` — Asset path or URL
- `Build` — If true, process with `js.Build`
- `Fingerprint` — Add content hash for cache busting
- `Defer` / `Async` — Script loading strategy
- `Minify` — Minify output (typically `hugo.IsProduction`)
- `Content` — Inline script content
- `Path` — Target path for inline content

## Third-Party Libraries

### Vendored Libraries

Stored in `assets/lib/` (not managed by npm). These are
vendored directly into the theme.

Tracked by `librarybot.yml` and updated weekly by the
`hugo-fixit/librarybot` GitHub Action.

### CDN Override System

Users can override vendored libraries with CDN versions via
config files:

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

Feature flags are set in earlier partials (shortcodes,
render hooks) via `.Store.Set`:

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

- `@params` alias maps to `js/types/params` for Hugo config
  injection
- `typeRoots` points to `js/types/` for global type declarations
- `strict: true` enforced
- Target: ESNext (Hugo's js.Build handles final transpilation)

## Asset Loading Order

The final HTML loads assets in this order:

1. **UnoCSS** — Pre-built utility classes
2. **Third-party CSS** — Vendored library stylesheets
3. **Main SCSS** — Compiled `main.scss` bundle
4. **Page-specific CSS** — Accumulated via `store/style.html`
5. **Third-party JS** — Vendored library scripts (defer)
6. **Config script** — `window.config` object (inline)
7. **Main JS** — Compiled `main.ts` bundle (defer)
8. **Library wrappers** — `js/lib/*.ts` bundles (defer)
9. **Custom JS** — User's `custom.ts` or `custom.js` (defer)
10. **Page-specific JS** — Accumulated via `store/script.html`
11. **Analytics** — Production-only tracking scripts
