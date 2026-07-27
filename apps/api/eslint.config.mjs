import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { createApiConfig } from '@finora/eslint-config/api';

export default createApiConfig(
  { eslint, tseslint, eslintPluginPrettierRecommended, globals },
  import.meta.dirname,
);
