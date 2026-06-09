# Implementation Plan: Enterprise Chart Visual Refresh

**Branch**: `001-enterprise-chart-widgets` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Input**: User request — *"style lại cho 4 chart trông chuyên nghiệp và xịn xò"* (Tailwind CSS + SCSS expert styling for ax-barchart, ax-columnchart, ax-stackareachart, ax-reportchart).

**Note**: This plan extends the existing chart widget suite with a unified enterprise design system. Functional behavior (data, selection, events) is unchanged.

---

## Summary

Elevate all four chart widgets from a functional baseline to a **polished enterprise dashboard aesthetic** by introducing a shared **Iris Design Token** layer (SCSS custom properties + Tailwind `@apply`), a registered **ECharts theme** aligned to those tokens, and refined **chart-ui** shell components (container, empty, loading, selection highlight).

**Technical approach**:
1. Define design tokens once in `configs/chart-design-tokens.scss` and expose via Tailwind `theme.extend`.
2. Centralize ECharts visual config in `packages/chart-echarts/src/theme/` (axis, grid, legend, tooltip, series emphasis).
3. Refine `widget-styles.scss` BEM classes for Mendix widget shells.
4. Apply chart-type-specific polish (bar radius, column gradients, area fills, report combo styling) in builders — **visual only**, no logic changes.
5. Validate in `mock-ui` and Studio Pro preview across all four widgets.

---

## Technical Context

**Language/Version**: TypeScript 5.4 (strict), React 18.2, SCSS, Tailwind CSS 3.4

**Primary Dependencies**: echarts 6.1.0, antd 6.4.3, tailwindcss 3.4, postcss, rollup-plugin-postcss

**Storage**: N/A (presentation layer only)

**Testing**: Visual regression via mock-ui; Jest smoke tests for theme helper exports; manual Studio Pro preview check

**Target Platform**: Mendix pluggable widgets (Studio Pro 10.24.9+), mock-ui (Vite 5173)

**Project Type**: PNPM monorepo — shared packages + 4 Mendix widgets

**Performance Goals**: No additional render cost; theme objects memoized; CSS bundled once per widget (~2–4 KB gzipped delta)

**Constraints**:
- ECharts config MUST remain in `chart-echarts` only (FR-010)
- Tailwind classes MUST compile at build time (no runtime Tailwind in Mendix)
- Widget SCSS MUST `@use` shared configs — no duplicated token values across widgets
- Selection/hover behavior unchanged; styling only enhances visual feedback
- Mendix pages may inject global CSS — use scoped BEM prefix `iris-chart-*` to avoid collisions

**Scale/Scope**: 4 widgets, 3 shared packages, 1 mock-ui; ~15 files touched

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Shared logic in packages, not widgets | ✅ PASS | All ECharts styling in `chart-echarts`; shell UI in `chart-ui` |
| No raw ECharts config in widgets | ✅ PASS | Widgets consume builders + `ChartContainer` only |
| TypeScript strict, React hooks | ✅ PASS | No new patterns introduced |
| MobX store unchanged | ✅ PASS | Styling is presentation-only |
| Ant Design for empty/loading | ✅ PASS | Enhanced with token-aligned overrides |
| Independent widget builds | ✅ PASS | Each widget imports shared SCSS via `@use` |

**Post-design re-check**: ✅ No violations. Complexity Tracking not required.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-enterprise-chart-widgets/
├── plan.md              # This file
├── research.md          # Phase 0 — styling decisions (§11–§15)
├── data-model.md        # Phase 1 — ChartDesignTokens entity
├── quickstart.md        # Phase 1 — styling dev workflow
├── contracts/           # Phase 1 — design token + ECharts theme contracts
│   ├── chart-design-tokens.ts
│   ├── echarts-theme.ts
│   └── theme-provider.ts (updated)
└── tasks.md             # Phase 2 — /speckit-tasks (not created here)
```

### Source Code (repository root)

```text
configs/
├── chart-design-tokens.scss   # CSS custom properties (single source of truth)
├── tailwind.config.js         # theme.extend maps to tokens
└── widget-styles.scss         # BEM @layer components

packages/chart-echarts/src/
├── theme/
│   ├── irisEchartsTheme.ts    # registerTheme + base option fragments
│   └── seriesStyles.ts        # bar/column/area/report visual presets
└── helpers/
    ├── chartStyleHelpers.ts   # buildGrid, buildAxis, buildLegend, buildTooltip
    ├── colorPalette.ts        # enterprise palette (updated)
    └── tooltipFormatters.ts   # styled HTML tooltip (updated)

packages/chart-ui/src/
├── components/
│   ├── ChartContainer.tsx     # header slot, subtitle, actions area
│   ├── ChartEmptyState.tsx    # custom empty illustration
│   └── ChartLoadingOverlay.tsx
└── theme/
    └── ThemeProvider.tsx      # antd token sync from CSS vars

widgets/ax-*/src/styles/
└── ax-*chart.scss             # @use configs/widget-styles.scss

mock-ui/src/
└── App.css                    # align mock shell to iris tokens
```

**Structure Decision**: Token-first SCSS in `configs/`, consumed by Tailwind and widget builds. ECharts theme mirrors CSS vars via a TypeScript token map for canvas rendering.

---

## Design Direction

### Visual Identity — "Iris Enterprise"

| Element | Current | Target |
|---------|---------|--------|
| Container | Plain white card, slate border | Elevated card: subtle shadow, 12px radius, optional header divider |
| Palette | Default ECharts colors | Curated 8-color enterprise palette (indigo → teal spectrum) |
| Typography | Generic 14px | 13px axis labels, 15px title semibold, tabular nums for values |
| Grid/Axis | ECharts defaults | Muted `#E2E8F0` grid, `#64748B` labels, no axis line |
| Tooltip | Plain HTML | Rounded card, shadow, color dot, formatted numbers |
| Bar/Column | Flat fill | 4px top radius, subtle gradient, hover brighten |
| Area | Flat fill | Gradient fill (40% → 5% opacity), smooth line 2px |
| Selection | Default emphasis | Brand ring + bar opacity shift |
| Empty/Loading | Basic Ant Design | Branded empty state, skeleton shimmer overlay |
| Dark mode | Not supported | CSS vars prepared; ECharts dark theme stub |

### Chart-Type Treatments

1. **ax-barchart** — Vertical bars, rounded tops, single-series gradient, category labels truncated with ellipsis
2. **ax-columnchart** — Grouped columns, 8px gap, multi-series palette, legend pills
3. **ax-stackareachart** — Smooth stacked areas, inside zoom slider styled, legend scroll
4. **ax-reportchart** — Combo bar+line, annotation labels, KPI-style total header optional

---

## Phase 0: Research (see research.md §11–§15)

Resolved decisions:
- **Token strategy**: CSS custom properties in SCSS → Tailwind extend → TS mirror for ECharts
- **ECharts theming**: `echarts.registerTheme('iris-enterprise', …)` + per-builder overrides
- **Tailwind scope**: `@layer components` BEM; no `@apply` in TSX except via SCSS
- **Number formatting**: `Intl.NumberFormat` in tooltip formatters
- **Accessibility**: 4.5:1 contrast on text; patterns not required for v1 (color + tooltip)

---

## Phase 1: Design Artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| Data model | `data-model.md` | `ChartDesignTokens`, `ChartShellProps` |
| Contracts | `contracts/chart-design-tokens.ts` | Token interface |
| Contracts | `contracts/echarts-theme.ts` | Theme registration contract |
| Contracts | `contracts/theme-provider.ts` | Extended with token injection |
| Quickstart | `quickstart.md` | Styling dev + preview workflow |

---

## Implementation Phases (for /speckit-tasks)

### Phase A — Design Token Foundation
- Create `configs/chart-design-tokens.scss` with `:root` and `[data-theme="dark"]` vars
- Extend `tailwind.config.js` with `colors.iris.*`, `boxShadow.iris-*`, `borderRadius.iris`
- Refactor `widget-styles.scss` to consume tokens

### Phase B — ECharts Theme Layer
- Add `irisEchartsTheme.ts` + `chartStyleHelpers.ts`
- Update `colorPalette.ts` to enterprise palette
- Refactor all 4 builders to use shared style helpers
- Enhance `tooltipFormatters.ts` with styled HTML + number format

### Phase C — Chart UI Shell
- Upgrade `ChartContainer` (header divider, optional subtitle, compact mode)
- Polish `ChartEmptyState` and `ChartLoadingOverlay`
- Sync `ThemeProvider` antd tokens from CSS vars

### Phase D — Widget Integration
- Verify all 4 widget SCSS imports
- Register ECharts theme in each `*ChartView.tsx` via `useMemo`
- Apply selection emphasis styles in builders when `selectedId` present

### Phase E — Mock UI & Validation
- Align `mock-ui` layout to iris tokens
- Side-by-side preview checklist for all 4 chart types
- Studio Pro preview screenshot parity

---

## Complexity Tracking

> No constitution violations requiring justification.

---

## Success Criteria (Styling)

| ID | Criterion |
|----|-----------|
| STY-001 | All 4 widgets share identical container, tooltip, axis, legend styling |
| STY-002 | Design tokens defined in exactly one SCSS file; zero hardcoded hex in builders |
| STY-003 | mock-ui renders charts indistinguishable from widget dev server output |
| STY-004 | Selection state visually distinct (opacity + border emphasis) |
| STY-005 | Empty and loading states match enterprise card aesthetic |
| STY-006 | CSS bundle size increase ≤ 5 KB gzipped per widget |
| STY-007 | Charts remain performant at 5,000+ records (no new animation overhead)
