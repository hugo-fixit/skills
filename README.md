# hugo-fixit/skills

Agent Skills for the [FixIt](https://github.com/hugo-fixit/FixIt) Hugo theme — packaged instructions that extend AI coding agents with FixIt theme expertise.

## Skills

| Skill | Description | Audience |
| ------- | ------------- | ---------- |
| `fixit-config` | Theme configuration — hugo.toml params, search, comments, analytics, PWA, CDN | Users |
| `fixit-content` | Content creation — shortcodes, render hooks, extended markdown, front matter | Users |
| `fixit-customize` | Appearance customization — SCSS variables, custom partials, fonts, themes | Users |
| `fixit-dev` | Theme development — TypeScript modules, Hugo templates, asset pipeline, coding standards | Developers |

## Installation

```bash
# Install all FixIt skills
npx skills add hugo-fixit/skills --skill='*'

# Install specific skills
npx skills add hugo-fixit/skills --skill='fixit-config,fixit-content'

# Global installation
npx skills add hugo-fixit/skills --skill='*' -g
```

Learn more about the CLI usage at [skills](https://github.com/vercel-labs/skills).

## How It Works

Skills are generated from two source repositories:

- **[FixIt](https://github.com/hugo-fixit/FixIt)** — Theme source code (templates, TypeScript, SCSS)
- **[fixit-docs](https://github.com/hugo-fixit/fixit-docs)** — Official documentation site

Both are included as git submodules in `sources/`.

### Structure

```
sources/
├── FixIt/              # FixIt theme source (submodule)
└── fixit-docs/         # FixIt documentation (submodule)
skills/
├── fixit-config/       # Theme configuration skill
│   ├── SKILL.md
│   └── references/
├── fixit-content/      # Content creation skill
├── fixit-customize/    # Appearance customization skill
└── fixit-dev/          # Theme development skill
```

Each skill follows the [Agent Skills](https://agentskills.io/) format:

- `SKILL.md` — Index file with metadata and reference links
- `references/` — Detailed topic files with code examples

## Development

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/hugo-fixit/skills.git
cd skills

# Initialize submodules (if cloned without --recurse-submodules)
git submodule update --init --recursive
```

## Updating Skills

```bash
# 1. Update submodules to latest upstream
git submodule update --remote --merge

# 2. Regenerate affected skill in Claude Code
#    e.g. "重新生成 fixit-config"

# 3. Commit and push
git add -A && git commit -m "chore: sync skills with upstream"
git push
```

## License

[MIT](LICENSE)
