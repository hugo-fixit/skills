<!-- source: assets/scss/_variables.scss:1-21 -->
<!-- source: assets/scss/core/mixins/_theme-vars.scss:1-84 -->

# SCSS Variables and Mixins Reference

## Config-to-SCSS Pipeline

The pipeline converts user configuration into SCSS variables:

1. User sets values in `[params.appearance]` in `hugo.toml`
2. `layouts/_partials/function/scss-vars.html` merges user overrides with defaults
3. Hugo passes the merged dict to SCSS via `hugo:vars` (see `assets/scss/_variables.scss`)
4. SCSS variables become available throughout the stylesheet

Default values are defined in `scss-vars.html`. User values override defaults. Some
values are derived from others (e.g. `menu_active_color` defaults to `global_link_color`).

The SCSS entry point loads variables in this order:

```scss
// assets/scss/_variables.scss
@forward "core/maps";
@forward "hugo:vars";          // appearance variables from scss-vars.html
@forward "hugo:vars/internal"; // internal theme config (base URL, logo, loading image)
```

## SCSS Variable Prefix

The theme uses these prefixes for CSS custom properties:

```scss
$prefix: fi- !default;
$rootPrefix: --#{$prefix} !default;  // yields --fi-
$header-height: 3.5rem !default;
```

Always reference custom properties via the `fi-var()` function (auto-adds the `--fi-`
prefix). Never write `var(--fi-...)` by hand in theme/user SCSS.

## CSS Custom Properties

All theme variables are exposed as CSS custom properties with the `--fi-` prefix.
These enable runtime theme switching without recompiling SCSS.

**Theme-independent** (fixed values): `--fi-global-font-family`, `--fi-global-font-size`,
`--fi-global-font-weight`, `--fi-global-line-height`, `--fi-global-border-radius`,
`--fi-header-height`, `--fi-code-font-family`, `--fi-code-font-size`, `--fi-bezier`.

**Theme-dependent** (light/dark via `light-dark()`): `--fi-global-background-color`,
`--fi-global-font-color`, `--fi-global-link-color`, `--fi-global-link-hover-color`,
`--fi-global-border-color`, `--fi-header-background-color`, `--fi-menu-active-color`,
`--fi-single-link-color`, `--fi-code-color`, `--fi-code-block-background-color`,
`--fi-table-background-color`, `--fi-blockquote-color`, `--fi-selection-color`,
`--fi-scrollbar-color`.

## Theme Switching at Runtime

A few lines of context when writing theme-aware custom code:

- Site default comes from `default_theme` in `hugo.toml` (`"auto" | "light" | "dark"`).
- On first paint, `assets/js/head/color-scheme.ts` reads localStorage key `theme-mode`
  (falling back to `default_theme`) and sets `<html data-theme-mode="auto|light|dark">`
  to avoid a flash of wrong theme.
- CSS `color-scheme` follows `data-theme-mode`, so `light-dark()` variables flip with it.
- At runtime call `fixit.setThemeMode(mode, persist?)`; it updates `data-theme-mode`,
  optionally writes localStorage, and emits `fixit:switch-theme`.
- Prefer `define-theme-vars` / `light-dark()` for colors; use `light-mode`/`dark-mode`
  mixins only for non-color differences.

## Creating custom.scss

Create `assets/scss/custom.scss` in your project root. This file is loaded after the
theme's styles and has access to all mixins and variables.

```scss
// assets/scss/custom.scss

// Import external fonts
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

// Override CSS custom properties
:root {
  --fi-global-font-family: 'Inter', system-ui, sans-serif;
}

// Custom styles using theme variables
.my-custom-class {
  color: fi-var(global-link-color);
  border-radius: fi-var(global-border-radius);
}
```

## Creating custom.ts

Create `assets/js/custom.ts` (or `custom.js`) in your project root. It runs deferred at
the end of each page load. Access the public API on `window.fixit`.

```typescript
// assets/js/custom.ts
const { fixit } = window as any

class CustomScript {
  constructor() {
    this.init()
  }

  init() {
    console.log('FixIt version:', fixit.version)

    // Theme control: 'auto' | 'light' | 'dark'; 2nd arg persists to localStorage
    // fixit.setThemeMode('dark')
    // fixit.setThemeMode('auto', true)

    fixit.eventBus.on('fixit:switch-theme', ({ detail }: any) => {
      // detail: { mode: string, isDark: boolean, isChanged: boolean }
      console.log('Theme switched to:', detail.mode)
    })

    // Scroll / resize are events, not getters
    fixit.eventBus.on('fixit:scroll', () => {
      // e.g. read window.scrollY yourself and react
    })

    // Mask overlay (menu/search drawers use the same system)
    fixit.core.registerMaskOverlay('my-overlay', {
      isActive: () => false,
      onOpen: () => {},
      onClose: () => {},
    })

    // Re-initialize theme content handlers after injecting HTML.
    // Note: fixit.refresh() does NOT exist — use content.initContent().
    fixit.content.initContent()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  void new CustomScript()
})
```

Public API surface (`window.fixit`): `version`, `config`, `themeMode`, `isDark`, `isRTL`,
`setThemeMode(mode, persist?)`, modules `core` / `theme` / `code` / `toc` / `menu` /
`search` / `enc` / `pwa` / `misc` / `content` / `events`, and `eventBus` (`on`/`off`/`emit`).

## Available SCSS Mixins

### `media` -- Responsive Breakpoints

```scss
@include media('xs') { ... }           // max-width: 679.9px
@include media('sm') { ... }           // 680px - 959.9px
@include media('md') { ... }           // 960px - 1199.9px
@include media('lg') { ... }           // 1200px - 1439.9px
@include media('xl') { ... }           // min-width: 1440px
@include media('md', 'up') { ... }     // min-width: 960px
@include media('lg', 'down') { ... }   // max-width: 1439.9px
@include media('print') { ... }        // print media
@include media('reduce-motion') { ... } // prefers-reduced-motion
```

### `page-style` -- Page Width Variants

```scss
@include page-style('custom') {
  @include media('xl') {
    width: ROUND(70%, 2px);
    max-width: 1600px;
  }
  @include media('lg') {
    width: ROUND(60%, 2px);
  }
  @include media('md') {
    width: ROUND(56%, 2px);
  }
}
```

Then set `page_style = "custom"` as a page-level param (top-level under `[params]` or in
front matter) -- not under `[params.appearance]`.

### `admonition` -- Custom Admonition Types

```scss
// @param {String} $type - Admonition type name
// @param {Color} $color - Text/border color
// @param {Color} $bg - Background color
// @param {Color} $bg-collapsed - Optional collapsed background

.admonition {
  @include admonition(ban, #ff3d00, rgba(255, 61, 0, 0.1));
}
```

Register the icon in `hugo.toml` and add a default title in the language file:

```toml
[params.admonition]
ban = "fa-solid fa-ban"

[admonition]
ban = "Forbidden"
```

### `task-icon` / `task-text` -- Custom Task List Styles

```scss
li[data-task='tip'] {
  @include task-icon(#EA9E36);
  @include task-text(#9974F7);
}
```

Register the icon in `hugo.toml` (config key is snake_case `task_list`):

```toml
[params.task_list]
tip = "fa-regular fa-lightbulb"
```

Optional default title goes in the i18n language file. The i18n table is camelCase
`[taskList]` -- not `[task-list]`, and not the same key as `params.task_list`:

```toml
# i18n/en.toml (or your site's i18n override)
[taskList]
tip = "Tip"
```

### `set-fi-var` / `set-fi-vars` -- Set CSS Custom Properties

```scss
@include set-fi-var(custom-color, #ff0000);

@include set-fi-vars((
  custom-color: #ff0000,
  custom-bg: #f0f0f0,
));
```

### `light-mode` / `dark-mode` -- Theme-Specific Styles

```scss
.my-element {
  @include light-mode {
    background: #ffffff;
  }
  @include dark-mode {
    background: #1f252d;
  }
}
```

These mixins handle both explicit theme mode (`[data-theme-mode='light'|'dark']`) and
auto mode (`[data-theme-mode='auto']` with `prefers-color-scheme` media query).

### `define-theme-vars` -- Dual-Theme Color Variables

```scss
@include define-theme-vars((
  my-custom-color: (light: #333, dark: #eee),
));
```

This emits `--fi-my-custom-color: light-dark(#333, #eee)` which switches automatically
with the CSS `color-scheme` property. Prefer this over separate `light-mode`/`dark-mode`
blocks when you only need to set color values.

### Other Useful Mixins

```scss
@include border-radius();       // uses fi-var(global-border-radius)
@include border-radius(8px);    // custom value
@include link(#2376b7, #1781b5);          // themed link
@include link(#2376b7, #1781b5, underline); // with decoration
@include box-shadow();
@include bold-dark();           // bolder text in dark mode
@include sticky-top-offset();   // sticky with header offset
@include scrollbar-width();
@include overflow-wrap(break-word);
@include focus-visible-ring();  // accessibility focus ring
```
