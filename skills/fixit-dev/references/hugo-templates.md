# Hugo Templates

<!-- source: FixIt layouts/, fixit-docs references/partials -->

FixIt's template layer lives in `layouts/` and follows Hugo's template
hierarchy. There is **no** `layouts/_default/` — page templates sit at
the `layouts/` root.

## Template Hierarchy

```
layouts/
  baseof.html            # Base template — orchestrates all partials
  page.html              # Single page template
  page.md                # Markdown output for single pages
  section.html           # Section list template
  summary.html           # Internal summary/partial page
  home.html              # Home page
  home.archives.html     # Archives page
  home.link.html         # Friends/links page (also friends.html)
  home.search.json       # Search index output
  home.llms.txt          # LLM-readable site summary
  home.readme.md         # README output
  home.offline.html      # PWA offline page
  home.manifest.webmanifest
  home.rss.xml / home.baidu_urls.txt
  search.html            # Search page
  tags.html / taxonomies.html / taxonomy.html / term.html
  term.rss.xml / section.rss.xml
  404.html / robots.txt / sitemap.xml
  posts/
    single.html          # Blog post single template
  _partials/
    init/                # Theme initialization
    base/                # Core layout (head/, header, footer, assets)
    base/head/           # Head partials (css, pagefind-metadata, twitter-cards)
    function/            # Helper functions
    gen/                 # Generated script content (config, mermaid-bootstrap)
    store/               # Asset accumulation
    plugin/              # Third-party integrations
    single/              # Page-specific partials
    home/                # Home page partials (profile)
    feed/                # RSS feed partials
    section/             # Section partials (recently-updated)
    _debug/              # Debug helpers (dump, template-call-stack)
  _shortcodes/           # 29 custom shortcodes
  _markup/               # 14 render hooks
```

## Init Partials (init/)

Called from `baseof.html` before any content rendering.

**init/index.html** — Entry point. Sets version and orchestrates
init sub-partials:

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

| Partial                     | Responsibility                         |
| --------------------------- | -------------------------------------- |
| `detection-env.html`        | Detect Hugo environment                |
| `detection-version.html`    | Check Hugo version compatibility       |
| `detection-deprecated.html` | Warn about deprecated config params    |
| `detection-pagefind.html`   | Check Pagefind index availability      |
| `detection-encryption.html` | Warn about encryption config issues    |
| `global.html`               | Global setup (CDN, fingerprints, lang) |
| `compatibility.html`        | Browser compatibility checks           |

## Base Partials (base/)

Core layout components: `assets.html`, `breadcrumb.html`, `comment.html`,
`footer.html`, `header.html`, `paginator.html`, `widgets.html`, plus
`base/head/` (`index.html`, `css.html`, `pagefind-metadata.html`,
`twitter-cards.html`).

**base/assets.html** — Asset orchestration hub. This is the most
important partial for understanding the asset pipeline. It:

1. Collects feature flags and page/site params
2. Registers required CSS/JS resources through
   `store/style.html` and `store/script.html`
3. Resolves optional third-party libraries based on config
4. Builds per-page runtime config and emits `window.config`
5. Registers core bundles (file-tree, mermaid, main JS)
6. Appends page-injected style/script arrays and analytics

```go-html-template
{{- /* Register a built JS wrapper */ -}}
{{- dict "Source" "js/lib/echarts.ts" "Build" true
   "Fingerprint" $fingerprint "Defer" true
   | dict "Page" . "Data" | partial "store/script.html" -}}

{{- /* Register a style */ -}}
{{- dict "Source" "lib/lightgallery/css/lightgallery-bundle.min.css"
   "Fingerprint" $fingerprint
   | dict "Page" . "Data" | partial "store/style.html" -}}
```

## Function Partials (function/)

Helper functions used across templates. Highlights:

### param.html

Retrieves page-level section params with shorthand support and site
defaults merging. Handles boolean shorthand in front matter
(e.g., `toc: true`) by wrapping in a dict with an `enable` key.

```go-html-template
{{- $toc := dict "Page" . "Key" "toc"
   | partial "function/param.html" -}}

{{- $config := dict "Page" . "Key" "math" "ToCamel" true
   | partial "function/param.html" -}}
```

### js-build.html

Wraps Hugo's `js.Build` with minify-in-production defaults. Accepts
`Resource` / `Build` / `Minify` / `Fingerprint` and returns the
processed resource. See
[Asset Pipeline](asset-pipeline.md#js-buildhtml-partial).

### camel-case-keys.html

Converts dict keys from snake_case to camelCase (used for TypeScript
config injection).

## Gen Partials (gen/)

Generated script content:

- **gen/config.html** — Serializes the page config dict to
  `window.config=<JSON>;` (plus a `console.log` in server mode).
- **gen/mermaid-bootstrap.html** — Mermaid module bootstrap script.

## Store Pattern (store/)

The store partials accumulate page-level assets that are rendered
together at the end of the page.

**store/script.html** — Appends a script entry (`.Data`) to the page's
script list:

```go-html-template
{{- /*
  Usage: dict "Page" . "Data" <script-config>
    | partial "store/script.html"

  script-config (consumed by plugin/script.html):
    Source      - URL or asset path (or raw "<script..." HTML)
    Resource    - Pre-built resource (skips build pipeline)
    Content     - Inline script content (needs Path)
    Path        - Target path for Content
    Template    - ExecuteAsTemplate path (with Context)
    Build       - true | dict of js.Build options
    Minify      - Minify output (typically hugo.IsProduction)
    Fingerprint - Fingerprint algorithm (e.g. "sha256")
    Defer / Async / Crossorigin / Integrity / Attr
*/ -}}
```

**store/style.html** — Same pattern for CSS assets.

The accumulated assets are rendered in `base/assets.html` via
`plugin/style.html` and `plugin/script.html`:

```go-html-template
{{- range (.Store.Get "this").style -}}
  {{- partial "plugin/style.html" . -}}
{{- end -}}

{{- range (.Store.Get "this").script -}}
  {{- partial "plugin/script.html" . -}}
{{- end -}}
```

## Custom Partials System

The theme defines 15 `{{ define }}` blocks in `custom.html` that users
can override by creating matching templates in their site's `layouts/`:

```go-html-template
{{- define "custom-head" -}}{{- end -}}
{{- define "custom-menu:desktop" -}}{{- end -}}
{{- define "custom-menu:mobile" -}}{{- end -}}
{{- define "custom-profile" -}}{{- end -}}
{{- define "custom-aside" -}}{{- end -}}
{{- define "custom-comment" -}}{{- end -}}
{{- define "custom-footer" -}}{{- end -}}
{{- define "custom-widgets" -}}{{- end -}}
{{- define "custom-assets" -}}{{- end -}}
{{- define "custom-post__toc:before" -}}{{- end -}}
{{- define "custom-post__toc:after" -}}{{- end -}}
{{- define "custom-post__content:before" -}}{{- end -}}
{{- define "custom-post__content:after" -}}{{- end -}}
{{- define "custom-post__footer:before" -}}{{- end -}}
{{- define "custom-post__footer:after" -}}{{- end -}}
```

## Shortcodes (_shortcodes/)

29 custom shortcodes (`.html`):

| Shortcode              | Purpose                            |
| ---------------------- | ---------------------------------- |
| `admonition`           | Styled callout boxes               |
| `aplayer` / `music`    | Music player (APlayer + MetingJS)  |
| `audio`                | Audio embed                        |
| `auto-dark`            | Auto dark-mode image swap          |
| `bilibili` / `douyin` / `bluesky` / `spotify` | Platform embeds |
| `center-quote`         | Centered quote                     |
| `details`              | Collapsible details                |
| `echarts`              | ECharts chart rendering            |
| `env`                  | Environment-conditional content    |
| `file-tree`            | File/directory tree visualization  |
| `fixit-encryptor`      | Encrypted content block            |
| `gist`                 | GitHub Gist embed                  |
| `image`                | Enhanced image with lazy loading   |
| `link`                 | Enhanced link card                 |
| `mapbox`               | Mapbox GL map                      |
| `mermaid`              | Mermaid diagram rendering          |
| `raw`                  | Raw HTML passthrough               |
| `reward`               | Reward/tip widget                  |
| `script`               | Inline/external script             |
| `style`                | Inline style                       |
| `tab` / `tabs`         | Tabbed content containers          |
| `timeline`             | Timeline component                 |
| `typeit`               | Typing animation (TypeIt)          |
| `version`              | Version badge                      |

(Plus output variants `echarts.xml`, `mermaid.xml`,
`fixit-encryptor.search.json` — not counted as shortcodes.)

## Render Hooks (_markup/)

14 render hooks that override Hugo's default markdown rendering:

| Hook                          | Element       | Enhancements                  |
| ----------------------------- | ------------- | ----------------------------- |
| `render-codeblock.html`       | Code blocks   | Syntax highlighting, line nos |
| `render-codeblock-echarts`    | ```echarts    | Chart rendering               |
| `render-codeblock-file-tree`  | ```file-tree  | File tree component           |
| `render-codeblock-fixit`      | ```fixit      | FixIt custom block            |
| `render-codeblock-json`       | ```json       | JSON viewer                   |
| `render-codeblock-mermaid`    | ```mermaid    | Diagram rendering             |
| `render-codeblock-timeline`   | ```timeline   | Timeline component            |
| `render-codeblock-toggle`     | ```toggle     | Toggleable code block         |
| `render-heading.html`         | Headings      | Anchor links, heading IDs     |
| `render-image.html`           | Images        | Lazy loading, lightgallery    |
| `render-link.html`            | Links         | External link detection, icon |
| `render-table.html`           | Tables        | Responsive wrapper, alignment |
| `render-blockquote-alert.html`| Blockquotes   | Alert styling                 |
| `render-passthrough.html`     | Math (block/inline) | MathJax/KaTeX passthrough |

(Plus output variants `render-codeblock.xml`, `render-codeblock.search.json`,
`render-heading.search.json` — not counted as hooks.)

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

Use `partialCached` for expensive partials that produce the same
output across pages:

```go-html-template
{{- partialCached "function/get-author-map.html" .Params.author -}}
```

### .Site.Store

Use `.Site.Store` for shared computed values that should be computed
once:

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

Minimize `id` attributes. Prefer class selectors. Reserve `id` for:

- `<label for="...">` associations
- `aria-controls` / `aria-labelledby`
- Fragment anchors (`#section-name`)
- Third-party library requirements
