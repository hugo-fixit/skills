---
name: fixit-dev
description: >
  FixIt Hugo theme development — monorepo architecture, TypeScript module system,
  Hugo templates, asset pipeline, coding standards. Use when contributing to FixIt
  theme, adding new features, or modifying theme internals.
metadata:
  author: hugo-fixit
  version: 2026.9.24
  source: Generated from https://github.com/hugo-fixit/FixIt and https://github.com/hugo-fixit/fixit-docs
---

# FixIt Theme Development

FixIt is a modern Hugo theme built with TypeScript, SCSS, UnoCSS,
and Hugo templates. This skill covers contributing to the theme.

## Prerequisites

- Node.js >= 22
- Hugo Extended >= 0.166.0 (Dart Sass required)
- pnpm

## Development Commands

```bash
pnpm install           # Install dependencies
pnpm dev:demo          # Start demo site dev server
pnpm dev:test          # Start test site dev server
pnpm dev:docs          # Start docs dev server (requires fixit-docs as sibling)
pnpm build:demo        # Build demo site
pnpm build:test        # Build test site
pnpm build             # Build all (demo + test merged into public/, then encrypt)
pnpm preview           # Preview built site (serve public)
pnpm clean             # Remove public/ and resources/_gen caches
pnpm lint              # Run ESLint (@antfu/eslint-config)
pnpm typecheck         # tsc --noEmit -p assets/tsconfig.json
pnpm unocss            # Build UnoCSS utilities -> assets/css/unocss.css
pnpm unocss:watch      # Watch mode for UnoCSS
pnpm gen:lexers        # Regenerate Chroma lexer SCSS map
pnpm gen:docs          # Generate API reference docs from sources
pnpm gen:typedoc       # Generate TypeDoc for TypeScript APIs
pnpm gen:sassdoc       # Generate Sassdoc for SCSS APIs
pnpm encrypt           # Post-build AES-256-GCM content encryption
pnpm changelog         # Generate changelog
```

No unit tests. Verify changes by building and inspecting output.

## Monorepo Structure

Root package.json is `@hugo-fixit/core`. pnpm workspaces:
`apps/*` and `packages/*`.

| Directory                 | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `apps/demo/`              | Demo site (demo.fixit.lruihao.cn)          |
| `apps/test/`              | Test site for exercising theme features    |
| `packages/shared`         | Shared utilities (workspaceRoot, consola…) |
| `packages/versioning`     | Auto-updates version during pre-commit     |
| `packages/integration`    | Merges demo/test output into public/       |
| `packages/chroma-lexers`  | Generates Chroma lexer SCSS map            |
| `packages/encrypt`        | Encrypts content in built output           |
| `packages/gen-docs`       | Generates API reference from source files  |
| `packages/unocss-preset`  | `@hugo-fixit/unocss-preset` theme preset   |

## Key Architecture Patterns

### TypeScript Modules (`assets/js/`)

Service-class architecture with constructor injection.
Entry: `main.ts` creates `PublicAPI` which initializes all
modules in dependency order:

```
menu -> theme -> toc -> search -> content -> enc -> pwa -> misc -> events
```

- **core/tokens.ts** — Service interfaces + `FixItPublicAPI`
- **core/public-api.ts** — `PublicAPI` facade (`window.fixit`)
- **core/event-bus.ts** — Typed singleton event bus
- **modules/** — Feature modules (incl. `search/engines/`)
- **lib/** — Third-party library wrappers (23 modules)
- **utils/** — Pure utility functions
- **types/** — `config.ts`, `global.ts` (Window), `params.d.ts`, `third-party.ts`, `vendor-modules.d.ts`
- **i18n/** — 19 language files + `index.ts` (`t(key)` with English fallback)
- **head/** — Sync head scripts (`color-scheme.ts`, `platform.ts`)
- **pages/** — Page-specific scripts (`link.ts`)
- **service-worker.template.js** — PWA SW template

### Hugo Templates (`layouts/`)

Root templates (no `layouts/_default/`): `baseof.html`, `page.html`,
`section.html`, `home.html`, `home.*.html`, `search.html`, `summary.html`,
taxonomy templates, `posts/single.html`, plus text outputs (rss/json/webmanifest).

- **_partials/init/** — Theme initialization
- **_partials/base/** — Core layout (`base/head/` for head; `assets.html` orchestrates CSS/JS)
- **_partials/function/** — Helpers (`param.html`, `js-build.html`)
- **_partials/gen/** — Generated scripts (`config.html`, `mermaid-bootstrap.html`)
- **_partials/store/** — Script/style accumulation (`script.html`, `style.html`)
- **_shortcodes/** — 29 custom shortcodes
- **_markup/** — 14 render hooks (incl. `render-passthrough.html`)

### Asset Pipeline

- **CSS**: UnoCSS pre-built via `@hugo-fixit/unocss-preset` -> main.scss (Hugo Pipes)
- **JS**: `main.ts` -> `js-build.html`; page config emitted as `window.config` script
- **Libs**: Vendored in `assets/lib/` (librarybot quarterly), overridable via CDN config

## Coding Standards

### TypeScript

- ES6 `#` private fields (not `_` prefix)
- One module per file, constructor injection
- Import shared `eventBus` singleton from `core/event-bus`
- Pure functions only in `utils/`
- TSDoc comment conventions

### SCSS

- BEM or semantic class names
- CSS custom properties: `--fi-` prefix; reference with `fi-var()`
- **Never write `var(--fi-...)` directly** — always use `fi-var()`
- CSS variables for theme switching; SCSS variables for colors
- Prefer relative units (rem, em, %)

### UnoCSS

- Pre-built utility classes (config: `uno.config.ts` -> `createFixItConfig`)
- Theme/shortcuts/blocklist/safelist live in `packages/unocss-preset`
- Theme colors: `bg-primary`, `text-success`, `text-danger`
- Breakpoints: `sm:` (680px), `md:` (960px), `lg:` (1200px), `xl:` (1440px)
- Wrap SVGs with `<!-- @unocss-skip-start -->` / `<!-- @unocss-skip-end -->`

### Hugo Templates

- camelCase variables (`$footerConfig`, `$fingerprint`)
- `{{- -}}` trim markers
- `partialCached` for expensive partials
- `.Site.Store` for shared computed values
- Gate analytics/minification with `hugo.IsProduction`
- Prefer class selectors over `id` attributes

## Commit Convention

```
<type>(<scope>): <subject>
```

Types: feat, fix, refactor, chore, docs, perf, style, test, ci, build

## Reference Documents

| Document | Contents |
| -------- | -------- |
| [Architecture](references/architecture.md) | Monorepo, packages, build, pre-commit |
| [TypeScript Modules](references/typescript-modules.md) | Interfaces, event bus, public API |
| [Hugo Templates](references/hugo-templates.md) | Hierarchy, partials, shortcodes |
| [Asset Pipeline](references/asset-pipeline.md) | CSS/JS pipeline, UnoCSS, CDN |
