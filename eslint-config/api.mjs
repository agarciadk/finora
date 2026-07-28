import { createCommonConfig } from './common.mjs';

/**
 * Configuración de ESLint para la app `api` (NestJS).
 *
 * @param {{ eslint: object, tseslint: object, eslintPluginPrettierRecommended: object, globals: object }} deps
 * @param {string} tsconfigRootDir - Directorio raíz del tsconfig del proyecto que consume esta config.
 */
export function createApiConfig(
  { eslint, tseslint, eslintPluginPrettierRecommended, globals },
  tsconfigRootDir,
) {
  return tseslint.config(
    {
      ignores: ['eslint.config.mjs'],
    },
    ...createCommonConfig({ eslint, tseslint }),
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        sourceType: 'commonjs',
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
    },
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
      },
    },
  );
}
