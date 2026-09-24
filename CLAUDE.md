# CLAUDE.md — Skill Generation Guidelines

This file defines how to generate and maintain Agent Skills for the FixIt Hugo theme.

## Overview

Skills are generated from two source repositories:

- **FixIt** (`sources/FixIt/`) — Theme source code (Hugo templates, TypeScript, SCSS, config)
- **fixit-docs** (`sources/fixit-docs/`) — Official documentation site

Each skill lives in `skills/<name>/` with this structure:

```
skills/<name>/
├── SKILL.md           # Index file with frontmatter and reference links
└── references/        # Detailed topic files
    └── *.md
```

## Skill Generation Rules

1. **Rewrite for agents** — Synthesize from source docs, don't copy verbatim. Agents need actionable patterns, not prose.
2. **Be practical** — Prioritize usage patterns, configuration examples, and code snippets over conceptual explanations.
3. **Be concise** — Remove introductory filler, commonly known Hugo concepts, and marketing language.
4. **One concept per reference file** — Split large topics into separate files under `references/`.
5. **Include code** — Every reference file must contain working, copy-pasteable code examples.
6. **Explain why** — Cover not just how to configure something, but when and why to use specific options.
7. **Source annotations** — Add HTML comments at the top of reference files: `<!-- source: <path>:<line-range> -->`
8. **No shortcode escaping** — Write shortcodes in their real form (`{{< >}}` / `{{% %}}`), never Hugo docs escaping (`{{</* */>}}` / `{{%/* */%}}`). Skills are references for agents writing content, not Hugo-rendered docs. Use `{{% %}}` for shortcodes that process Markdown (e.g. `tab`, `fixit-encryptor`); `{{< >}}` for all others. Do not copy escaped examples from fixit-docs — unescape them.

## Source Priority

For user-facing skills (fixit-config, fixit-content, fixit-customize):

- Primary: `sources/fixit-docs/content/en/` documentation pages
- Secondary: `sources/FixIt/hugo.toml` default config, template source code

For developer skill (fixit-dev):

- Primary: `sources/FixIt/` source code and `CLAUDE.md`
- Secondary: `sources/fixit-docs/content/en/contributing/`

## SKILL.md Format

```yaml
---
name: <skill-name>
description: >
  Third-person description with specific trigger phrases.
  Example: "FixIt Hugo theme configuration — hugo.toml params, search engines,
  comment systems. Use when configuring a FixIt site or troubleshooting settings."
metadata:
  author: hugo-fixit
  version: <date-based, e.g. 2026.8.4>
  source: Generated from https://github.com/hugo-fixit/FixIt and https://github.com/hugo-fixit/fixit-docs
---
```

Body structure:

1. Brief overview (2-3 sentences)
2. Quick reference table (most common options)
3. Reference link table (Topic | Description | Reference)
4. Code examples (minimal working config)

## Updating Skills

1. Run `git submodule update --remote --merge` to pull latest upstream changes
2. For skills with changes, read the diff to understand what changed
3. Update affected reference files, preserving source annotations
4. Update SKILL.md index if new references were added

## Regenerating a Skill

When the user asks to "regenerate" or "重新生成" a specific skill (e.g. `fixit-config`):

1. Read the instruction file: `instructions/<skill-name>.md`
2. Read the source files listed in that instruction, focusing on the "Focus on" topics
3. Read the existing `skills/<skill-name>/SKILL.md` and `references/*.md` to understand current structure
4. Rewrite all files under `skills/<skill-name>/` following the generation rules above

Available skills: `fixit-config`, `fixit-content`, `fixit-customize`, `fixit-dev`
