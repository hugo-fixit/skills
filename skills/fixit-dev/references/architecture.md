# FixIt Architecture

<!-- source: FixIt CLAUDE.md, package.json, pnpm-workspace.yaml -->

## Monorepo Structure

Root `package.json` is `@hugo-fixit/core` (private, not published).
Uses pnpm workspaces (`apps/*`, `packages/*`).

```
FixIt/
  apps/
    demo/          # Demo site (demo.fixit.lruihao.cn)
    test/          # Test site for exercising theme features
  packages/
    shared/        # Workspace utilities (workspaceRoot, fromRoot, runCommand, capitalize, consola)
    versioning/    # Auto-updates version in layouts/_partials/init/index.html during pre-commit
    integration/   # Post-build: merges demo/test output into public/
    chroma-lexers/ # Generates assets/scss/core/maps/_chroma-lexers.scss from Chroma source
    encrypt/       # Post-build AES-256-GCM content encryption
    gen-docs/      # Generates API reference docs from source files
    unocss-preset/ # @hugo-fixit/unocss-preset — UnoCSS theme preset
  assets/
    js/            # TypeScript source (modules, core, lib, utils, types, i18n, head, pages)
    scss/          # SCSS styles (core, content, widgets, pages)
    css/           # Pre-built UnoCSS utilities (unocss.css)
    lib/           # Vendored third-party libraries (not npm-managed)
    data/          # CDN override configs (jsdelivr.yml, unpkg.yml)
  layouts/
    *.html         # Root templates (baseof, page, section, home, search, taxonomy…)
    posts/         # posts/single.html
    _partials/     # Reusable template components
    _shortcodes/   # 29 custom shortcodes
    _markup/       # 14 render hooks
  hugo.toml        # Default theme configuration (1700+ lines, _merge = "shallow")
  theme.toml       # Theme metadata (min_version = "0.166.0")
```

## Build Pipeline

### Full Build

```bash
pnpm build
# 1. concurrently 'pnpm build:demo' 'pnpm build:test'
# 2. pnpm -F integration start   # merge outputs into public/
# 3. pnpm encrypt                # encrypt protected content
```

### Development

```bash
pnpm dev:demo   # Hugo dev server for demo site
pnpm dev:test   # Hugo dev server for test site
pnpm dev:docs   # Hugo dev server for docs (requires ../fixit-docs)
```

### Code Quality

```bash
pnpm lint        # ESLint with @antfu/eslint-config (eslint.config.ts)
pnpm typecheck   # tsc --noEmit -p assets/tsconfig.json
pnpm unocss      # Rebuild assets/css/unocss.css from templates + TS
```

No unit tests. Verify by building and inspecting output.

## Pre-commit Hooks

Configured via `simple-git-hooks` in package.json:

```
pre-commit: pnpm -F versioning start dev && pnpm typecheck && pnpm lint-staged
```

1. **versioning** (dev mode) — Updates theme version in
   `layouts/_partials/init/index.html`
2. **typecheck** — TypeScript compiler check mode
3. **lint-staged** — `eslint --fix` on staged files

## Workspace Packages Detail

### `packages/shared`

Shared Node.js utilities used by other packages:

```typescript
export { workspaceRoot }  // Absolute path to monorepo root
export { fromRoot }       // Resolve paths relative to root
export { runCommand }     // Execute shell commands
export { capitalize }     // String capitalization
export { consola }        // Logger instance
```

### `packages/versioning`

Manages theme version string. Dev mode generates a dev version;
prod mode reads from git tags. Updates
`layouts/_partials/init/index.html`:

```go-html-template
{{- hugo.Store.Set "version" "v1.0.0-alpha" -}}
```

### `packages/integration`

Post-build step that merges demo and test site outputs into a
single `public/` directory for preview/deployment.

### `packages/chroma-lexers`

Generates `assets/scss/core/maps/_chroma-lexers.scss` from Chroma
syntax highlighter source. Run via `pnpm gen:lexers`.

### `packages/encrypt`

Processes built HTML to encrypt content marked with password
protection (AES-256-GCM). Run via `pnpm encrypt` (also part of `pnpm build`).

### `packages/gen-docs`

Generates API reference documentation from FixIt source files
(hugo.toml params, shortcodes, partials, TS modules). Run via
`pnpm gen:docs`. Related generators: `pnpm gen:typedoc`, `pnpm gen:sassdoc`.

### `packages/unocss-preset`

`@hugo-fixit/unocss-preset` — shared UnoCSS preset for FixIt.
Exports `createFixItConfig()` and `presetFixIt`. Holds theme tokens
(breakpoints, `--fi-*` colors), z-index shortcuts, blocklist, and
safelist. Consumed by root `uno.config.ts`:

```typescript
import { createFixItConfig } from '@hugo-fixit/unocss-preset'

export default createFixItConfig({
  overrides: {
    content: { filesystem: ['layouts/**/*.html', 'assets/js/**/*.ts'] },
    cli: {
      entry: [{ patterns: ['layouts/**/*.html', 'assets/js/**/*.ts'], outFile: 'assets/css/unocss.css' }],
    },
  },
})
```

To add safelist classes (dynamically generated utilities), edit
`safelist` in `packages/unocss-preset/src/index.ts`, then `pnpm unocss`.

## Theme Configuration

- **hugo.toml** — Default configuration. Uses `_merge = "shallow"`
  so user configs override without deep merging.
- **theme.toml** — Theme metadata (name, license, `min_version = "0.166.0"`).
- Users override settings in their site's `hugo.toml`; theme defaults
  apply where not overridden.

## Directory Responsibilities

| Directory                       | Role                                   |
| ------------------------------- | -------------------------------------- |
| `assets/js/`                    | TypeScript modules, entry, types, i18n |
| `assets/js/i18n/`               | JS-only runtime translations (19 langs)|
| `assets/js/service-worker.template.js` | PWA service worker template      |
| `assets/scss/`                  | SCSS stylesheets (core, content, widgets)|
| `assets/css/`                   | Pre-built UnoCSS utility classes       |
| `assets/lib/`                   | Vendored third-party libraries         |
| `assets/data/`                  | CDN configuration files                |
| `layouts/_partials/init/`       | Theme initialization partials          |
| `layouts/_partials/base/`       | Core layout; `base/head/` head partials|
| `layouts/_partials/function/`   | Helper function partials               |
| `layouts/_partials/gen/`        | Generated script content (window.config)|
| `layouts/_partials/store/`      | Asset accumulation (script/style)      |
| `layouts/_partials/home/`       | Home page partials (profile)           |
| `layouts/_partials/feed/`       | RSS feed partials                      |
| `layouts/_partials/section/`    | Section partials (recently-updated)    |
| `layouts/_partials/plugin/`     | Third-party / feature renderers        |
| `layouts/_partials/single/`     | Single-page partials (toc, related)    |
| `layouts/_partials/_debug/`     | Debug helpers (dump, template-call-stack)|
| `layouts/_shortcodes/`          | 29 custom Hugo shortcodes              |
| `layouts/_markup/`              | 14 render hooks                        |
