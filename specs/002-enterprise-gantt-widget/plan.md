# Implementation Plan: Widget UX Improvements (Cross-Suite)

**Branch**: `001-enterprise-chart-widgets` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)

**Input**: User improvements batch:

1. **ax-combobox** — Replace deprecated antd `dropdownRender` with `popupRender` (Mendix runtime warning).
2. **ax-ganttchart** — Level-2-only `+` add button in grid column; brand color `#009999` for add icon, child count, task bars; fix toolbar expand to advance one hierarchy level per click in Mendix runtime.
3. **ax-barchart** — Category labels below bars slanted upward at clock **1:30** (−45°).
4. **Chart suite** — All four chart widgets (`ax-barchart`, `ax-columnchart`, `ax-stackareachart`, `ax-reportchart`) expose Mendix **command** attribute for fullscreen (mirroring Gantt pattern).

**Note**: Planning only — implementation via `/speckit-tasks` + `/speckit-implement`.

---

## Summary

Polish Mendix runtime UX across form, Gantt, and chart widgets: eliminate antd deprecation warnings, align Gantt visual identity to Iris teal `#009999`, fix progressive tree expand regression after Mendix build, improve bar chart label readability, and extend the proven Gantt command bus pattern to all chart widgets for programmatic fullscreen.

**Technical approach**:

1. **ComboBox** — Rename prop `dropdownRender` → `popupRender` in `ComboBoxView.tsx` and mock-ui demos; no behavior change.
2. **Gantt grid column** — Extend `ColumnManager.renderTextCell` to inject `+` button when `task.$level === 1` (second hierarchy tier, 0-indexed); wire click to new `onAddTask` Mendix action with full row `GanttTask` payload.
3. **Gantt theming** — Introduce `$gantt-brand: #009999` in `variables.scss`; apply to add button, `.gantt-text-cell__count`, default task bar color, and selection accent.
4. **Gantt expand fix** — Add MobX `reaction` / `useEffect` on `store.expandLevel` calling `expandToLevel(gantt, level)` after every level change; preserve expand state across `syncTasks` bulk re-parse; unify `maxExpandLevel` computation between toolbar and `TreeExpandManager`.
5. **Bar chart labels** — Set `axisLabel.rotate: -45` (1:30 slant) in `buildBarChartOption`; increase grid bottom margin when labels are rotated.
6. **Chart fullscreen commands** — Add shared `FullscreenService` + `ChartCommand` enum in `packages/chart-core`; add `command`/`commandPayload` XML properties to each chart widget; handle `ENTER_FULLSCREEN` / `EXIT_FULLSCREEN` via event bus (same clear-after-execute pattern as Gantt).

---

## Technical Context

**Language/Version**: TypeScript 5.4 (strict), React 18.2, SCSS, MobX 6.16

**Primary Dependencies**: antd 6.4.3, dhtmlx-gantt ^9.1.4, echarts 6.1.0, @mendix/pluggable-widgets-tools 11.8.1

**Storage**: N/A (UI/presentation layer)

**Testing**: mock-ui manual verification; Mendix runtime build + Studio Pro preview; console must show zero antd deprecation warnings for ComboBox

**Target Platform**: Mendix pluggable widgets (Studio Pro 10.24.9+), mock-ui (Vite)

**Project Type**: PNPM monorepo — shared packages + multiple Mendix widgets

**Performance Goals**: No additional render loops; expand reaction debounced via MobX; fullscreen uses native Browser Fullscreen API

**Constraints**:

- Gantt `+` button visible **only** at hierarchy level 2 (`$level === 1`, 0-indexed)
- Brand color `#009999` (`#099` shorthand) is single source of truth for Gantt accent elements
- Expand button MUST advance one level per click until fully expanded; MUST NOT disable prematurely in Mendix runtime
- Chart command API MUST mirror Gantt `command` attribute semantics (write command → execute → clear attribute)
- antd 6.x `popupRender` replaces `dropdownRender` without altering Select behavior

**Scale/Scope**: 6 widgets (`ax-combobox`, `ax-ganttchart`, 4 chart widgets), 2 shared packages (`chart-core`, `chart-echarts`), mock-ui demos — ~25 files

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Shared logic in packages, not widgets | ✅ PASS | FullscreenService + ChartCommand in `chart-core`; ECharts rotate in `chart-echarts` |
| No raw ECharts config in widgets | ✅ PASS | Bar label rotation in `buildBarChartOption` only |
| TypeScript strict, React hooks | ✅ PASS | Functional components; MobX `makeAutoObservable` |
| MobX store patterns | ✅ PASS | `expandLevel` reaction in hook layer |
| Mendix datasource — no direct API | ✅ PASS | Add-task fires Mendix action; no REST |
| Independent widget builds | ✅ PASS | Each widget imports shared contracts |

**Post-design re-check**: ✅ No violations. Complexity Tracking not required.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-enterprise-gantt-widget/
├── plan.md              # This file
├── research.md          # Phase 0 — §16–§20 improvement decisions
├── data-model.md        # Phase 1 — GanttAddTaskContext, ChartCommand, brand tokens
├── quickstart.md        # Phase 1 — verification steps for improvements
├── contracts/           # Phase 1
│   ├── event-bus.ts     # + ADD_TASK_REQUESTED outgoing event
│   ├── chart-commands.ts # NEW — shared chart command contract
│   └── gantt-theme.ts   # NEW — brand color tokens
└── tasks.md             # Phase 2 — /speckit-tasks (not created here)
```

### Source Code (repository root)

```text
widgets/ax-combobox/src/main/components/
└── ComboBoxView.tsx              # dropdownRender → popupRender

widgets/ax-ganttchart/src/
├── main/components/
│   ├── ColumnManager.ts          # level-2 + button, child count color
│   └── TreeExpandManager.ts      # expand level sync fix
├── main/hooks/
│   ├── useGanttInstance.ts       # reaction on expandLevel
│   └── useEventBusBridge.ts      # preserve expand after sync
├── styles/
│   └── variables.scss            # $gantt-brand: #009999
└── AxGanttChart.xml              # onAddTask action property

packages/chart-echarts/src/builders/
└── buildBarChartOption.ts        # axisLabel.rotate: -45

packages/chart-core/src/
├── commands/ChartCommand.ts      # NEW
└── services/FullscreenService.ts # NEW (extract from gantt or duplicate thin wrapper)

widgets/ax-{barchart,columnchart,stackareachart,reportchart}/src/
├── Ax*.xml                       # command + commandPayload properties
└── main/hooks/useChartCommandSync.ts  # NEW (shared pattern)

mock-ui/src/demos/
└── CascadingComboboxDemo.tsx     # popupRender migration
```

**Structure Decision**: Gantt-specific UX in `ax-ganttchart`; cross-chart command bus in `chart-core` mirroring existing Gantt command registry pattern.

---

## Phase 0: Research Summary

See [research.md](./research.md) §16–§20 for full decisions:

| Topic | Decision |
|-------|----------|
| antd Select deprecation | Use `popupRender` (antd ≥5.11, required in 6.x) |
| Gantt + button level | Show when `$level === 1` (second tier, 0-indexed) |
| Brand color | `#009999` SCSS variable; override task bar default + UI accents |
| Expand regression root cause | Missing `expandLevel` reaction + tree reset on Mendix datasource re-sync |
| Bar label angle | ECharts `rotate: -45` (= clock 1:30 upward slant) |
| Chart fullscreen | Reuse Browser Fullscreen API; `ENTER_FULLSCREEN` / `EXIT_FULLSCREEN` commands |

---

## Phase 1: Design Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Data model updates | [data-model.md](./data-model.md) | Updated |
| Gantt event bus contract | [contracts/event-bus.ts](./contracts/event-bus.ts) | Updated |
| Chart commands contract | [contracts/chart-commands.ts](./contracts/chart-commands.ts) | Created |
| Gantt theme contract | [contracts/gantt-theme.ts](./contracts/gantt-theme.ts) | Created |
| Developer quickstart | [quickstart.md](./quickstart.md) | Updated |

---

## Implementation Phases (for /speckit-tasks)

### Phase A — Quick fixes (P1)

- T-A1: ComboBox `popupRender` migration + mock-ui
- T-A2: Bar chart label rotation −45° + grid bottom adjustment
- T-A3: Gantt brand color tokens + SCSS application

### Phase B — Gantt grid & expand (P1)

- T-B1: Level-2 `+` button in `ColumnManager` with click handler
- T-B2: `onAddTask` XML property + Mendix action wiring
- T-B3: `expandLevel` MobX reaction + post-sync re-apply
- T-B4: Unify max-expand-level calculation; Mendix runtime verification

### Phase C — Chart fullscreen commands (P2)

- T-C1: `ChartCommand` enum + `FullscreenService` in `chart-core`
- T-C2: `useChartCommandSync` hook shared across 4 chart widgets
- T-C3: XML `command`/`commandPayload` properties per chart widget
- T-C4: mock-ui command buttons for chart fullscreen

---

## Complexity Tracking

> Not required — no constitution violations.
