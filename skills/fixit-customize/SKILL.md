---
name: fixit-customize
description: >
  FixIt Hugo theme customization — appearance variables (colors, fonts, sizes),
  custom partials injection (15 blocks), SCSS/CSS overrides, custom scripts,
  and theme component integration. Use when customizing FixIt theme appearance.
metadata:
  author: hugo-fixit
  version: 2026.9.24
  source: Generated from https://github.com/hugo-fixit/FixIt and https://github.com/hugo-fixit/fixit-docs
---

# FixIt Theme Customization

FixIt provides layered customization so you never edit theme source. Later layers
override earlier ones; combine them as needed.

## Customization Layers

1. **Config** -- `[params.appearance]` in `hugo.toml` for colors, fonts, sizes (converted to SCSS via `hugo:vars`). Page-level params (`page_style`, `auto_bookmark`, ...) live at the top level of `[params]`, not under `appearance`.

2. **Library** -- `[params.library.css]` / `[params.library.js]` load third-party CSS/JS from local `assets/` paths or CDN URLs. Use this before writing custom partials just to add a `<script>` tag.

3. **SCSS** -- `assets/scss/custom.scss` in your project root. Loaded after theme styles; all mixins, variables, and `--fi-*` custom properties are available.

4. **Scripts** -- `assets/js/custom.ts` (or `.js`) in your project root. Runs deferred at end of body; use the `window.fixit` public API for runtime behavior.

5. **Partials** -- `[params.custom_partials]` injects Hugo templates into 15 named blocks. Partial paths are relative to `layouts/_partials/`.

## Quick Reference: Appearance

```toml
[params.appearance]
global_font_size = "16px"
global_font_color = "#1f2328"
global_font_family = "system-ui, sans-serif"
global_link_color = "#161209"
global_border_radius = "6px"
header_background_color = "#f6f8fa"
code_font_family = "Source Code Pro, Menlo, Consolas, Monaco, monospace"
```

Color values: hex is preferred, CSS functions like `rgba(...)` are allowed, CSS named
colors (e.g. `red`) are forbidden (Hugo `isTypedCSSValue` rejects them). Dark mode
variants use the `_dark` suffix.

### Page Style (page-level, not appearance)

```toml
# hugo.toml — top-level under [params], or per-page front matter
page_style = "normal"  # narrow | normal | wide (default: "normal")
```

Read via `{{ .Param "page_style" }}`. For a custom width variant, define it with the
`page-style` SCSS mixin and set `page_style = "custom"`. See
[references/appearance.md](references/appearance.md).

## Quick Reference: Library Assets

```toml
[params.library.css]
someCSS = "css/some.css"                    # local, relative to assets/
vendorCSS = "https://cdn.example.com/x.css" # or CDN URL

[params.library.js]
someJS = "js/some.js"
vendorJS = "https://cdn.example.com/x.js"
```

Keys are unique identifiers; values are asset paths or URLs. JS loads with `defer`.

## Quick Reference: Custom Partials

```toml
[params.custom_partials]
head = []
assets = []
footer = []
profile = []
# ... 15 blocks total
```

Each key accepts an array of partial paths relative to `layouts/_partials/`.
See [references/custom-partials.md](references/custom-partials.md) for all block locations.

## Quick Reference: Custom Admonitions & Task Lists

```toml
[params.admonition]
ban = "fa-solid fa-ban"

[params.task_list]
tip = "fa-regular fa-lightbulb"
```

Note: config key is `task_list` (snake_case). The i18n title table is `[taskList]`
(camelCase) in language files -- different key, different file.

```scss
.admonition {
  @include admonition(ban, #ff3d00, rgba(255, 61, 0, 0.1));
}
li[data-task='tip'] {
  @include task-icon(#EA9E36);
  @include task-text(#9974F7);
}
```

## Quick Reference: custom.ts Public API

```typescript
const { fixit } = window as any

// Top-level: version, config, themeMode, isDark, isRTL
fixit.setThemeMode('dark')          // 'auto' | 'light' | 'dark'
fixit.setThemeMode('auto', true)    // 2nd arg persists to localStorage 'theme-mode'
fixit.content.initContent()         // re-init content (NOT fixit.refresh — that does not exist)
fixit.core.registerMaskOverlay('my-overlay', {
  isActive: () => boolean,
  onOpen: () => void,
  onClose: () => void,
})

fixit.eventBus.on('fixit:switch-theme', ({ detail }: any) => {
  // detail: { mode, isDark, isChanged }
})
```

Modules on `window.fixit`: `core`, `theme`, `code`, `toc`, `menu`, `search`, `enc`,
`pwa`, `misc`, `content`, `events`, `eventBus`. Events: `fixit:switch-theme`,
`fixit:scroll`, `fixit:resize`, `fixit:content-decrypted`, `fixit:toc-decrypted`,
`fixit:re-encrypt`, `fixit:code-tab-sync`, `fixit:sw-update`.

## Reference Files

| Topic | Description | File |
| ------- | ------------- | ------ |
| Appearance Variables | All `[params.appearance]` variables with defaults | [references/appearance.md](references/appearance.md) |
| Custom Partials | 15 injection points, config keys, locations | [references/custom-partials.md](references/custom-partials.md) |
| SCSS Variables & Mixins | Config-to-SCSS pipeline, CSS properties, mixins, theme switching | [references/scss-variables.md](references/scss-variables.md) |

## Theme Component Integration

Install a theme component (e.g. `component-projects`) as a Hugo module or Git
submodule, then inject its partial via config. TOML needs `[[module.imports]]`
(array of tables) -- one table per import:

```toml
[[module.imports]]
path = "github.com/hugo-fixit/FixIt"

[[module.imports]]
path = "github.com/hugo-fixit/component-projects"

[params.custom_partials]
assets = ["inject/component-projects.html"]
```
