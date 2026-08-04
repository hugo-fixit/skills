# fixit-customize Generation Instructions

Generate from:

- `sources/fixit-docs/content/en/documentation/advanced/` — Style customization, appearance config
- `sources/fixit-docs/content/en/references/blocks/` — Custom partials blocks reference
- `sources/FixIt/assets/scss/_variables.scss` — SCSS variable definitions
- `sources/FixIt/assets/scss/core/_root.scss` — CSS custom properties
- `sources/FixIt/layouts/_partials/custom.html` — Custom partials injection points
- `sources/fixit-docs/config/_default/params.toml` — appearance section for real-world examples

Focus on:

- `[params.appearance]` SCSS variable override mechanism
- 15 custom partials injection points with template code
- CSS custom properties (--fi- prefix) for runtime theming
- Custom SCSS/JS file loading via `[params.library]`
- Dark/light theme switching mechanism

Skip: CSS basics, SCSS syntax tutorials.
