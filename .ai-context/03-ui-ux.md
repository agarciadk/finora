# 03 — UI/UX & Frontend Patterns

## Base components (`@base-ui/react` + shadcn styling)
- Own components in `apps/web/src/components/ui/`: `select.tsx`, `popover.tsx`, `dialog.tsx`, `alert-dialog.tsx`, `sheet.tsx`, `sonner.tsx` (toaster, uses the repo's own `useTheme` instead of `next-themes`), `loading-spinner.tsx`, `chart.tsx`.
- Generic `Select`: `Select.Root.Props<Value, Multiple>` has NO default for `Value` — type it explicitly, e.g. `SelectPrimitive.Root.Props<string, false>`. `onValueChange` has the signature `(value: string | null, eventDetails) => void` — ALWAYS type it as `string | null` and guard against `null`.
- `Popover`/`Dialog` are modeled after the `alert-dialog.tsx` pattern (same primitives: Root/Trigger/Portal/Backdrop/Popup/Title/Description/Close).
- Date range filter: `Popover` + two native `<Input type="date">` (no new calendar library).
- `TransactionCategorySelect`: reuses `Select` with a `__create__` sentinel item that opens a quick-create `Dialog`.
- `chart.tsx` (recharts v3): type `ChartTooltipContent`/`ChartLegendContent` with OWN, self-contained payload shapes (do not rely on `React.ComponentProps<typeof RechartsPrimitive.Tooltip>` — recharts v3 removed those public props). Wrap any field used as a key (`item.value`/`dataKey`) in `String(...)` since in v3 they can be `ReactNode`/`number`.

## Forms / Sheets
- General pattern: Sheet (create/edit) + AlertDialog (confirm delete) + DropdownMenu per row/card.
- Sheets with many fields: the fields container needs `flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto` (`min-h-0` is essential on a flex child for `overflow-y-auto` to work) — otherwise the footer/"Save" button becomes unreachable without scrolling. Apply this locally per page, not in the shared `sheet.tsx` without checking every usage.
- Sync props→state without `useEffect`: use a subcomponent that only mounts once the data exists, initializing state in its own `useState` (the `ProfileForm` pattern in `settings-page.tsx`).
- Fetch-on-mount: `useEffect(() => { void refresh() }, [refresh])` — see the lint rule in gotchas.

## Bundle & routing
- `vite.config.ts`: `build.rollupOptions.output.manualChunks` — `react-vendor` (react/react-dom/react-router-dom), `ui-vendor` (lucide-react/@base-ui/react/sonner, used outside lazy routes), `charts-vendor` (recharts, SEPARATE from ui-vendor — grouping them together makes the chunk load eagerly just because sonner/lucide are used outside lazy routes).
- All authenticated routes: `React.lazy(() => import(...).then(m => ({default: m.XxxPage})))` (pages are NAMED exports, not default).
- Single boundary: ONE `<Suspense fallback={<LoadingSpinner/>}>` wrapping `<Outlet/>` in `DashboardLayout` (not one per route) — so the sidebar/layout doesn't remount on navigation.
- `lib/lazy-pages.ts` centralizes `() => import("@/pages/xxx-page")`, shared between `React.lazy()` and a `ROUTE_PRELOADERS` map (same specifier in both, for ESM module cache dedupe).
- Navigation from `AppSidebar`: intercepts the `NavLink` click (`preventDefault()` on a plain click, lets modifier/middle-click pass through), calls `onNavigate(url)`. `DashboardLayout#navigateWithPendingState`: `setIsNavigating(true)` → `await ROUTE_PRELOADERS[to]()` → `navigate(to)` + `setIsNavigating(false)`. The spinner overlay is painted ON TOP of `<Suspense><Outlet/></Suspense>`, which stays ALWAYS mounted.
- `AuthProvider` renders a full-screen `LoadingSpinner` instead of `children` while `isLoading` (initial `GET /users/me` check). `index.html` carries a pure HTML/CSS spinner inside `#root` to cover pre-hydration.

## Analytics / Charts
- `AnalyticsMonthSelector`: prev/next + label via `Intl.DateTimeFormat(i18n.language,{month:'long',year:'numeric'})`, "current month" button only shown if not already on the current month, "next" disabled if `isCurrentMonth`.
- `AnalyticsEvolutionChart` (income/expenses area) and `AnalyticsCategoryChart` (pie with empty-state fallback) in `components/analytics/`.

## i18n
- Use `Trans` from `react-i18next` to interpolate JSX inside a translation (e.g. bolding a number): `<Trans i18nKey="..." values={{seconds}} components={{strong: <strong/>}} />` — preferable to splitting the translation into fragments with a fixed word order.
