---
description: "Task list for Enterprise Chart Visual Refresh (Tailwind + SCSS styling)"
---

# Tasks: Enterprise Chart Visual Refresh

**Input**: Design documents from `/specs/001-enterprise-chart-widgets/`

**Prerequisites**: plan.md, spec.md, research.md (§11–§15), data-model.md (Presentation Entities), contracts/, quickstart.md

**Context**: Functional implementation (Phases 1–9, T001–T106) is **complete**. This task list covers the **Visual Refresh** plan — elevating all four chart widgets to a polished enterprise dashboard aesthetic via Iris Design Tokens, ECharts theme, and chart-ui shell upgrades.

**Tests**: Not explicitly requested. Visual validation via mock-ui and Studio Pro preview per quickstart.md styling checklist.

**Organization**: Tasks grouped by user story for per-chart styling delivery; shared token/theme work in Setup and Foundational phases.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1–US6) for chart-specific phases
- All descriptions include exact file paths

## Path Conventions

- **Design tokens**: `configs/chart-design-tokens.scss`, `configs/tailwind.config.js`, `configs/widget-styles.scss`
- **Shared packages**: `packages/chart-echarts/`, `packages/chart-ui/`
- **Widgets**: `widgets/ax-barchart/`, `widgets/ax-columnchart/`, `widgets/ax-stackareachart/`, `widgets/ax-reportchart/`
- **Preview**: `mock-ui/src/`

---

## Phase 1: Setup — Design Token Foundation

**Purpose**: Single source of truth for colors, typography, shadows, and radii consumed by Tailwind, SCSS, and ECharts

- [X] T001 Create configs/chart-design-tokens.scss with `:root` CSS custom properties (`--iris-*`) per data-model.md ChartDesignTokens table
- [X] T002 [P] Add `[data-theme="dark"]` token overrides stub in configs/chart-design-tokens.scss
- [X] T003 [P] Extend configs/tailwind.config.js `theme.extend` with `colors.iris.*`, `boxShadow.iris-*`, `borderRadius.iris` mapped to CSS vars
- [X] T004 Refactor configs/widget-styles.scss to `@use` chart-design-tokens and apply enterprise BEM classes (`iris-chart-container`, `iris-chart-empty`, `iris-chart-loading`)

**Checkpoint**: Token SCSS compiles; Tailwind content paths include widget and chart-ui sources

---

## Phase 2: Foundational — ECharts Theme & Chart UI Shell

**Purpose**: Shared visual infrastructure that MUST be complete before per-widget styling

**⚠️ CRITICAL**: No per-chart styling work can begin until this phase is complete

### chart-echarts theme layer

- [X] T005 Create packages/chart-echarts/src/theme/irisTokens.ts mirroring DEFAULT_CHART_TOKENS from specs/001-enterprise-chart-widgets/contracts/chart-design-tokens.ts
- [X] T006 Create packages/chart-echarts/src/helpers/chartStyleHelpers.ts with buildGrid, buildCategoryAxis, buildValueAxis, buildLegend, buildTooltip, buildTitle per contracts/echarts-theme.ts
- [X] T007 Create packages/chart-echarts/src/theme/irisEchartsTheme.ts with registerIrisTheme() calling echarts.registerTheme('iris-enterprise', …)
- [X] T008 [P] Create packages/chart-echarts/src/theme/seriesStyles.ts with barVertical, columnGrouped, areaStacked, reportCombo presets per data-model.md EChartsStylePreset
- [X] T009 [P] Update packages/chart-echarts/src/helpers/colorPalette.ts to enterprise 8-color palette from research.md §14 (no hardcoded legacy ECharts colors)
- [X] T010 [P] Update packages/chart-echarts/src/helpers/tooltipFormatters.ts with styled HTML tooltip card, color dot, and Intl.NumberFormat value formatting
- [X] T011 Export theme modules from packages/chart-echarts/src/index.ts

### chart-ui shell components

- [X] T012 [P] Upgrade packages/chart-ui/src/components/ChartContainer.tsx with subtitle, compact mode, showHeaderDivider props per data-model.md ChartShellProps
- [X] T013 [P] Upgrade packages/chart-ui/src/components/ChartEmptyState.tsx with token-aligned muted background and typography
- [X] T014 [P] Upgrade packages/chart-ui/src/components/ChartLoadingOverlay.tsx with shimmer/skeleton overlay using iris tokens
- [X] T015 Update packages/chart-ui/src/theme/ThemeProvider.tsx to map ChartDesignTokens to Ant Design ConfigProvider token overrides per contracts/theme-provider.ts
- [X] T016 Verify packages build with `pnpm run build:packages` from repo root

**Checkpoint**: iris-enterprise theme registers; chartStyleHelpers available; ChartContainer renders elevated card shell

---

## Phase 3: User Story 1 — Polished Data Display Shell (Priority: P1) 🎯 MVP

**Goal**: Empty, loading, and container states match enterprise card aesthetic across all widgets

**Independent Test**: Load widget with empty `jsonData`; verify branded empty state. Load with valid JSON; verify elevated container shell with optional title divider.

### Implementation for User Story 1

- [X] T017 [US1] Wire ChartContainer showHeaderDivider and compact props from showTitle in widgets/ax-barchart/src/main/components/BarChartView.tsx
- [X] T018 [P] [US1] Wire ChartContainer styling props in widgets/ax-columnchart/src/main/components/ColumnChartView.tsx
- [X] T019 [P] [US1] Wire ChartContainer styling props in widgets/ax-stackareachart/src/main/components/StackAreaChartView.tsx
- [X] T020 [P] [US1] Wire ChartContainer styling props in widgets/ax-reportchart/src/main/components/ReportChartView.tsx
- [X] T021 [US1] Ensure all four widget SCSS entry files import configs/widget-styles.scss via `@use` (widgets/ax-*/src/styles/ax-*chart.scss)

**Checkpoint**: All four widgets show consistent enterprise card shell and polished empty/loading states

---

## Phase 4: User Story 2 — Selection Visual Emphasis (Priority: P1)

**Goal**: Selected chart elements visually distinct via opacity dimming and primary-color emphasis

**Independent Test**: Click a bar/column/area segment; verify non-selected elements dim to ~35% opacity and selected element retains full opacity with brand highlight.

### Implementation for User Story 2

- [X] T022 [US2] Implement applySelectionOpacity helper in packages/chart-echarts/src/theme/seriesStyles.ts per data-model.md SelectionVisualState
- [X] T023 [US2] Wire selectedId emphasis into packages/chart-echarts/src/builders/buildBarChartOption.ts via chartStyleHelpers and seriesStyles
- [X] T024 [P] [US2] Wire selectedId emphasis into packages/chart-echarts/src/builders/buildColumnChartOption.ts
- [X] T025 [P] [US2] Wire selectedId emphasis into packages/chart-echarts/src/builders/buildStackAreaChartOption.ts
- [X] T026 [P] [US2] Wire selectedId emphasis into packages/chart-echarts/src/builders/buildReportChartOption.ts

**Checkpoint**: Selection visual feedback consistent across all four chart types (STY-004)

---

## Phase 5: User Story 3 — Bar Chart Visual Polish (Priority: P2)

**Goal**: ax-barchart with vertical bars, rounded tops, single-series gradient, styled axes/tooltip/legend

**Independent Test**: Open ax-barchart in mock-ui; verify enterprise palette, 4px bar top radius, gradient fill, muted grid lines, styled tooltip on hover.

### Implementation for User Story 3

- [X] T027 [US3] Refactor packages/chart-echarts/src/builders/buildBarChartOption.ts to use chartStyleHelpers for grid, axes, legend, tooltip (zero hardcoded hex — STY-002)
- [X] T028 [US3] Apply barVertical preset from seriesStyles.ts in packages/chart-echarts/src/builders/buildBarChartOption.ts
- [X] T029 [US3] Register iris-enterprise theme and pass theme prop in widgets/ax-barchart/src/main/components/BarChartView.tsx
- [X] T030 [US3] Verify widgets/ax-barchart/src/styles/ax-barchart.scss compiles with updated widget-styles.scss

**Checkpoint**: ax-barchart is the styling reference — match patterns in US4–US6

---

## Phase 6: User Story 4 — Column Chart Visual Polish (Priority: P2)

**Goal**: ax-columnchart with grouped columns, multi-series palette, legend pills, styled tooltip

**Independent Test**: Open ax-columnchart in mock-ui; verify grouped columns with gap, distinct series colors, styled axis labels.

### Implementation for User Story 4

- [X] T031 [US4] Refactor packages/chart-echarts/src/builders/buildColumnChartOption.ts to use chartStyleHelpers and columnGrouped preset
- [X] T032 [US4] Register iris-enterprise theme in widgets/ax-columnchart/src/main/components/ColumnChartView.tsx
- [X] T033 [P] [US4] Verify widgets/ax-columnchart/src/styles/ax-columnchart.scss compiles with shared styles

**Checkpoint**: ax-columnchart visually consistent with ax-barchart shell and axis styling (STY-001)

---

## Phase 7: User Story 5 — Stack Area Chart Visual Polish (Priority: P3)

**Goal**: ax-stackareachart with gradient area fills, smooth 2px lines, styled zoom slider and scrollable legend

**Independent Test**: Open ax-stackareachart in mock-ui; verify gradient area opacity 40%→5%, smooth lines, styled dataZoom slider.

### Implementation for User Story 5

- [X] T034 [US5] Refactor packages/chart-echarts/src/builders/buildStackAreaChartOption.ts to use chartStyleHelpers and areaStacked preset
- [X] T035 [US5] Style dataZoom slider colors via chartStyleHelpers in packages/chart-echarts/src/builders/buildStackAreaChartOption.ts
- [X] T036 [US5] Register iris-enterprise theme in widgets/ax-stackareachart/src/main/components/StackAreaChartView.tsx
- [X] T037 [P] [US5] Verify widgets/ax-stackareachart/src/styles/ax-stackareachart.scss compiles with shared styles

**Checkpoint**: ax-stackareachart area gradients and zoom controls match enterprise aesthetic

---

## Phase 8: User Story 6 — Report Chart Visual Polish (Priority: P3)

**Goal**: ax-reportchart with combo bar+line styling, annotation labels on top values, KPI-ready header area

**Independent Test**: Open ax-reportchart in mock-ui; verify combo series styling, value labels, consistent tooltip/legend with other charts.

### Implementation for User Story 6

- [X] T038 [US6] Refactor packages/chart-echarts/src/builders/buildReportChartOption.ts to use chartStyleHelpers and reportCombo preset
- [X] T039 [US6] Register iris-enterprise theme in widgets/ax-reportchart/src/main/components/ReportChartView.tsx
- [X] T040 [P] [US6] Verify widgets/ax-reportchart/src/styles/ax-reportchart.scss compiles with shared styles

**Checkpoint**: All four widgets share identical container, tooltip, axis, and legend styling (STY-001)

---

## Phase 9: Polish & Cross-Cutting Validation

**Purpose**: mock-ui alignment, build verification, and success criteria validation

- [X] T041 [P] Align mock-ui/src/App.css layout and panel styles to iris design tokens
- [X] T042 [P] Update mock-ui/src/App.tsx chart panel classes to use iris BEM modifiers if needed
- [X] T043 Run full build with `pnpm run build:packages && pnpm run build:widgets` from repo root
- [X] T044 Validate STY-001 through STY-007 success criteria from plan.md using quickstart.md styling checklist
- [X] T045 [P] Verify all four widget XML files use defaultValue and required description elements (widgets/ax-*/src/Ax*Chart.xml)
- [X] T046 Confirm CSS bundle size delta ≤ 5 KB gzipped per widget (STY-006)

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Token Foundation)
    └── Phase 2 (ECharts Theme + Chart UI Shell) — BLOCKS all chart styling
            ├── Phase 3 (US1: Display shell)
            ├── Phase 4 (US2: Selection emphasis)
            └── Phase 5 (US3: Bar chart) — styling reference gate
                    ├── Phase 6 (US4: Column chart)
                    ├── Phase 7 (US5: Stack area chart)
                    └── Phase 8 (US6: Report chart)
                            └── Phase 9 (Polish & Validation)
```

### User Story Dependencies

| Story | Priority | Depends On | Independent Test |
|-------|----------|------------|------------------|
| US1 | P1 | Phase 2 | Empty/loading states + container shell on all widgets |
| US2 | P1 | Phase 2 | Click selection → visual dimming + highlight |
| US3 | P2 | Phase 2, US1 shell | ax-barchart enterprise styling in mock-ui |
| US4 | P2 | US3 patterns | ax-columnchart grouped column styling |
| US5 | P3 | US3 patterns | ax-stackareachart gradient areas + zoom |
| US6 | P3 | US3 patterns | ax-reportchart combo styling |

### Parallel Opportunities

- **Phase 1**: T002, T003 in parallel after T001
- **Phase 2**: T008, T009, T010 in parallel; T012, T013, T014 in parallel
- **Phase 3**: T018, T019, T020 in parallel after T017
- **Phase 4**: T024, T025, T026 in parallel after T022–T023
- **Phase 6–8**: Can run in parallel after Phase 5 establishes bar chart styling reference
- **Phase 9**: T041, T042, T045 in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# ECharts theme files in parallel:
T008 seriesStyles.ts in packages/chart-echarts/src/theme/seriesStyles.ts
T009 colorPalette.ts in packages/chart-echarts/src/helpers/colorPalette.ts
T010 tooltipFormatters.ts in packages/chart-echarts/src/helpers/tooltipFormatters.ts

# Chart UI components in parallel:
T012 ChartContainer.tsx in packages/chart-ui/src/components/ChartContainer.tsx
T013 ChartEmptyState.tsx in packages/chart-ui/src/components/ChartEmptyState.tsx
T014 ChartLoadingOverlay.tsx in packages/chart-ui/src/components/ChartLoadingOverlay.tsx
```

---

## Parallel Example: Post Bar-Chart Reference (Phase 6–8)

```bash
# After US3 bar styling complete, three chart types in parallel:
Developer A: Phase 6 — ax-columnchart (T031–T033)
Developer B: Phase 7 — ax-stackareachart (T034–T037)
Developer C: Phase 8 — ax-reportchart (T038–T040)
```

---

## Implementation Strategy

### MVP First (Phase 1 + 2 + US1 + US3)

1. Complete Phase 1: Design token foundation
2. Complete Phase 2: ECharts theme + chart-ui shell (CRITICAL)
3. Complete Phase 3: US1 — polished empty/loading/container on all widgets
4. Complete Phase 5: US3 — ax-barchart as styling reference
5. **STOP and VALIDATE** in mock-ui — first visually polished widget
6. Proceed to US4–US6 and US2 selection emphasis

### Incremental Delivery

1. Tokens + theme → shared visual platform ready
2. US1 shell → all widgets look enterprise-grade even before chart-specific polish
3. US3 bar chart → first fully styled chart (demo-ready)
4. US4/US5/US6 → remaining chart types styled in parallel
5. US2 selection emphasis → interactive polish layer
6. Phase 9 → full validation and build verification

### Suggested Scope for First PR

- Phase 1 + Phase 2 + Phase 3 + Phase 5 (T001–T030)
- Delivers: tokens, theme, shell, and one fully styled reference chart

---

## Notes

- Do NOT put raw ECharts axis/grid/tooltip config in widget components — use chartStyleHelpers only (FR-010)
- Do NOT duplicate hex color values outside configs/chart-design-tokens.scss and irisTokens.ts (STY-002)
- Tailwind `@apply` only in SCSS files, never in TSX
- Functional behavior (data, selection, events) must remain unchanged — styling only
- ax-barchart is the styling reference; match its patterns in US4–US6
- Commit after each phase or logical task group
