# FixIt Architecture

<!-- source: FixIt CLAUDE.md, package.json, pnpm-workspace.yaml -->

## Monorepo Structure

Root `package.json` is `@hugo-fixit/core` (private, not published).
Uses pnpm workspaces.

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
    encrypt/       # Encrypts content in built output
    gen-docs/      # Documentation generation helpers
  assets/
    js/            # TypeScript source (modules, core, lib, utils, types)
    scss/          # SCSS styles (core, content, widgets, pages)
    css/           # Pre-built UnoCSS utilities
    lib/           # Vendored third-party libraries (not npm-managed)
    data/          # CDN override configs (jsdelivr.yml, unpkg.yml)
  layouts/
    _partials/     # Reusable template components
    _shortcodes/   # 31 custom shortcodes
    _markup/       # 15 render hooks
  hugo.toml        # Default theme configuration (1700+ lines)
  theme.toml       # Theme metadata
```

## Build Pipeline

### Full Build

```bash
pnpm build
# Runs: concurrently 'pnpm build:demo' 'pnpm build:test'
# Then: pnpm -F integration start  (merges outputs into public/)
# Then: pnpm encrypt               (encrypts protected content)
```

### Development

```bash
pnpm dev:demo   # Hugo dev server for demo site
pnpm dev:test   # Hugo dev server for test site
pnpm dev:docs   # Hugo dev server for docs (requires ../fixit-docs)
```

### Code Quality

```bash
pnpm lint        # ESLint with @antfu/eslint-config (config: eslint.config.ts)
pnpm typecheck   # tsc --noEmit -p assets/tsconfig.json
```

No unit tests. Verify by building and inspecting output.

## Pre-commit Hooks

Configured via `simple-git-hooks` in package.json:

```
pre-commit: pnpm -F versioning start dev && pnpm typecheck && pnpm lint-staged
```

1. **versioning** (dev mode) — Updates theme version in
   `layouts/_partials/init/index.html`
2. **typecheck** — Runs TypeScript compiler in check mode
3. **lint-staged** — Runs `eslint --fix` on staged files

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

Manages theme version string. In dev mode, generates a dev
version; in prod mode, reads from git tags. Updates
`layouts/_partials/init/index.html`:

```go-html-template
{{- hugo.Store.Set "version" "v1.0.0-alpha" -}}
```

### `packages/integration`

Post-build step that merges demo and test site outputs into
a single `public/` directory for preview/deployment.

### `packages/chroma-lexers`

Generates `assets/scss/core/maps/_chroma-lexers.scss` from
Chroma syntax highlighter source. Run via `pnpm gen:lexers`.

### `packages/encrypt`

Processes built HTML to encrypt content marked with password
protection. Run as part of `pnpm build`.

## Theme Configuration

- **hugo.toml** — Default configuration. Uses `_merge = "shallow"`
  so user configs override without deep merging.
- **theme.toml** — Theme metadata (name, license, features).
- Users override settings in their site's `hugo.toml`; the
  theme's defaults apply where not overridden.

## Directory Responsibilities

| Directory                     | Role                                  |
| ----------------------------- | ------------------------------------- |
| `assets/js/`                  | TypeScript modules, entry point, types|
| `assets/scss/`                | SCSS stylesheets (core, content, widgets)|
| `assets/css/`                 | Pre-built UnoCSS utility classes      |
| `assets/lib/`                 | Vendored third-party libraries        |
| `assets/data/`                | CDN configuration files               |
| `layouts/_partials/init/`     | Theme initialization partials         |
| `layouts/_partials/base/`     | Core layout (head, header, footer)    |
| `layouts/_partials/function/` | Helper function partials              |
| `layouts/_partials/store/`    | Asset accumulation (script/style)     |
| `layouts/_shortcodes/`        | Custom Hugo shortcodes                |
| `layouts/_markup/`            | Render hooks for markdown elements    |
