---
name: fixit-dev
description: >
  FixIt Hugo theme development — monorepo architecture, TypeScript module system,
  Hugo templates, asset pipeline, coding standards. Use when contributing to FixIt
  theme, adding new features, or modifying theme internals.
metadata:
  author: hugo-fixit
  version: 2026.8.4
  source: Generated from https://github.com/hugo-fixit/FixIt and https://github.com/hugo-fixit/fixit-docs
---

# FixIt Theme Development

FixIt is a modern Hugo theme built with TypeScript, SCSS, UnoCSS,
and Hugo templates. This skill covers contributing to the theme.

## Prerequisites

- Node.js >= 22
- Hugo Extended >= 0.161.0 (Dart Sass required)
- pnpm

## Development Commands

```bash
pnpm install           # Install dependencies
pnpm dev:demo          # Start demo site dev server
pnpm dev:test          # Start test site dev server
pnpm dev:docs          # Start docs dev server (requires fixit-docs as sibling)
pnpm build:demo        # Build demo site
pnpm build:test        # Build test site
pnpm build             # Build all (demo + test merged into public/)
pnpm preview           # Preview built site
pnpm lint              # Run ESLint
pnpm typecheck         # Run TypeScript type checking
pnpm gen:lexers        # Regenerate Chroma lexer SCSS map
pnpm unocss            # Rebuild UnoCSS utility classes
```

No unit tests. Verify changes by building and inspecting output.

## Monorepo Structure

Root package.json is `@hugo-fixit/core`. pnpm workspaces:
`apps/*` and `packages/*`.

| Directory               | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `apps/demo/`            | Demo site (demo.fixit.lruihao.cn)       |
| `apps/test/`            | Test site for exercising theme features |
| `packages/shared`       | Shared utilities                        |
| `packages/versioning`   | Auto-updates version during pre-commit  |
| `packages/integration`  | Merges demo/test output into public/    |
| `packages/chroma-lexers`| Generates Chroma lexer SCSS map         |
| `packages/encrypt`      | Encrypts content in built output        |

## Key Architecture Patterns

### TypeScript Modules (`assets/js/`)

Service-class architecture with constructor injection.
Entry: `main.ts` creates `PublicAPI` which initializes all
modules in dependency order:

```
menu -> theme -> toc -> search -> content -> enc -> pwa -> misc -> events
```

- **core/tokens.ts** — Service interfaces
- **core/event-bus.ts** — Typed singleton event bus
- **modules/** — Feature modules implementing interfaces
- **lib/** — Third-party library wrappers
- **utils/** — Pure utility functions
- **types/** — FixItConfig, FixItPublicAPI, Window augmentation

### Hugo Templates (`layouts/`)

- **_partials/init/** — Theme initialization
- **_partials/base/** — Core layout (assets.html orchestrates CSS/JS)
- **_partials/function/** — Helpers (param.html, js-build.html)
- **_partials/store/** — Script/style accumulation
- **_shortcodes/** — 31 custom shortcodes
- **_markup/** — 15 render hooks

### Asset Pipeline

- **CSS**: UnoCSS (pre-built) -> main.scss via Hugo Pipes
- **JS**: main.ts -> js.Build with `@params` config injection
- **Libs**: Vendored in assets/lib/, overridable via CDN config

## Coding Standards

### TypeScript

- ES6 `#` private fields (not `_` prefix)
- One module per file, constructor injection
- Import shared `eventBus` singleton from `core/event-bus`
- Pure functions only in `utils/`
- TSDoc comment conventions

### SCSS

- BEM or semantic class names
- CSS custom properties: `--fi-` prefix
- CSS variables for theme switching; SCSS variables for colors
- Prefer relative units (rem, em, %)

### UnoCSS

- Pre-built utility classes (config: `uno.config.ts`)
- Theme colors: `bg-primary`, `text-success`, `text-danger`
- Breakpoints: `sm:` (680px), `md:` (960px), `lg:` (1200px), `xl:` (1440px)
- Wrap SVGs with `<!-- @unocss-skip-start -->` / `<!-- @unocss-skip-end -->`

### Hugo Templates

- camelCase variables (`$footerConfig`, `$fingerprint`)
- `{{- -}}` trim markers
- `partialCached` for expensive partials
- `.Site.Store` for shared computed values
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
