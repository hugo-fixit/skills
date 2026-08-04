export interface SkillSourceMap {
  repo: string
  paths: string[]
}

/**
 * Repositories to clone as submodules and generate skills from source
 */
export const submodules: Record<string, string> = {
  FixIt: 'https://github.com/hugo-fixit/FixIt',
  'fixit-docs': 'https://github.com/hugo-fixit/fixit-docs',
}

/**
 * Skill to source file mapping (used for change detection during sync)
 */
export const skillSources: Record<string, SkillSourceMap[]> = {
  'fixit-config': [
    {
      repo: 'fixit-docs',
      paths: [
        'content/en/documentation/getting-started/configuration/',
        'content/en/guides/',
      ],
    },
    {
      repo: 'FixIt',
      paths: [
        'hugo.toml',
        'layouts/_partials/function/param.html',
        'layouts/_partials/init/',
      ],
    },
  ],
  'fixit-content': [
    {
      repo: 'fixit-docs',
      paths: [
        'content/en/documentation/content-management/',
      ],
    },
    {
      repo: 'FixIt',
      paths: [
        'layouts/_shortcodes/',
        'layouts/_markup/',
        'archetypes/',
      ],
    },
  ],
  'fixit-customize': [
    {
      repo: 'fixit-docs',
      paths: [
        'content/en/documentation/advanced/',
        'content/en/references/blocks/',
      ],
    },
    {
      repo: 'FixIt',
      paths: [
        'assets/scss/',
        'layouts/_partials/custom.html',
      ],
    },
  ],
  'fixit-dev': [
    {
      repo: 'fixit-docs',
      paths: [
        'content/en/contributing/',
        'content/en/ecosystem/dev-component/',
      ],
    },
    {
      repo: 'FixIt',
      paths: [
        'assets/js/',
        'layouts/',
        'packages/',
        'package.json',
        'CLAUDE.md',
      ],
    },
  ],
}

/**
 * Hand-written skills (no automated generation needed)
 */
export const manual: string[] = []
