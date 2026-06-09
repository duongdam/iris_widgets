# Implementation Plan: Mendix Enterprise Gantt Widget (ax-ganttchart)

**Branch**: `002-enterprise-gantt-widget` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Input**: User request — production-ready `ax-ganttchart` Mendix pluggable widget on DHTMLX Gantt 9.x, datasource-driven, MobX + event bus architecture aligned with existing chart widgets.

**Note**: Phase 1 (this document) covers architecture and design only. Phase 2 implementation is deferred to `/speckit-tasks` + `/speckit-implement`.

---

## Summary

Add `widgets/ax-ganttchart` to the iris-widgets PNPM monorepo as a **datasource-first** enterprise Gantt widget. Unlike chart widgets (JSON string ingestion), the Gantt widget maps Mendix `ListValue` items to an internal `GanttTask[]` model, renders via a single long-lived DHTMLX Gantt instance, and exposes programmatic control through a typed event bus mirroring the chart widget pattern.

**Technical approach**:

1. Scaffold widget package following `ax-barchart` conventions (rollup, eslint, pluggable-widgets-tools 11.8.1).
2. Implement widget-local MobX store, event bus, and Mendix bridge (no shared `chart-core` coupling — Gantt domain is distinct).
3. Centralize DHTMLX lifecycle in `GanttConfiguration.ts` + `TimelineManager.ts` + `ColumnManager.ts`.
4. Map Mendix datasource via `GanttDatasourceAdapter` with configurable attribute keys in XML.
5. Decouple export, fullscreen, and timeline zoom into services invoked by event bus handlers.
6. Style via SCSS overrides on DHTMLX skin + antd `ConfigProvider` theme tokens.

---

## Technical Context

**Language/Version**: TypeScript 5.4 (strict), React 18.2, SCSS

**Primary Dependencies**: dhtmlx-gantt ^9.1.4, antd 6.4.3, mobx 6.16.0, mobx-react-lite 4.1.1, classnames 2.5.1, @mendix/pluggable-widgets-tools 11.8.1

**Storage**: N/A — Mendix datasource supplies data; widget holds in-memory `GanttTask[]`

**Testing**: Jest via pluggable-widgets-tools; unit tests for adapter, store, event bus, timeline manager; manual Studio Pro preview

**Target Platform**: Mendix Studio Pro 10.24.9+, Mendix 11.x forward-compatible

**Project Type**: PNPM monorepo widget package at `widgets/ax-ganttchart`

**Performance Goals**: Smooth scroll at 1,000 tasks; smart rendering + silent parse for 5,000+; incremental `gantt.updateTask` on single-row changes

**Constraints**:

- Widget MUST NOT call external APIs — data only from Mendix datasource
- DHTMLX instance MUST NOT be destroyed on view mode change — scale reconfiguration only
- `autosize` MUST remain `false` (known perf regression at 1,000+ tasks)
- Export via DHTMLX `export_api` plugin (online service default; server URL configurable for enterprise)
- Functional React components only; MobX without decorators

**Scale/Scope**: 1 new widget package (~25 source files), no new shared packages in v1

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| TypeScript strict, React hooks | ✅ PASS | Matches chart widget conventions |
| No global mutable state | ✅ PASS | Per-instance `GanttStore` + `GanttEventBus` |
| Business logic outside UI | ✅ PASS | Services: adapter, export, timeline, fullscreen |
| Mendix 11.x toolchain | ✅ PASS | pluggable-widgets-tools 11.8.1 |
| Independent widget build | ✅ PASS | Own package.json, rollup, .mpk output |
| Datasource-only data (no direct API) | ✅ PASS | FR-001 enforced in adapter layer |
| Preview without datasource | ✅ PASS | Mock tasks in editorPreview |

**Post-design re-check**: ✅ No violations. Complexity Tracking not required.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-enterprise-gantt-widget/
├── plan.md              # This file
├── research.md          # Phase 0 — DHTMLX, datasource, export, performance
├── data-model.md        # Phase 1 — GanttTask, GanttStore, events
├── quickstart.md        # Phase 1 — dev workflow
├── contracts/           # Phase 1 — TypeScript + XML contracts
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
widgets/ax-ganttchart/
├── src/
│   ├── AxGanttChart.tsx                    # Mendix entry — wires provider + view
│   ├── AxGanttChart.xml                    # Widget definition (datasource + mapping)
│   ├── AxGanttChart.editorPreview.tsx      # Studio Pro preview
│   ├── package.xml
│   ├── main/
│   │   ├── components/
│   │   │   ├── AxGanttChartView.tsx        # Observer shell; mounts DHTMLX container
│   │   │   ├── GanttToolbar.tsx            # Optional built-in toolbar (antd)
│   │   │   ├── TimelineManager.ts          # Scale configs per view mode
│   │   │   ├── ColumnManager.ts            # Grid column definitions
│   │   │   └── GanttConfiguration.ts       # DHTMLX init config + plugins
│   │   ├── eventbus/
│   │   │   ├── GanttEventBus.ts
│   │   │   ├── GanttEvents.ts
│   │   │   └── eventTypes.ts
│   │   ├── providers/
│   │   │   ├── GanttProvider.tsx           # Store + bus + bridge context
│   │   │   └── ThemeProvider.tsx           # antd ConfigProvider wrapper
│   │   ├── hooks/
│   │   │   ├── useGanttInstance.ts         # Init once, cleanup on unmount
│   │   │   ├── useDatasourceSync.ts        # ListValue → store.tasks
│   │   │   ├── useSelectionSync.ts         # store ↔ Mendix attributes
│   │   │   └── useEventBusBridge.ts        # Incoming/outgoing event wiring
│   │   └── services/
│   │       ├── GanttDatasourceAdapter.ts   # Mendix item → GanttTask
│   │       ├── ExportService.ts            # PDF/PNG/JPEG/Excel
│   │       ├── FullscreenService.ts        # Browser Fullscreen API
│   │       └── GanttSyncService.ts         # Incremental parse/update
│   ├── preview/
│   │   └── previewConfig.ts                # Mock GanttTask[]
│   ├── stores/
│   │   ├── GanttStore.ts
│   │   └── RootStore.ts                    # Optional facade if multi-store needed
│   ├── styles/
│   │   ├── gantt.scss                      # DHTMLX skin overrides
│   │   ├── hover.scss                      # Cross-highlight rules
│   │   └── variables.scss                  # SCSS tokens
│   └── typings/
│       └── AxGanttChartProps.ts
├── package.json
├── tsconfig.json
├── rollup.config.mjs                       # Reuse configs/widget-rollup.config.mjs
└── .eslintrc.js
```

**Structure Decision**: Widget-local architecture (not `packages/gantt-core` in v1) because Gantt domain (datasource mapping, DHTMLX lifecycle, timeline scales) has no overlap with `chart-core` JSON adapters. Shared patterns (provider, event bus shape, ThemeProvider, preview) mirror chart widgets without forced package extraction.

---

## Phase 1 Design Deliverables

### 1. Architecture Plan

```text
┌──────────────────── Mendix Runtime ────────────────────┐
│  AxGanttChart.xml props                                 │
│    datasource (ListValue)                               │
│    attribute mappings (id, text, dates, …)                │
│    selectedTaskId / selectedPayload (writable)          │
│    onTaskClick / onSelectionChanged (actions)           │
└────────────────────────┬───────────────────────────────┘
                         ▼
              ┌─────────────────────┐
              │   GanttProvider     │
              │  GanttStore (MobX)  │
              │  GanttEventBus      │
              │  WidgetEventBridge  │
              └─────────┬───────────┘
                        ▼
         ┌──────────────────────────────┐
         │  useDatasourceSync           │
         │  GanttDatasourceAdapter      │
         │  ListValue.items → GanttTask[]│
         └──────────────┬───────────────┘
                        ▼
         ┌──────────────────────────────┐
         │  useGanttInstance            │
         │  GanttConfiguration.init()   │
         │  TimelineManager.setMode()   │
         │  GanttSyncService.sync()     │
         └──────────────┬───────────────┘
                        ▼
         ┌──────────────────────────────┐
         │  DHTMLX Gantt (single inst.) │
         │  smart_rendering: true       │
         └──────────────────────────────┘
                        │
         ┌──────────────┴───────────────┐
         ▼                              ▼
  Outgoing events                 Incoming events
  (TASK_SELECTED, …)              (ZOOM_WEEK, EXPORT_PDF, …)
         │                              │
         ▼                              ▼
  Mendix actions / attrs          Dashboard / toolbar widgets
```

**Layer responsibilities**:

| Layer | Responsibility |
|-------|----------------|
| XML / Props | Mendix configuration surface |
| Adapter | Entity-agnostic mapping to `GanttTask` |
| Store | Observable tasks, selection, viewMode, fullscreen, loading |
| Event Bus | Typed pub/sub; no third-party libs |
| Services | Export, fullscreen, incremental sync |
| Managers | Timeline scales, grid columns — pure functions |
| View | DOM mount point, observer re-renders for chrome only |
| Hooks | Glue Mendix props ↔ store ↔ DHTMLX instance |

### 2. XML Design

See [contracts/widget-xml.md](./contracts/widget-xml.md) for full property schema.

**Property groups**: General, Data Source, Mapping, Display, Timeline, Selection, Events.

**Key difference from chart widgets**: `type="datasource"` with `isList="true"` plus `dataSource`-linked attribute properties for field mapping.

### 3. MobX Design

See [contracts/gantt-store.ts](./contracts/gantt-store.ts).

- `GanttStore` with `makeAutoObservable(this)` in constructor
- Computed: `taskById`, `visibleDateRange`, `hasTasks`
- Actions: `setTasks`, `selectTask`, `setViewMode`, `setFullscreen`, `setLoading`
- `RootStore` holds single `GanttStore` instance (extensible for future multi-pane)

### 4. Event Bus Design

See [contracts/event-bus.ts](./contracts/event-bus.ts).

- Mirror `ChartEventBus` API: `emit`, `on`, `off`, `once`, `clear`
- Separate enums: `GanttIncomingEvents` (commands), `GanttOutgoingEvents` (notifications)
- `WidgetEventBridge` maps outgoing events → Mendix actions (same pattern as chart-core)
- `useEventBusBridge` registers incoming command handlers on mount

### 5. Folder Structure

Documented in **Project Structure** above; matches user-specified layout with pragmatic naming (`AxGanttChartView.tsx` vs `AxGanttChart.tsx` split for entry vs view).

### 6. Styling Strategy

See [quickstart.md](./quickstart.md#styling).

- Import DHTMLX base CSS in widget SCSS entry
- Override via `variables.scss` tokens aligned with iris chart design language
- `hover.scss`: `.gantt_row:hover`, `.gantt_task_cell:hover`, cross-highlight via JS-added `.gantt-cross-hover-row` / `.gantt-cross-hover-col` classes
- Today marker: `gantt.config.today_marker = true` + custom `.gantt_marker.today` CSS (thin red `#ff4d4f`)
- Grid: compact row height (32px), subtle borders `#f0f0f0`, header `#fafafa` — Jira/MS Project inspired
- antd toolbar buttons use `ConfigProvider` token overrides in `ThemeProvider`

### 7. Timeline Strategy

See [contracts/timeline-manager.ts](./contracts/timeline-manager.ts).

- `TimelineViewMode`: `day` | `week` | `month` | `quarter`
- `TimelineManager.applyMode(gantt, mode)` updates `gantt.config.scales` array only
- No `gantt.init()` recall; call `gantt.render()` after scale change
- `FIT_TIMELINE` command: `gantt.config.fit_tasks = true` + `gantt.render()`
- `SET_START_DATE` / `SET_END_DATE`: adjust `gantt.config.start_date` / `end_date`
- `SCROLL_TO_TODAY`: `gantt.showDate(new Date())`
- `SCROLL_TO_TASK`: `gantt.showTask(taskId)`

### 8. Export Strategy

See [contracts/export-service.ts](./contracts/export-service.ts).

- `ExportService` interface with `exportPdf`, `exportPng`, `exportJpeg`, `exportExcel`
- Implementation delegates to DHTMLX: `gantt.plugins({ export_api: true })`
- JPEG via `exportToPNG` with format conversion or DHTMLX-supported alias (document in research)
- `server` URL configurable via widget property for on-prem export module
- Event bus `EXPORT_*` → service method; result emitted as outgoing event or download callback
- UI components NEVER import export logic directly

---

## Phase 2 Implementation Scope (Deferred)

When `/speckit-tasks` runs, implementation order:

1. Package scaffold + XML + typings
2. GanttStore + GanttEventBus
3. GanttDatasourceAdapter + useDatasourceSync
4. GanttConfiguration + TimelineManager + useGanttInstance
5. AxGanttChartView + hover/today styling
6. WidgetEventBridge + selection sync
7. Event bus command handlers (zoom, fullscreen, scroll, expand/collapse)
8. ExportService (stub callbacks if export server unavailable in dev)
9. ThemeProvider + optional toolbar
10. Editor preview with mock tasks
11. Performance validation scripts / manual benchmarks

---

## Complexity Tracking

> Not required — no constitution violations.
