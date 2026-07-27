import { createCommonConfig } from './common.mjs';

/**
 * Configuración de ESLint para la app `web` (React + Vite).
 *
 * @param {{ eslint: object, tseslint: object, reactHooks: object, reactRefresh: object, globals: object, defineConfig: Function, globalIgnores: Function }} deps
 */
export function createWebConfig({ eslint, tseslint, reactHooks, reactRefresh, globals, defineConfig, globalIgnores }) {
  return defineConfig([
    globalIgnores(['dist']),
    {
      files: ['**/*.{ts,tsx}'],
      extends: [...createCommonConfig({ eslint, tseslint }), reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
      languageOptions: {
        globals: globals.browser,
      },
    },
    {
      files: ['src/components/ui/**/*.{ts,tsx}'],
      rules: {
        // shadcn/base-ui generated primitives intentionally export variant
        // helpers (e.g. buttonVariants) alongside components.
        'react-refresh/only-export-components': 'off',
      },
    },
  ]);
}
