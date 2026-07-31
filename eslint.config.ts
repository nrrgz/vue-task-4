import pluginVue from 'eslint-plugin-vue'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { globalIgnores } from 'eslint/config'

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

  skipFormatting,
)
