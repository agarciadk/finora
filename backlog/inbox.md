# Inbox

Quick-capture list for ideas about Finora. This is **not** a task list — an idea here can be as short as one line, with no ID, no spec, no acceptance criteria, no technical detail.

## How to use this file

- Add a new idea as a bullet under "Ideas", in your own words. One line is enough.
- Don't worry about phrasing it perfectly, scoping it, or making it actionable — that happens later, during refinement.
- An AI agent (or a human) can later turn an idea into a formal task under `backlog/tasks/FIN-XXX/` through refinement (see [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) for the process).
- Once an idea is converted into a task, mark the line with `→ converted to FIN-XXX` instead of deleting it, so the history of where a task came from isn't lost.
- Ideas don't need to be processed in order, and not every idea will become a task.

## Ideas

<!-- Add new ideas below this line, one bullet each. -->
- Crear wikis para tener una documentación técnica más avanzada quizás con diseño de flujos. → converted to FIN-002
- Mejorar el README. → converted to FIN-001
- Añadir sincronización de pestañas. → converted to FIN-003
- Pagos recurrentes sin botón marcar pagado. → converted to FIN-021
- Calcular saldo en cuentas a partir de las transacciones actuales. → converted to FIN-004
- Móvil: el sidebar debería ocultarse una vez se pulse sobre una página. → converted to FIN-005
- Sacar perfil de ajustes y moverlo a la esquina superior derecha. → converted to FIN-006
- Mover acciones idioma, tema, cerrar sesión al sidebar, encima de los ajustes. → converted to FIN-006
- Mejorar el diseño de la página cambiando de colores y fuente, fondo. → converted to FIN-036
- Añadir animaciones a moverse por la página. → converted to FIN-037
- Añadir un diseño diferente a las cards de cuentas para que sea más coloridas. → converted to FIN-038
- Cambiar el nombre a la aplicación por otro menos usado. → converted to FIN-007
- Meter préstamos, tarjeta de créditos y el cálculo del ingreso de intereses. → converted to FIN-024, FIN-025, FIN-026
- Añadir conexión a cuentas bancarias reales. → converted to FIN-008
- Añadir cuenta de correo para el envío de estos. Posible newsletter. → converted to FIN-010, FIN-011
- Añadir FOOTER a la app. → converted to FIN-012
- Añadir página de inicio fuera de usuario registrado. → converted to FIN-013
- Añadir Oauth2.0 para inicio de sesión con Google, iOS. → converted to FIN-014
- Mejorar el flujo de importación de transacciones donde se puedan ver duplicados y elegir si importarlos o no. → converted to FIN-015
- Enmascarar datos sensibles en el backend en vez de en el frontend. → converted to FIN-009
- Añadir cálculo inteligente de gastos pasados para calcular medias a partir de las transacciones. → converted to FIN-017
- Poder dar colores a las categorías y que esos colores aparezcan igual en aquellos sitios donde hay categorías. → converted to FIN-018
- Añadir a pagos recurrentes una fecha fin mientras no se meta lógica de leasing/renting/préstamo → converted to FIN-022
- Poder crear triggers donde el usuario mediante reglas pueda asignar categorías a movimientos repetidos para futuras ocasiones. → converted to FIN-016
- Meter lógica de préstamos para cálculo de intereses, plan de amortización. → converted to FIN-026, FIN-027
- Añadir calculadora de sueldo neto. → converted to FIN-028
- Convertir la aplicación a aplicación híbrida para tener app móvil → converted to FIN-030
- Añadir logs de peticiones en el backend. → converted to FIN-031
- Añadir analíticas para analizar qué hace el usuario en la página. → converted to FIN-035
- Añadir SonarQube/SonarCloud con GitHub actions. → converted to FIN-032
- Añadir Semgrep para husky. → converted to FIN-033
- Activar CodeQL en GitHub. → converted to FIN-034
- Añadir estado global a la App con Zustand. → converted to FIN-020
- Enfocar la app a Mobile First para tener más facilidades a la migración a móvil. → converted to FIN-029
- En el detalle de las cuentas se debería poder editar los mismos datos que en la lista de cuentas. → converted to FIN-019
- `apps/api/test/jest-e2e.json` no incluye el `moduleNameMapper` de `.js`→`.ts` que sí tiene la config de tests unitarios (`apps/api/package.json`'s `jest` field); con Prisma 7.10's cliente generado en estilo ESM (imports con extensión `.js`), `pnpm --filter @finora/api test:e2e` falla siempre con `Cannot find module './internal/class.js'` antes de arrancar ningún test, independientemente de los cambios (descubierto durante FIN-031).
- El botón "Volver a cuentas" de `account-detail-page.tsx` (usa `render={<Link .../>}` con `nativeButton`) genera un warning de Base UI en consola ("A component that acts as a button expected a native `<button>`..."); revisar el patrón `render` de `Button` en esa página. Detectado durante FIN-019.
- El selector de importe en pagos recurrentes podría ser un range selector. → converted to FIN-023
- Crear capa de pago, añadir anuncios. → converted to FIN-039, FIN-040