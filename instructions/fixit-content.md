# fixit-content Generation Instructions

Generate from:

- `sources/fixit-docs/content/en/documentation/content-management/shortcodes/extended/` — All extended shortcodes
- `sources/fixit-docs/content/en/documentation/content-management/markdown-syntax/` — Extended markdown
- `sources/fixit-docs/content/en/documentation/content-management/front-matter/` — Front matter reference
- `sources/fixit-docs/content/en/documentation/content-management/diagrams-support/` — Mermaid, ECharts, Goat
- `sources/FixIt/layouts/_shortcodes/` — Shortcode source for parameter details
- `sources/FixIt/layouts/_markup/` — Render hook source

Focus on:

- Shortcode syntax with all parameters and examples
- Render hooks behavior and customization
- Extended markdown features (ruby, fraction, fontawesome, math)
- Front matter page-level params

Skip: Basic markdown syntax (bold, italic, headings), Hugo built-in shortcodes.

Important rules:

- Shortcode examples must use the actual shortcode syntax (`{{< >}}` / `{{% %}}`), NOT the Hugo documentation escaping syntax (`{{</* */>}}` / `{{%/* */%}}`). The skill is a reference for agents to write real content, not documentation that needs to be rendered by Hugo.
- For shortcodes that process Markdown content (like `tab`, `fixit-encryptor`), use `{{% %}}` delimiters. For all others, use `{{< >}}` delimiters.
