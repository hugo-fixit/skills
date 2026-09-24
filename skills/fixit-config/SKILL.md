---
name: fixit-config
description: >
  FixIt Hugo theme configuration — hugo.toml params, search engines,
  comment systems, analytics, PWA, CDN, and more. Use when configuring
  a FixIt site, adding features, or troubleshooting theme settings.
metadata:
  author: hugo-fixit
  version: 2026.9.24
  source: Generated from https://github.com/hugo-fixit/FixIt and https://github.com/hugo-fixit/fixit-docs
---

# FixIt Configuration Skill

FixIt is configured in the site `hugo.toml`. Theme settings live mainly under
`[params]`; markup under `[markup]`, menus under `[menu]`, plus top-level Hugo keys
(`[outputs]`, `[outputFormats]`, `[taxonomies]`, `[sitemap]`, `[privacy]`, …).
The theme ships a default `hugo.toml` (1900+ lines) that users copy into their
project root and customize.

## Configuration Structure

Use `_merge = "shallow"` to inherit theme defaults without deep-merging. This lets you
keep your site config minimal while still receiving theme updates.

```toml
# Inherit markup, outputs, and taxonomies from the theme
[markup]
_merge = "shallow"

[outputs]
_merge = "shallow"

[taxonomies]
_merge = "shallow"
```

## Common `[params]` Sections

| Section | Purpose |
| --------- | --------- |
| `[params]` | Site-level: version, description, keywords, default_theme, date_format |
| `[params.author]` | Author name, email, link, avatar |
| `[params.header]` | Header mode, title, subtitle, blur |
| `[params.footer]` | Footer content, copyright, powered-by, site_time |
| `[params.home]` | Home page profile and posts section |
| `[params.search]` / `[params.cse]` | Search engine (fuse, algolia, pagefind, cse) |
| `[params.comment]` | Comment systems (Giscus, Waline, Twikoo, Disqus, Facebook, Telegram, etc.) |
| `[params.analytics]` | Google, Fathom, Baidu, Umami, Plausible, Cloudflare |
| `[params.social]` | 80+ social link platforms |
| `[params.codeblock]` | Code block wrapper, mode, copy, fullscreen, edit |
| `[params.math]` | KaTeX or MathJax rendering |
| `[params.reward]` | Donate/sponsor QR codes |
| `[params.share]` | Social share buttons on posts |
| `[params.app]` | PWA configuration |
| `[params.cdn]` | CDN for third-party libraries |
| `[params.appearance]` | SCSS variable overrides (colors, fonts, spacing) |

## Reference Files

| Topic | Description | Reference |
| ------- | ------------- | ----------- |
| Params Basics | Site-level params, author, page-level, date, image, search, links | [params-basics.md](references/params-basics.md) |
| Params Advanced | Codeblock, math, mermaid, mapbox, encryption, watermark, AI, custom partials, library, feed/print/typeit | [params-advanced.md](references/params-advanced.md) |
| Markup Config | Goldmark, Chroma, render hooks, output formats, taxonomies | [markup-config.md](references/markup-config.md) |
| Social & Comments | Social links, comment systems, share, reward, analytics | [social-comments.md](references/social-comments.md) |

## Minimal Working hugo.toml

```toml
baseURL = "https://example.com/"
defaultContentLanguage = "en"
title = "My FixIt Site"
theme = [ "FixIt" ]

[params]
version = "1.0.X"
description = "A site built with FixIt theme"
default_theme = "auto"
date_format = "2006-01-02"

[params.author]
name = "Your Name"
email = "you@example.com"
link = "https://example.com"

[params.header]
desktop_mode = "sticky"

[params.home]

[params.home.posts]
enable = true
paginate = 6

[params.search]
enable = true
type = "fuse"

[markup]
_merge = "shallow"

[outputs]
_merge = "shallow"

[taxonomies]
_merge = "shallow"
```
