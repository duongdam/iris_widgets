# Research: Mendix Enterprise Chart Widget Suite

**Branch**: `001-enterprise-chart-widgets` | **Date**: 2026-06-10

Phase 0 research resolving technical unknowns from the implementation plan.

---

## 1. PNPM Workspace with Mendix Pluggable Widgets

**Decision**: Single root PNPM workspace with `packages/*` and `widgets/*`; each widget retains its own `package.json` with `@mendix/pluggable-widgets-tools` as a devDependency.

**Rationale**:
- Mendix widget build (`pluggable-widgets-tools start/build`) expects a widget-level `package.json` with `widgetName` config.
- PNPM `workspace:*` protocol links shared packages without publishing to npm.
- `pnpm --filter ax-barchart run build` enables independent widget builds for Mendix deployment.

**Alternatives considered**:
- **Nx/Turborepo**: Rejected — adds orchestration complexity not needed for 4 widgets and 3 packages.
- **npm/yarn workspaces**: Rejected — user mandates pnpm 10.30.0.
- **Copy shared code into each widget**: Rejected — violates DRY and maintainability goals.

---

## 2. Mendix 11.x Forward Compatibility

**Decision**: Pin `@mendix/pluggable-widgets-tools@11.8.1`; use React 18.2 APIs only; avoid deprecated Mendix widget APIs; test build on Studio Pro 10.24.9 with documented upgrade path.

**Rationale**:
- Pluggable widgets tools v11.x aligns with Mendix 11 widget runtime.
- React 18.2 is the Mendix platform standard for both 10.24.x and 11.x.
- String-attribute data binding (not datasource) reduces coupling to Mendix data layer changes.

**Alternatives considered**:
- **Dual build targets (10 + 11)**: Rejected for v1 — single toolchain with forward-compatible APIs is sufficient.
- **Web Components instead of React**: Rejected — Mendix pluggable widgets are React-based.

---

## 3. Testing Framework

**Decision**: Jest + `@testing-library/react` via `@mendix/pluggable-widgets-tools` defaults; additional unit tests in `packages/*` using Jest directly.

**Rationale**:
- `pluggable-widgets-tools` ships Jest configuration for widget projects.
- Shared packages test adapters, store, and builders in isolation without Mendix runtime.
- Contract tests validate adapter output against `ChartRecord` schema.

**Alternatives considered**:
- **Vitest**: Rejected — Mendix tooling ecosystem defaults to Jest; mixing runners adds friction.
- **Cypress component tests**: Deferred — unit tests sufficient for v1 adapters and builders.

---

## 4. ECharts Performance at 5,000+ Records

**Decision**: Use ECharts `large: true`, `progressive: 400`, `progressiveThreshold: 3000` for bar/column charts; `sampling: 'lttb'` for area charts; memoize full option objects; limit `animation: false` above 1,000 records.

**Rationale**:
- ECharts 6.x documents large-mode rendering for 10k+ data points.
- Option regeneration is the primary React cost — `useMemo` on builder output prevents unnecessary reconciliation.
- Disabling animation above threshold avoids jank on initial render.

**Alternatives considered**:
- **Data decimation in adapter**: Rejected for v1 — loses fidelity; ECharts handles rendering optimization natively.
- **Canvas vs SVG**: Default to canvas renderer (ECharts default) for performance.

---

## 5. Custom Event Bus vs Native APIs

**Decision**: Implement lightweight typed pub/sub in `chart-core/eventbus` (~60 lines); no `EventEmitter`, `mitt`, or RxJS.

**Rationale**:
- User explicitly prohibits third-party event bus libraries.
- Per-widget-instance bus avoids global mutable state.
- `on()` returns unsubscribe function for React `useEffect` cleanup.

**Alternatives considered**:
- **MobX reactions for all events**: Rejected — events are discrete signals, not reactive state; mixing concerns couples store to Mendix actions.
- **Browser CustomEvent on DOM**: Rejected — not framework-portable for testing.

---

## 6. JSON String Data vs Mendix Datasource

**Decision**: `jsonData` as writable String attribute; page logic (microflow/nanoflow/REST) produces JSON; widget only parses and adapts.

**Rationale**:
- Charts consume Elasticsearch, REST, warehouse, and analytics data — none map cleanly to Mendix entity datasources.
- Reduces widget XML complexity and Mendix version coupling.
- Enables identical widget behavior in preview (mock JSON) and runtime.

**Alternatives considered**:
- **Mendix Datasource + on-change microflow**: Rejected per requirements.
- **Widget-internal fetch**: Rejected — Mendix security and CORS patterns favor page-level data retrieval.

---

## 7. Elastic Aggregation Adapter Shape

**Decision**: Target the documented nested bucket structure (`aggregations.periods.buckets[].items.buckets[]`); store raw bucket in `metadata._elastic` for forward compatibility.

**Rationale**:
- User-provided Elastic format is explicit.
- Preserving raw bucket allows future field mapping without adapter rewrite.
- Synthetic `id` (`{period}:{name}`) ensures unique selection keys.

**Alternatives considered**:
- **Generic recursive bucket walker**: Deferred — over-engineered for v1; can replace adapter internals later without changing `DataAdapter` interface.

---

## 8. Report Chart Aggregations (v1 Scope)

**Decision**: v1 implements sum aggregation grouped by `period`, by `name`, and grand total; displayed as combo chart (bar + line for cumulative) with annotation labels.

**Rationale**:
- Covers primary reporting use case (totals and period summaries).
- `aggregateTotals` transformer in `chart-echarts` is reusable for future KPI widgets.
- Drilldown/export/filter interfaces stubbed in contracts, not implemented.

**Alternatives considered**:
- **Full OLAP-style drilldown in v1**: Rejected — user defers drilldown implementation.
- **Table-only report**: Rejected — must be a chart per widget spec.

---

## 9. Ant Design 6.x Theming

**Decision**: `ThemeProvider` wraps `ConfigProvider` with optional `theme` token overrides; default light theme; `darkMode` prop prepares `theme.darkAlgorithm` without implementing Mendix token sync.

**Rationale**:
- Ant Design 6.x uses CSS-in-JS token system compatible with ConfigProvider.
- Widgets need consistent typography and spacing around chart containers.
- Mendix design system mapping is a future integration point.

**Alternatives considered**:
- **No UI library**: Rejected — shared loading/empty states benefit from Ant Design.
- **MUI/Chakra**: Rejected — user mandates antd 6.4.3.

---

## 10. MobX Store Patterns

**Decision**: `makeAutoObservable` in constructor; no decorators; `mobx-react-lite` `observer` only on chart view components; store instantiated per widget in provider.

**Rationale**:
- User mandates makeAutoObservable without decorators.
- Per-widget store instances prevent cross-widget selection bleed.
- Computed `categories` and `seriesData` derive from `records` — single source of truth.

**Alternatives considered**:
- **React Context + useReducer**: Rejected — user mandates MobX; computed values are cleaner in MobX.
- **Global MobX root store**: Rejected — violates low-coupling principle.

---

## Resolved Clarifications Summary

| Unknown | Resolution |
|---------|------------|
| Testing framework | Jest via pluggable-widgets-tools + package-level Jest |
| Mendix 11 compatibility | Tools 11.8.1, React 18.2, string-attribute binding |
| 5,000+ record performance | ECharts large mode + useMemo + animation disable threshold |
| Event bus implementation | Custom typed pub/sub, per-widget instance |
| Report chart v1 scope | Sum aggregations by period/name; drilldown stubbed |
| Dashboard context | ChartContext with filter/timeRange props only |

All NEEDS CLARIFICATION items from Technical Context are resolved.

---

## 11. Design Token Architecture (Visual Refresh)

**Decision**: Single source of truth in `configs/chart-design-tokens.scss` using CSS custom properties (`--iris-*`); mirrored in `tailwind.config.js` `theme.extend` and a TypeScript `IRIS_CHART_TOKENS` constant for ECharts canvas rendering.

**Rationale**:
- Mendix widgets bundle CSS at build time — CSS vars work in both DOM shell and can be read programmatically.
- ECharts renders on canvas and cannot consume Tailwind classes; TS token map avoids drift.
- One file to update when brand colors change.

**Alternatives considered**:
- **Tailwind-only (no SCSS vars)**: Rejected — ECharts needs JS-accessible color values.
- **Ant Design tokens only**: Rejected — ECharts axis/grid/tooltip not controlled by ConfigProvider.
- **Per-widget SCSS copies**: Rejected — violates DRY; 4 widgets would diverge.

---

## 12. ECharts Theme Registration

**Decision**: Register `iris-enterprise` theme via `echarts.registerTheme()` once per chart mount (guarded by module-level flag); builders merge `baseChartStyle()` fragments (grid, axis, legend, tooltip) into each option.

**Rationale**:
- ECharts 6.x `registerTheme` applies consistent defaults; builders override only chart-type specifics.
- Module-level registration prevents duplicate register calls on hot reload.
- Keeps FR-010 — all config stays in `chart-echarts`.

**Alternatives considered**:
- **Inline styles per builder**: Rejected — 4 builders × 6 style sections = unmaintainable duplication.
- **echarts.init dom attribute theme only**: Rejected — insufficient for series-level gradients and emphasis.

---

## 13. Tailwind + SCSS Integration in Mendix Widgets

**Decision**: `@use '../../../../configs/widget-styles.scss'` in each widget SCSS entry; Tailwind `@layer components` for BEM classes; `@apply` only inside SCSS, never in TSX.

**Rationale**:
- Mendix rollup postcss pipeline already processes widget SCSS.
- BEM prefix `iris-chart-*` prevents collision with Mendix Atlas/UI classes.
- TSX components use semantic class names compiled to static CSS.

**Alternatives considered**:
- **CSS Modules**: Rejected — not used elsewhere in monorepo; adds import pattern change.
- **Styled-components**: Rejected — adds runtime cost; conflicts with Mendix widget bundle size goals.
- **Inline styles in React**: Rejected — not reusable across 4 widgets and mock-ui.

---

## 14. Enterprise Color Palette

**Decision**: 8-color categorical palette derived from indigo/violet/teal/emerald/amber/rose spectrum; semantic tokens for `--iris-primary`, `--iris-surface`, `--iris-border`, `--iris-text-muted`; bar/column use linear gradient from base to +15% lightness.

**Palette**:

| Index | Token | Hex | Use |
|-------|-------|-----|-----|
| 0 | `--iris-series-1` | `#4F46E5` | Primary series |
| 1 | `--iris-series-2` | `#0EA5E9` | Secondary |
| 2 | `--iris-series-3` | `#10B981` | Tertiary |
| 3 | `--iris-series-4` | `#F59E0B` | Quaternary |
| 4 | `--iris-series-5` | `#EF4444` | Alert |
| 5 | `--iris-series-6` | `#8B5CF6` | Accent |
| 6 | `--iris-series-7` | `#EC4899` | Accent |
| 7 | `--iris-series-8` | `#14B8A6` | Accent |

**Rationale**: Replaces default ECharts palette (`#5470c6` etc.) which reads as generic/demo. Indigo-led palette aligns with modern SaaS dashboards (Linear, Vercel, Stripe analytics).

**Alternatives considered**:
- **Mendix Atlas colors**: Deferred — no runtime Atlas token access in pluggable widgets v1.
- **Monochrome + single accent**: Rejected — multi-series charts (column, stack area) need distinct hues.

---

## 15. Tooltip & Number Formatting

**Decision**: Custom HTML tooltip template with inline styles referencing token hex values; `Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })` for values; series color dot rendered via `params.color`.

**Rationale**:
- ECharts `formatter` returns HTML string — styled card tooltip elevates perceived quality.
- Locale-aware formatting without adding dependencies.
- Color dot reinforces series identity in multi-series tooltips.

**Alternatives considered**:
- **ECharts default tooltip**: Rejected — plain text, no visual hierarchy.
- **External tooltip component (React portal)**: Rejected — complex ECharts integration; breaks on canvas hover sync.

---

## Resolved Clarifications Summary (Visual Refresh)

| Unknown | Resolution |
|---------|------------|
| Token source of truth | SCSS CSS vars + Tailwind extend + TS mirror |
| ECharts styling location | `chart-echarts/src/theme/` + `chartStyleHelpers.ts` |
| Tailwind in TSX | No — SCSS `@apply` only |
| Color palette | 8-color enterprise indigo-led spectrum |
| Dark mode v1 | CSS vars stub; full dark theme deferred |
| Chart-type differentiation | Shared base + series preset per chart type |
