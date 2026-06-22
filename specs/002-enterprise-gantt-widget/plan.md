# Implementation Plan: AxGanttChart Refactor — Simplified Architecture + Typed Mendix Actions

**Branch**: `001-enterprise-chart-widgets` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

**Input**: Refactor `ax-ganttchart` based on updated `AxGanttChart.xml`, replace unified `eventType`/`eventPayload` bridge with per-action Mendix callbacks, simplify folder structure, use `gantt-test.json` as preview mock data, support unscheduled group rows via DHTMLX `show_unscheduled`.

## Summary

Refactor the Gantt widget from a multi-layer architecture (Provider, hooks, WidgetEventBridge, RootStore, typed enum event bus) into a **flat, KISS structure**:

1. **One MobX store**: `AxGanttStore` (remove `RootStore`, rename `GanttStore`)
2. **One main view**: `AxGanttChartView` — Gantt init, datasource sync, toolbar, and Mendix action dispatch live here or in co-located modules (not split into many tiny components)
3. **One bridge component**: `AxGanttInner` — listens for external Mendix commands (incoming topics on global event bus)
4. **Simple global event bus** — `GlobalKey = "AX_EVENT_BUS"`, API: `emit`, `on`, `removeListener`; helpers: `createBus`, `initEventBus`, `getEventBus`, `emitEvent(topic, event)`
5. **Mendix events** — replace `onEvent` + `eventType` + `eventPayload` with dedicated actions: `onClicked`, `onDoubleClicked`, `onChanged`, `onAdded`, `onDropped`; each writes scalar write-back attributes (`outItemId`, `outType`, optional `outChangedNum`) before `execute()`
6. **Unscheduled groups** — `CUSTOM_GROUP`, `DISTRICT_GROUP` (and mapped legacy `AREA`/`BIZ_LINE`) have no start/end; use DHTMLX `unscheduled: true` + `gantt.config.show_unscheduled = false` per [DHTMLX unscheduled tasks guide](https://docs.dhtmlx.com/gantt/guides/unscheduled-tasks/)
7. **Mock data** — replace hand-written preview tasks with normalized data from [`gantt-test.json`](../../gantt-test.json)

## Technical Context

**Language/Version**: TypeScript strict, React 18.2, Mendix Pluggable Widgets 11.8.1  
**Primary Dependencies**: dhtmlx-gantt ^9.1.4, MobX 6.16, antd 6.4.3, SCSS  
**Storage**: Mendix list datasource (`roadmapItems`); no direct REST  
**Testing**: Jest unit tests in widget package (`pnpm --filter ax-ganttchart test`)  
**Target Platform**: Mendix Studio Pro 10.24.9+, browser runtime  
**Project Type**: Mendix pluggable widget in PNPM monorepo  
**Performance Goals**: Smart rendering at 1,000+ tasks; incremental `gantt.updateTask` on datasource delta  
**Constraints**: Offline-capable; per-widget-instance store; no global mutable app state except scoped event bus singleton  
**Scale/Scope**: ~47 TS files today → target ~25–30 after consolidation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| KISS / Simplicity | ✅ PASS | Refactor explicitly removes over-abstraction |
| MobX `makeAutoObservable` | ✅ PASS | Retained in `AxGanttStore` |
| No global mutable state | ⚠️ JUSTIFIED | Global event bus is intentional for cross-widget Mendix command ingress; scoped by `widgetId` in event payload |
| Functional React + hooks | ✅ PASS | `AxGanttChartView`, `AxGanttInner` only |
| Datasource-only data | ✅ PASS | Runtime uses Mendix list; preview uses `gantt-test.json` |
| SOLID / DRY | ✅ PASS | Consolidate duplicate bridge/hook layers |

**Post-design re-check**: PASS — simplified architecture aligns with constitution simplicity goal.

## Project Structure

### Documentation (this feature)

```text
specs/002-enterprise-gantt-widget/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions
├── data-model.md        # Phase 1 — entities + widget props
├── quickstart.md        # Phase 1 — Mendix integration guide
├── contracts/           # Phase 1 — TypeScript contracts
│   ├── event-bus.ts
│   ├── event-bridge.ts
│   ├── gantt-record.ts
│   ├── gantt-configuration.ts
│   └── datasource-adapter.ts
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (target after refactor)

```text
widgets/ax-ganttchart/src/
├── AxGanttChart.tsx              # ThemeProvider → AxGanttInner
├── AxGanttChart.editorPreview.tsx
├── AxGanttChart.xml              # Fixed datasource refs + new action props
├── typings/AxGanttChartProps.d.ts  # Regenerated from XML
├── main/
│   ├── AxGanttInner.tsx          # NEW: Mendix command listener (event bus in)
│   └── AxGanttChartView.tsx      # Single main view (gantt shell)
├── stores/
│   └── AxGanttStore.ts           # ONLY store (rename from GanttStore)
├── shared/
│   ├── eventBus/
│   │   ├── createBus.ts
│   │   ├── globalScope.ts
│   │   ├── initEventBus.ts
│   │   ├── getEventBus.ts
│   │   └── emitEvent.ts
│   ├── constants/                # layout, task types, dhtmlx defaults
│   ├── converters/
│   ├── utils/                    # mtoDate, gridReorder, ganttTaskTiming
│   └── mock/
│       └── ganttTestData.ts      # Import/normalize gantt-test.json
├── preview/                      # Thin wrapper → ganttTestData
└── styles/gantt.scss
```

**Removed / merged** (do not recreate as separate layers):

- `main/providers/GanttProvider.tsx` → logic moves to `AxGanttChartView` + `AxGanttInner`
- `main/hooks/*` (5 hooks) → inline in view or single `useAxGantt.ts` if needed
- `main/services/WidgetEventBridge.ts` → replaced by direct action dispatch
- `stores/RootStore.ts` → delete
- `main/eventbus/GanttEventBus.ts` + `eventTypes.ts` enum explosion → simple topic bus

**Structure Decision**: Keep supporting modules (`ColumnManager`, `TimelineManager`, `MtoMarker`, `TodayMarker`, `MendixTaskAdapter`) as plain TS modules imported by `AxGanttChartView` — not React components.

## Phase 0 — Research Summary

See [research.md](./research.md) for full decisions. Key resolutions:

| Unknown | Decision |
|---------|----------|
| Tasks without start/end | DHTMLX `unscheduled: true` on task; `show_unscheduled: false` in config |
| Required startDate validation | Remove global requirement; only TASK/SUB_TASK with dates render bars; groups always unscheduled |
| Mendix event exposure | Per-action write-back attrs, not JSON payload |
| `changedNum` | Integer month delta: `round((newStart - oldStart) / ~30 days)` signed |
| Mock data | Normalize `gantt-test.json` types: AREA→DISTRICT_GROUP, BIZ_LINE→CUSTOM_GROUP |
| Expression props | Add explicit return types where Mendix requires them (Boolean/String/Integer) |

## Phase 1 — Design Summary

See [data-model.md](./data-model.md) and [contracts/](./contracts/).

### Widget XML fixes (AxGanttChart.xml)

| Issue | Fix |
|-------|-----|
| `dataSource="tasksDatasource"` on attributes | Change to `dataSource="roadmapItems"` |
| Duplicate `hasTuningAttribute` (lines 186–198) | Remove duplicate block |
| `onEvent` + `eventType` + `eventPayload` | Remove; add `onClicked`, `onDoubleClicked`, `onChanged`, `onAdded`, `onDropped` |
| Missing write-back attrs for actions | Add `outItemId`, `outType`, `outChangedNum` (attribute, out) |
| Expression props without return type | Add `<returnType assignableTo="Boolean" />` / `String` / `Integer` as appropriate |
| `parentIdAttribute` vs `groupAttribute` | Document: `parentIdAttribute` = tree parent; `groupAttribute` = business grouping key |

### Mendix action contract (temporary Phase 1 set)

| Action | Write-back before execute | When fired |
|--------|---------------------------|------------|
| `onClicked` | `outItemId`, `outType` | Click task row/bar |
| `onDoubleClicked` | `outItemId`, `outType` | Double-click row/bar |
| `onChanged` | `outItemId`, `outType`, `outChangedNum` | After timeline drag/resize (month delta) |
| `onAdded` | `outItemId`, `outType` | (+) button on eligible row |
| `onDropped` | `outItemId`, `outType` | Grid row reorder to new parent |

### Task type taxonomy

| Type | Has timeline bar | Dates required | DHTMLX flags |
|------|------------------|----------------|--------------|
| `DISTRICT_GROUP` (L1) | No (grid only) | No | `unscheduled: true`, `$level 0` |
| `CUSTOM_GROUP` (L2) | No | No | `unscheduled: true`, `$level 1` |
| `TASK` | Yes | Yes (or unscheduled fallback) | MTO/K/O milestone logic |
| `SUB_TASK` | Yes | Yes | Same as TASK |

Legacy mock mapping from `gantt-test.json`: `AREA` → `DISTRICT_GROUP`, `BIZ_LINE` → `CUSTOM_GROUP`.

### DHTMLX config inventory

Full list of `gantt.config.*` options from dhtmlx-gantt 9.1.4 — see [research.md §6](./research.md). Widget currently sets:

```typescript
// Currently applied in initGantt + TimelineManager + ganttLayout
date_format, smart_rendering, branch_loading, scroll_on_click, autosize,
row_height, bar_height, scale_height, min_column_width, column_width,
show_progress, show_grid, show_chart, fit_tasks, start_on_monday,
xml_date, show_links, drag_links, show_task_cells (>500 tasks),
scales, start_date, end_date, readonly, drag_move, drag_resize,
drag_progress, details_on_create, details_on_dblclick
```

**New configs for this refactor**:

```typescript
gantt.config.show_unscheduled = false;  // show unscheduled rows in timeline area
// Per-task: { unscheduled: true } for group types without dates
```

### Event bus API

```typescript
export const AX_EVENT_BUS_KEY = "AX_EVENT_BUS";

export interface AxEvent {
  widgetId: string;
  [key: string]: unknown;
}

export interface AxEventBus {
  emit(topic: string, event: AxEvent): void;
  on(topic: string, handler: (event: AxEvent) => void): () => void;
  removeListener(topic: string, handler: (event: AxEvent) => void): void;
}

// createBus(), initEventBus(), getEventBus(), emitEvent(topic, event)
```

Incoming topics (Mendix → widget via `AxGanttInner`): `REFRESH`, `ZOOM_*`, `ENTER_FULLSCREEN`, etc.  
Outgoing topics (widget → dashboard): optional; Mendix actions are primary outbound path.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Global event bus singleton | Mendix pages send commands via separate nanoflows/toolbars without prop drilling | React context alone cannot receive external Mendix attribute changes from sibling widgets |
| Keep ColumnManager/TimelineManager modules | DHTMLX setup is inherently complex | Inlining 800+ lines into one JSX file hurts maintainability |

## Next Steps

Run `/speckit-tasks` then `/speckit-implement` for Phase 2 execution.
