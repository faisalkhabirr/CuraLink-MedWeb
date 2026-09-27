import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Globals used to be `browser` for every .js/.jsx file, which left the
  // Express API failing no-undef on `process`. They are now split per runtime.
  // The React app runs in the browser...
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  // ...while the API (server/**), its Vercel entry point (api/**) and the
  // root-level build config (eslint.config.js, vite.config.js - matched by
  // *.js) run in Node and need node globals: process, Buffer, setImmediate,
  // and so on. `no-undef` is what enforced the browser-only setup before;
  // these files no longer see it.
  {
    files: ['server/**/*.js', 'api/**/*.js', '*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
