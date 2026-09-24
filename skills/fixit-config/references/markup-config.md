<!-- source: fixit-docs documentation/getting-started/configuration/introduction -->

# Markup Configuration

Goldmark, Chroma syntax highlighting, render hooks, output formats, and taxonomies.

## Goldmark (Markdown)

Extended syntax lives under `[markup.goldmark.extensions.extras]`, each with its own
`enable` key (Hugo >= 0.128). Top-level extension flags (`strikethrough`, `table`, …)
stay under `[markup.goldmark.extensions]`.

```toml
[markup.goldmark.extensions]
# GFM ~~strikethrough~~ — FixIt disables it so extras `delete` is the primary delete syntax
strikethrough = false
typographer = true

[markup.goldmark.extensions.extras.delete]
enable = true

[markup.goldmark.extensions.extras.insert]
enable = true

[markup.goldmark.extensions.extras.mark]
enable = true

[markup.goldmark.extensions.extras.subscript]
enable = true

[markup.goldmark.extensions.extras.superscript]
enable = true

[markup.goldmark.parser.attribute]
block = true
title = true

[markup.goldmark.renderer]
# Allow raw HTML in Markdown (required for many FixIt shortcodes/partials)
unsafe = true
```

Why: `strikethrough` and `delete` are different extensions. Keep `strikethrough = false`
when relying on extras `delete` (`--text--`). Put `unsafe` under `[markup.goldmark.renderer]`,
not `[markup.goldmark.parser]`.

## Passthrough for Math

Enable math delimiters so KaTeX/MathJax can process inline and block math. Use literal
TOML strings so backslashes survive. Order matters only for matching preference —
prefer the escaped-delim pairs first as in the theme default.

```toml
[markup.goldmark.extensions.passthrough]
enable = true

[markup.goldmark.extensions.passthrough.delimiters]
block = [['\[', '\]'], ['$$', '$$']]
inline = [['\(', '\)'], ['$', '$']]
```

## Chroma Syntax Highlighting

FixIt requires these Chroma settings for the code block wrapper and theme switching.

```toml
[markup.highlight]
codeFences = true
# Use CSS classes instead of inline styles (required for light/dark themes)
noClasses = false
anchorLineNos = false
guessSyntax = true
lineNos = true
lineNumbersInTable = true
```

Why: `noClasses = false` lets FixIt SCSS own syntax colors. `lineNumbersInTable`
gives correct copy behavior. Do not use `lineNosInTable` / `tabWidth` — they are not
valid `[markup.highlight]` keys.

## Render Hooks

Built-in (override by placing files in `layouts/_markup/`):

- **Code blocks** -- wrapper with copy, fullscreen, edit buttons
- **Headings** -- anchor links, numbering, copy-to-clipboard
- **Images** -- lightgallery, lazy loading
- **Links** -- external icon, link guard
- **Tables** -- responsive wrapper
- **Blockquotes** -- alert callouts (note, tip, warning, danger)
- **Passthrough** -- math delimiters for KaTeX/MathJax

No config needed unless you override them.

## Output Formats

Theme custom formats. Prefer `_merge = "shallow"` and only override what you need.
Special formats use `notAlternative = true` so they stay out of alternate links
(archives, offline, link, readme, baidu_urls, llms).

```toml
[outputFormats]

[outputFormats.archives]
path = "archives"
baseName = "index"
mediaType = "text/html"
isPlainText = false
isHTML = true
permalinkable = true
notAlternative = true

[outputFormats.offline]
path = "offline"
baseName = "index"
mediaType = "text/html"
isPlainText = false
isHTML = true
permalinkable = true
notAlternative = true

[outputFormats.link]
path = "link"
baseName = "index"
mediaType = "text/html"
isPlainText = false
isHTML = true
permalinkable = true
notAlternative = true

# PWA manifest — baseName is "site" (emits site.webmanifest)
[outputFormats.manifest]
baseName = "site"
mediaType = "application/manifest+json"
rel = "manifest"
isPlainText = true
isHTML = false

[outputFormats.search]
baseName = "search"
mediaType = "application/json"
rel = "search"
isPlainText = true
isHTML = false
permalinkable = true

# AI-friendly llms.txt — add "llms" to home outputs to enable
[outputFormats.llms]
baseName = "llms"
mediaType = "text/plain"
isPlainText = true
isHTML = false
notAlternative = true

# Optional extras (also notAlternative = true):
# [outputFormats.readme]   baseName = "readme"     mediaType = "text/markdown"
# [outputFormats.baidu_urls] baseName = "baidu_urls" mediaType = "text/plain"
```

```toml
[outputs]
home = ["html", "rss", "archives", "search", "offline", "manifest", "link"]
page = ["html", "markdown"]
section = ["html", "rss"]
taxonomy = ["html"]
term = ["html", "rss"]
```

Or inherit from the theme:

```toml
[outputs]
_merge = "shallow"
```

## Taxonomies

Three built-ins: categories, tags, collections.

```toml
[taxonomies]
category = "categories"
tag = "tags"
collection = "collections"
```

Or inherit:

```toml
[taxonomies]
_merge = "shallow"
```

Front matter:

```yaml
---
tags: ["Hugo", "Tutorial"]
categories: ["Documentation"]
collections: ["Getting Started"]
---
```

## Taxonomy Icons

Override icons for taxonomy title, card, and term title slots. Requires `[taxonomies]`.

```toml
[params.taxonomy_icons]
# Syntax: <taxonomy> = [<title icon>, <card icon>, <term title icon>]
category = [
  "fa-solid fa-folder-tree",
  "fa-regular fa-folder",
  "fa-regular fa-folder-open"
]
```

## Table Configuration

Tables are built in. Responsive wrapper is automatic; numbering/sorting are theme params.

```toml
[params.table]
number = false  # auto table numbering
sort = true     # clickable column sort
```

## Goldmark Extensions Checklist

| Extension | Config key | Syntax | Example |
| --------- | ---------- | ------ | ------- |
| Strikethrough (GFM) | `extensions.strikethrough` | `~~text~~` | FixIt default is **off** |
| Delete (extras) | `extensions.extras.delete` | `--text--` | --deleted-- |
| Insert (extras) | `extensions.extras.insert` | `++text++` | ++inserted++ |
| Mark (extras) | `extensions.extras.mark` | `==text==` | ==highlighted== |
| Subscript (extras) | `extensions.extras.subscript` | `H~2~O` | H~2~O |
| Superscript (extras) | `extensions.extras.superscript` | `X^2^` | X^2^ |
