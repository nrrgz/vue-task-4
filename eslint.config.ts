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

  {
    name: 'app/no-direct-token-access',
    files: ['src/components/**/*.{ts,vue}', 'src/views/**/*.{ts,vue}', 'src/composables/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message: 'Storage belongs to the auth store, not to components.',
        },
        {
          name: 'sessionStorage',
          message: 'Storage belongs to the auth store, not to components.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^[Aa]uthorization$/]',
          message: 'The Authorization header is set by the axios request interceptor only.',
        },
        {
          selector: 'Property > Identifier.key[name=/^[Aa]uthorization$/]',
          message: 'The Authorization header is set by the axios request interceptor only.',
        },
        {
          selector: 'TemplateLiteral > TemplateElement[value.raw=/Bearer/]',
          message: 'The Authorization header is set by the axios request interceptor only.',
        },
      ],
    },
  },

  skipFormatting,
)
