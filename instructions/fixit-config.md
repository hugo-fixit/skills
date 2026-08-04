# fixit-config Generation Instructions

Generate from:

- `sources/fixit-docs/content/en/documentation/getting-started/configuration/` — Config overview, params reference
- `sources/fixit-docs/content/en/guides/` — PWA, Algolia, CSE setup guides
- `sources/FixIt/hugo.toml` — Default config with all available options

Focus on:

- Configuration structure and merge mechanism (`_merge = "shallow"`)
- Most commonly used params sections (search, comment, analytics, PWA, header, footer, home)
- Working config examples for each feature
- Common gotchas and troubleshooting

Skip: Hugo basics, what TOML is, introductory text.
