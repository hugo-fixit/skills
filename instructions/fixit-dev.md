# fixit-dev Generation Instructions

Generate from:

- `sources/FixIt/CLAUDE.md` — Architecture overview, coding standards, dev commands
- `sources/FixIt/assets/js/` — TypeScript modules, types, event bus, public API
- `sources/FixIt/layouts/` — Template structure, partials, shortcodes, render hooks
- `sources/FixIt/packages/` — Monorepo workspace packages
- `sources/FixIt/package.json` — Scripts, dependencies
- `sources/fixit-docs/content/en/contributing/` — Contribution guide
- `sources/fixit-docs/content/en/ecosystem/dev-component/` — Component development

Focus on:

- Monorepo structure and package responsibilities
- TypeScript module architecture (service interfaces, constructor injection, eventBus)
- Hugo template organization (partials hierarchy, store pattern, param.html)
- Asset pipeline (Hugo Pipes, @params injection, UnoCSS)
- Coding standards (SCSS BEM, ES6 #private, Conventional Commits)
- How to add new features (shortcodes, modules, render hooks)

Skip: Hugo basics, what TypeScript is, git basics.
