import eslint from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import { createWebConfig } from '@finora/eslint-config/web'

export default createWebConfig({
  eslint,
  tseslint,
  reactHooks,
  reactRefresh,
  globals,
  defineConfig,
  globalIgnores,
})
