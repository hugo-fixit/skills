# Hugo Templates

<!-- source: FixIt layouts/, fixit-docs references/partials -->

FixIt's template layer lives in `layouts/` and follows
Hugo's template hierarchy.

## Template Hierarchy

```
layouts/
  _default/
    baseof.html          # Base template — orchestrates all partials
    single.html          # Single page template
    list.html            # List page template
  _partials/
    init/                # Theme initialization
    base/                # Core layout (head, header, footer, assets)
    function/            # Helper functions
    store/               # Asset accumulation
    plugin/              # Third-party integrations
    single/              # Page-specific partials
  _shortcodes/           # 31 custom shortcodes
  _markup/               # 15 render hooks
```

## Init Partials (init/)

Called from `baseof.html` before any content rendering.

**init/index.html** — Entry point. Sets version and
orchestrates init sub-partials:

```go-html-template
{{- hugo.Store.Set "version" "v1.0.0-alpha" -}}
{{- .Store.Set "this" dict -}}

{{- partial "init/detection-env.html" . -}}
{{- partial "init/detection-version.html" . -}}
{{- partial "init/detection-deprecated.html" . -}}
{{- partial "init/detection-pagefind.html" . -}}
{{- partial "init/detection-encryption.html" . -}}
{{- partial "init/global.html" . -}}
{{- partial "init/compatibility.html" . -}}
```

| Partial                    | Responsibility                          |
| -------------------------- | --------------------------------------- |
| `detection-env.html`       | Detect Hugo environment                 |
| `detection-version.html`   | Check Hugo version compatibility        |
| `detection-deprecated.html`| Warn about deprecated config params     |
| `detection-pagefind.html`  | Check Pagefind index availability       |
| `detection-encryption.html`| Warn about encryption config issues     |
| `global.html`              | Global setup (CDN, fingerprints, lang)  |
| `compatibility.html`       | Browser compatibility checks            |

## Base Partials (base/)

Core layout components.

**base/assets.html** — Asset orchestration hub. This is the
most important partial for understanding the asset pipeline.
It:

1. Collects feature flags and page/site params
2. Registers required CSS/JS resources through
   `store/style.html` and `store/script.html`
3. Resolves optional third-party libraries based on config
4. Builds per-page runtime config and emits `window.config`
5. Registers core bundles (file-tree, mermaid, main JS)
6. Appends page-injected style/script arrays and analytics

```go-html-template
{{- /* Example: registering a script */ -}}
{{- dict "Source" "js/lib/echarts.ts" "Build" true
   "Fingerprint" $fingerprint "Defer" true
   | dict "Page" . "Data" | partial "store/script.html" -}}

{{- /* Example: registering a style */ -}}
{{- dict "Source" "lib/lightgallery/css/lightgallery-bundle.min.css"
   "Fingerprint" $fingerprint
   | dict "Page" . "Data" | partial "store/style.html" -}}
```

## Function Partials (function/)

Helper functions used across templates.

### param.html

Retrieves page-level section params with shorthand support
and site defaults merging. Handles boolean shorthand in
front matter (e.g., `toc: true`) by wrapping in a dict with
an "enable" key.

```go-html-template
{{- /* Basic usage */ -}}
{{- $toc := dict "Page" . "Key" "toc"
   | partial "function/param.html" -}}

{{- /* With camelCase key conversion */ -}}
{{- $config := dict "Page" . "Key" "math" "ToCamel" true
   | partial "function/param.html" -}}
```

### js-build.html

Wraps Hugo's `js.Build` with minify-in-production defaults.
Handles TypeScript compilation and config injection.

### camel-case-keys.html

Converts dict keys from snake_case to camelCase (used for
TypeScript config injection).

## Store Pattern (store/)

The store partials accumulate page-level assets that are
rendered together at the end of the page.

**store/script.html** — Appends a script entry to the
page's script list:

```go-html-template
{{- /*
  Usage: dict "Page" . "Data" <script-config>
    | partial "store/script.html"

  Script config fields:
    Source      - URL or asset path
    Build       - If true, process with js.Build
    Fingerprint - If true, add content hash
    Defer       - If true, add defer attribute
    Async       - If true, add async attribute
    Attr        - Additional HTML attributes
    Minify      - If true, minify output
    Content     - Inline script content
    Path        - Target path for inline content
*/ -}}
```

**store/style.html** — Same pattern for CSS assets.

The accumulated assets are rendered in `base/assets.html`:

```go-html-template
{{- range (.Store.Get "this").style -}}
  {{- partial "plugin/style.html" . -}}
{{- end -}}

{{- range (.Store.Get "this").script -}}
  {{- partial "plugin/script.html" . -}}
{{- end -}}
```

## Custom Partials System

The theme defines 15 `{{ define }}` blocks in custom partials
that users can override:

```go-html-template
{{- block "custom-assets" . }}{{ end -}}
{{- block "custom-head" . }}{{ end -}}
{{- block "custom-header" . }}{{ end -}}
{{- block "custom-footer" . }}{{ end -}}
{{- block "custom-widgets" . }}{{ end -}}
{{- /* ... and more */ -}}
```

Users override these by creating matching templates in their
site's `layouts/` directory.

## Shortcodes (_shortcodes/)

31 custom shortcodes. Key examples:

| Shortcode  | Purpose                                |
| ---------- | -------------------------------------- |
| `admonition` | Styled callout boxes                 |
| `aplayer`  | Music player (APlayer + MetingJS)      |
| `echarts`  | ECharts chart rendering                |
| `mermaid`  | Mermaid diagram rendering              |
| `tabs`     | Tabbed content containers              |
| `timeline` | Timeline component                     |
| `file-tree`| File/directory tree visualization      |
| `mapbox`   | Mapbox GL map                          |
| `image`    | Enhanced image with lazy loading       |
| `raw`      | Raw HTML passthrough                   |

## Render Hooks (_markup/)

15 render hooks that override Hugo's default markdown
rendering:

| Hook               | Element      | Enhancements                    |
| ------------------ | ------------ | ------------------------------- |
| `codeblock`        | Code blocks  | Syntax highlighting, line nos   |
| `heading`          | Headings     | Anchor links, heading IDs       |
| `image`            | Images       | Lazy loading, lightgallery      |
| `link`             | Links        | External link detection, icon   |
| `table`            | Tables       | Responsive wrapper, alignment   |
| `blockquote`       | Blockquotes  | Alert styling                   |
| `passthrough-block`| Math blocks  | MathJax/KaTeX passthrough       |
| `passthrough-inline`| Inline math | MathJax/KaTeX passthrough       |

## Coding Standards

### Variable Naming

Use camelCase for all template variables:

```go-html-template
{{- $footerConfig := .Site.Params.footer -}}
{{- $fingerprint := .Site.Store.Get "fingerprint" -}}
{{- $uniqueFileId := .File.UniqueID -}}
```

### Whitespace Control

Always use trim markers to avoid extra whitespace:

```go-html-template
{{- if .Site.Params.enable -}}
  {{- partial "my-partial.html" . -}}
{{- end -}}
```

### Translation

Use the `T` function for all user-facing strings:

```go-html-template
{{- T "header.switchTheme" -}}
{{- T "assets.searchPlaceholder" -}}
```

### partialCached

Use `partialCached` for expensive partials that produce the
same output across pages:

```go-html-template
{{- partialCached "function/get-author-map.html" .Params.author -}}
```

### .Site.Store

Use `.Site.Store` for shared computed values that should be
computed once:

```go-html-template
{{- $fingerprint := .Site.Store.Get "fingerprint" -}}
{{- $cdn := .Site.Store.Get "cdn" -}}
```

### hugo.IsProduction

Gate analytics and minification behind production checks:

```go-html-template
{{- if hugo.IsProduction -}}
  {{- partial "plugin/analytics.html" . -}}
{{- end -}}
```

### ID Attribute Usage

Minimize `id` attributes. Prefer class selectors.
Reserve `id` for:

- `<label for="...">` associations
- `aria-controls` / `aria-labelledby`
- Fragment anchors (`#section-name`)
- Third-party library requirements
