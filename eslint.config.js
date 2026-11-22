import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'app',
  astro: true,
  pnpm: true,
  antislop: true,
  ignores: [
    '.agents',
    '.astro',
    '.grok',
    '.capture.mjs',
    '.diagnose.mjs',
    'dist',
    'test-results',
    'playwright-report',
    '**/*.css',
  ],
}, {
  // The workspace targets pnpm 10, which predates some settings this rule enforces.
  files: ['pnpm-workspace.yaml'],
  rules: {
    'pnpm/yaml-enforce-settings': 'off',
  },
})
