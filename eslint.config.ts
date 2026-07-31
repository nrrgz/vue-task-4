import pluginVue from 'eslint-plugin-vue'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { globalIgnores } from 'eslint/config'
import { localPlugin } from './eslint-local-rules.ts'

export default withVueTs(
  globalIgnores([
    '**/dist/**',
    '**/coverage/**',
    '**/node_modules/**',
    'public/mockServiceWorker.js',
  ]),

  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,vue}'],
  },

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  {
    name: 'app/no-comments',
    files: ['src/**/*.{ts,vue}'],
    plugins: { local: localPlugin },
    rules: { 'local/no-comments': 'error' },
  },

  skipFormatting,
)
