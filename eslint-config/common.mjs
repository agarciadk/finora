/**
 * Reglas base compartidas por todos los proyectos del monorepo:
 * las reglas recomendadas de ESLint y de typescript-eslint.
 *
 * Recibe `eslint` y `tseslint` como parámetros (en lugar de importarlos
 * directamente) para que cada app use su propia versión ya instalada de
 * `@eslint/js` y `typescript-eslint`, evitando conflictos de versiones
 * entre apps del monorepo (p. ej. `api` en ESLint 9 y `web` en ESLint 10).
 *
 * @param {{ eslint: object, tseslint: object }} deps - módulos `@eslint/js` y `typescript-eslint` de la app consumidora.
 */
export function createCommonConfig({ eslint, tseslint }) {
  return [eslint.configs.recommended, ...tseslint.configs.recommended];
}
