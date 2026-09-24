<!-- source: fixit-docs documentation/getting-started/configuration/params -->

# Params Advanced

Code blocks, math rendering, diagrams, maps, encryption, watermark, visitor counters,
heading numbering, AI features, and more.

## Code Block

The code block wrapper adds copy, fullscreen, download, and edit buttons to fenced code blocks.
Override per-block via Markdown attributes: `` ```lang {mode="mac", max_shown_lines=5} ``

```toml
[params.codeblock]
wrapper = true
# "classic" (header bar), "mac" (macOS style), "simple"
mode = "classic"
wrapper_class = ""
# Lines shown before "show more" kicks in
max_shown_lines = 10
# Shadow effect: "always", "hover", "never"
shadow = "never"
copyable = true
downloadable = false  # classic mode only
fullscreen = false    # classic mode only
line_nos_toggler = true
line_wrap_toggler = true
# Experimental inline editing
editable = false
```

## Math Rendering

Choose KaTeX (faster, server-side) or MathJax (more features, client-side).

```toml
[params.math]
enable = true
type = "katex"  # or "mathjax"

[params.math.katex]
copy_tex = true
throw_on_error = false
error_color = "#ff4949"

[params.math.katex.macros]
# Custom macro: usage $\f{a}{b}$
"\\f" = "#1f(#2)"
```

MathJax configuration (use when `type = "mathjax"`):

```toml
[params.math.mathjax]
cdn = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"

[params.math.mathjax.macros]
bold = ["{\\bf #1}", 1]

[params.math.mathjax.loader]
load = ["ui/safe"]

[params.math.mathjax.options]
enable_menu = true
```

Enable math per-page via front matter:

```yaml
---
math:
  enable: true
---
```

## Mermaid Diagrams

```toml
[params.mermaid]
wrapper = true
cdn = "https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs"
# Enable ZenUML support (set CDN URL or leave empty)
zenuml = ""
themes = ["default", "dark"]
security_level = "loose"
# "classic" or "handDrawn"
look = "handDrawn"
font_family = ""
# ELK layout engine (optional; enables extra layout values)
layout_loaders = []
layout = "dagre"
```

```markdown
{{< mermaid >}}
graph LR
    A[Start] --> B[End]
{{< /mermaid >}}
```

## Mapbox GL JS

```toml
[params.mapbox]
access_token = "your-mapbox-access-token"
light_style = "mapbox://styles/mapbox/light-v11"
dark_style = "mapbox://styles/mapbox/dark-v11"
navigation = true
geolocate = true
scale = true
fullscreen = true
```

Use the `mapbox` shortcode in content.

## Encryption

Page encryption uses front matter (`password` required, `message` optional). Partial
encryption uses the `fixit-encryptor` shortcode (not `encryption`).

```yaml
---
title: "Encrypted Post"
password: "my-secret-password"
message: "Password is required"  # optional unlock prompt
---
```

Wrap partial content to encrypt:

```markdown
{{% fixit-encryptor "my-secret-password" "Password is required" %}}
This content is encrypted.
{{% /fixit-encryptor %}}

{{% fixit-encryptor password="my-secret-password" message="Password is required" %}}
Named-params form.
{{% /fixit-encryptor %}}
```

Use the `{{% %}}` delimiter so inner Markdown renders before encryption. Supports nesting.

## Watermark

Overlay a text watermark on the entire page.

```toml
[params.watermark]
enable = true
content = "Confidential"
opacity = 0.1
width = 150
height = 20
row_spacing = 60
col_spacing = 30
rotate = 15
font_size = 0.85
font_family = "inherit"
```

## Busuanzi Visitor Counter

```toml
[params.busuanzi]
enable = true
source = "https://vercount.one/js"
site_views = true
page_views = true
```

## Heading Numbering

Auto-number headings (e.g., "2.1 Section Title"). Requires `params.toc.ordered = true`.

```toml
[params.toc]
ordered = true

[params.heading]
capitalize = false

[params.heading.number]
enable = true
only_main_section = true

[params.heading.number.format]
h1 = "{title}"
h2 = "{h2} {title}"
h3 = "{h2}.{h3} {title}"
h4 = "{h2}.{h3}.{h4} {title}"
h5 = "{h2}.{h3}.{h4}.{h5} {title}"
h6 = "{h2}.{h3}.{h4}.{h5}.{h6} {title}"
```

## Table of Contents

```toml
[params.toc]
enable = true
# Keep static TOC in front of post (in addition to sidebar)
keep_static = false
# Auto-collapse sidebar TOC
auto = true
position = "end"  # "start" or "end" — logical side in the aside layout
ordered = false
start_level = 2
end_level = 6
# Decrease H1 to H2 in content
decrease_h1 = false
```

Why `start`/`end`: values map to CSS logical properties (RTL-safe), not physical left/right.

## PostChat AI

AI-powered chatbot based on your site content.

```toml
[params.post_chat]
enable = true
key = "your-postchat-key"
# "iframe" (popup) or "magic" (floating button)
user_mode = "iframe"
add_button = true
default_input = false
upload_web = true
show_invite_link = true
hot_words = true
user_title = ""
user_desc = ""
user_icon = ""          # magic mode only
black_dom = []          # DOM to black out while chat is open, e.g. [".aplayer"]
frame_width = "375px"   # iframe mode only
frame_height = "600px"  # iframe mode only
default_chat_questions = ["What topics do you cover?"]
default_search_questions = []
# Floating button position/size (optional empty = library default)
left = ""
bottom = ""
width = ""
height = ""
fill = ""
background_color = ""
```

## Post Summary AI

AI-generated summaries at the top of posts.

```toml
[params.post_summary]
enable = true
key = "your-key"  # Uses post_chat.key if not set
title = "AI Summary"
theme = ""  # "", "simple", "yanzhi", "menghuan"
post_url = ""   # Override the page URL sent to the AI service
blacklist = ""  # Comma-separated path prefixes to skip summaries
word_limit = 1000
typing_animate = true
beginning_text = ""
loading_text = true
```

## Appearance (SCSS Overrides)

Override theme colors and fonts. Values must be hex format (e.g., `"#ff0000"`),
not CSS named colors. Empty string = theme default.

```toml
[params.appearance]
global_font_family = ""
global_font_size = ""
global_line_height = ""
global_border_radius = ""
global_background_color = ""
global_font_color = ""
global_link_color = ""
global_link_hover_color = ""
header_background_color = ""
header_title_font_size = ""
code_font_family = ""
code_background_color = ""
# Dark mode variants
global_background_color_dark = ""
global_font_color_dark = ""
global_link_color_dark = ""
```

See hugo.toml `[params.appearance]` for the full key list (scrollbar, selection, tag cloud, table, reward, pagination, code, github_corner, …).

## Reading Progress Bar

```toml
[params.reading_progress]
enable = true
start = "start"  # "start" or "end" — which edge the fill starts from (RTL-safe)
position = "top"  # "top" or "bottom"
reversed = false
height = "2px"
# Custom colors (empty = theme default)
light = ""
dark = ""
```

## Pace Loading Bar

```toml
[params.pace]
enable = true
color = "blue"  # black, blue, green, orange, pink, purple, red, silver, white, yellow
theme = "minimal"
```

## Custom Partials

Inject custom templates at open custom blocks. Partials live in `layouts/_partials/`.
All keys are string arrays.

```toml
[params.custom_partials]
head = []
menu_desktop = []
menu_mobile = []
profile = []
aside = []
comment = []
footer = []
widgets = []
assets = []
post_toc_before = []
post_toc_after = []
post_content_before = []
post_content_after = []
post_footer_before = []
post_footer_after = []
```

Example: `head = ["custom/head.html"]` loads `layouts/_partials/custom/head.html`.

## Third-Party Library Assets

Load extra CSS/JS from local `assets/` or a remote URL. Key = unique id.

```toml
[params.library.css]
someCSS = "css/some.css"                      # local asset
otherCSS = "https://cdn.example.com/some.css" # remote

[params.library.js]
someJS = "js/some.js"
otherJS = "https://cdn.example.com/some.js"
```

## Feed

```toml
[params.feed]
limit = 10       # -1 = all posts
full_text = true
[params.feed.follow]  # follow.is site challenge
feed_id = ""
user_id = ""
```

Section/term feeds override via `[params.section.feed]` / `[params.list.feed]` (`limit`, `full_text`).

## Print

Expand collapsed UI before printing:

```toml
[params.print]
expand_admonition = true
expand_code = true
expand_details = true
expand_file_tree = false
```

## TypeIt

Defaults for typeit shortcode / animated titles:

```toml
[params.typeit]
speed = 100
cursor_speed = 1000
cursor_char = "|"
duration = -1  # -1 = cursor stays
loop = false
```

## Tag Cloud / Recently Updated

```toml
[params.tag_cloud]
enable = false
min = 14
max = 32
peak_count = 10
orderby = "name"  # "name" or "count"

[params.recently_updated]
archives = true
section = true
list = true
days = 30
max_count = 10
```

## Back to Top / GitHub Corner / Compatibility

```toml
[params.back_to_top]
enable = true
scrollpercent = false

[params.github_corner]
enable = false
permalink = "https://github.com/hugo-fixit/FixIt"
title = "View source on GitHub"
position = "end"  # "start" or "end"

[params.compatibility]
polyfill = false   # Polyfill.io for older browsers
object_fit = false # object-fit-images for older browsers
```
