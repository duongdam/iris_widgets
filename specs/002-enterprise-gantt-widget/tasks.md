---
description: "Task list for Mendix Enterprise Gantt Widget (ax-ganttchart)"
---

# Tasks: Mendix Enterprise Gantt Widget (ax-ganttchart)

**Input**: Design documents from `/specs/002-enterprise-gantt-widget/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in spec. Manual validation via dev server, Studio Pro preview, and quickstart.md performance checklist.

**Organization**: Tasks grouped by user story (US1–US8) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1–US8) for story phases only
- All descriptions include exact file paths

## Path Conventions

- **Widget root**: `widgets/ax-ganttchart/`
- **Source**: `widgets/ax-ganttchart/src/`
- **Contracts reference**: `specs/002-enterprise-gantt-widget/contracts/`
- **Shared configs**: `configs/widget-rollup.config.mjs`, `configs/eslint.widget.js`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold `ax-ganttchart` package in PNPM monorepo following `ax-barchart` conventions

- [X] T001 Create widgets/ax-ganttchart/ directory tree per plan.md (src/main/components, src/main/eventbus, src/main/providers, src/main/hooks, src/main/services, src/stores, src/styles, src/preview, src/typings)
- [X] T002 Create widgets/ax-ganttchart/package.json with dhtmlx-gantt ^9.1.4, antd 6.4.3, mobx 6.16.0, mobx-react-lite 4.1.1, classnames 2.5.1, @mendix/pluggable-widgets-tools 11.8.1, developmentPort 3004
- [X] T003 [P] Create widgets/ax-ganttchart/tsconfig.json mirroring widgets/ax-barchart/tsconfig.json with strict mode enabled
- [X] T004 [P] Create widgets/ax-ganttchart/rollup.config.mjs re-exporting configs/widget-rollup.config.mjs
- [X] T005 [P] Create widgets/ax-ganttchart/.eslintrc.js and widgets/ax-ganttchart/prettier.config.js mirroring ax-barchart widget configs
- [X] T006 Add dev:ganttchart script to root package.json (`pnpm --filter ax-ganttchart run start`) and verify widgets/ax-ganttchart is included in PNPM workspace
- [X] T007 [P] Create widgets/ax-ganttchart/src/package.xml with Mendix marketplace metadata

**Checkpoint**: `pnpm install` succeeds; `pnpm --filter ax-ganttchart run start` launches dev server on port 3004

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, MobX store, event bus, provider, theme, XML, and props — MUST complete before user story work

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

- [X] T008 [P] Create widgets/ax-ganttchart/src/main/eventbus/eventTypes.ts with GanttTask, TimelineViewMode, GanttIncomingEvents, GanttOutgoingEvents per specs/002-enterprise-gantt-widget/contracts/gantt-record.ts and event-bus.ts
- [X] T009 [P] Implement GanttEventBusImpl in widgets/ax-ganttchart/src/main/eventbus/GanttEventBus.ts with emit/on/off/once/clear mirroring packages/chart-core/src/eventbus/ChartEventBus.ts
- [X] T010 [P] Create widgets/ax-ganttchart/src/main/eventbus/GanttEvents.ts re-exporting event enums and payload types from eventTypes.ts
- [X] T011 Implement GanttStore in widgets/ax-ganttchart/src/stores/GanttStore.ts using makeAutoObservable() per specs/002-enterprise-gantt-widget/contracts/gantt-store.ts and data-model.md
- [X] T012 [P] Create widgets/ax-ganttchart/src/stores/RootStore.ts facade holding GanttStore instance
- [X] T013 [P] Implement ThemeProvider in widgets/ax-ganttchart/src/main/providers/ThemeProvider.tsx wrapping antd ConfigProvider per specs/002-enterprise-gantt-widget/contracts/theme-provider.ts
- [X] T014 Implement GanttProvider in widgets/ax-ganttchart/src/main/providers/GanttProvider.tsx creating per-instance store, eventBus, and widgetId context (mirror widgets/ax-barchart/src/main/providers/BarChartProvider.tsx pattern)
- [X] T015 Create widgets/ax-ganttchart/src/AxGanttChart.xml with datasource, mapping, display, timeline, selection, and events property groups per specs/002-enterprise-gantt-widget/contracts/widget-xml.md
- [X] T016 [P] Create widgets/ax-ganttchart/src/typings/AxGanttChartProps.ts with ListValue, ListAttributeValue, EditableValue, and ActionValue interfaces per widget-xml.md Mendix props contract
- [X] T017 [P] Create widgets/ax-ganttchart/src/styles/variables.scss with iris-aligned SCSS tokens (row height, borders, hover colors, today marker color)
- [X] T018 Create stub widgets/ax-ganttchart/src/AxGanttChart.tsx entry wiring ThemeProvider → GanttProvider → placeholder view

**Checkpoint**: Widget compiles with XML and typings; GanttStore and GanttEventBus unit-testable in isolation

---

## Phase 3: User Story 1 — Render Gantt from Mendix Datasource (Priority: P1) 🎯 MVP

**Goal**: Mendix list datasource maps to GanttTask[] and renders grid + timeline via DHTMLX without direct API calls

**Independent Test**: Deploy with database datasource of 50+ tasks; verify hierarchy renders. Empty datasource shows empty state. Loading status shows overlay.

### Implementation for User Story 1

- [X] T019 [US1] Implement GanttDatasourceAdapter in widgets/ax-ganttchart/src/main/services/GanttDatasourceAdapter.ts mapping ListValue items to GanttTask[] per specs/002-enterprise-gantt-widget/contracts/datasource-adapter.ts
- [X] T020 [US1] Implement useDatasourceSync hook in widgets/ax-ganttchart/src/main/hooks/useDatasourceSync.ts syncing datasource status/items to GanttStore.tasks and GanttStore.loading
- [X] T021 [P] [US1] Implement ColumnManager in widgets/ax-ganttchart/src/main/components/ColumnManager.ts defining default grid columns (text, start_date, duration, progress)
- [X] T022 [US1] Implement GanttConfiguration in widgets/ax-ganttchart/src/main/components/GanttConfiguration.ts with init(), enablePlugins(), smart_rendering, autosize:false, and display config per specs/002-enterprise-gantt-widget/contracts/gantt-configuration.ts
- [X] T023 [US1] Implement TimelineManager in widgets/ax-ganttchart/src/main/components/TimelineManager.ts with getScales() and applyMode() per specs/002-enterprise-gantt-widget/contracts/timeline-manager.ts
- [X] T024 [US1] Implement GanttSyncService in widgets/ax-ganttchart/src/main/services/GanttSyncService.ts with bulk silent parse and clearAll+parse path per data-model.md DHTMLX Sync Model
- [X] T025 [US1] Implement useGanttInstance hook in widgets/ax-ganttchart/src/main/hooks/useGanttInstance.ts — single init on mount, cleanup on unmount, no re-init on prop changes
- [X] T026 [US1] Implement AxGanttChartView in widgets/ax-ganttchart/src/main/components/AxGanttChartView.tsx with DHTMLX mount ref, loading overlay, and empty state (antd Spin + Empty)
- [X] T027 [P] [US1] Create widgets/ax-ganttchart/src/styles/gantt.scss importing dhtmlx-gantt CSS and applying base skin overrides
- [X] T028 [US1] Wire AxGanttChart.tsx entry to render AxGanttChartView with datasource props and display flags from widgets/ax-ganttchart/src/AxGanttChart.tsx
- [X] T029 [US1] Connect useDatasourceSync → GanttStore → GanttSyncService → DHTMLX render pipeline in AxGanttChartView.tsx

**Checkpoint**: Runtime widget renders tasks from Mendix datasource; loading and empty states work without crash (FR-001, FR-002, FR-003)

---

## Phase 4: User Story 2 — Task Selection and Mendix Actions (Priority: P1)

**Goal**: Task click writes selectedTaskId/selectedPayload to Mendix and fires onSelectionChanged / onTaskClick actions

**Independent Test**: Click a task; verify writable attributes update, TASK_SELECTED event emits, onSelectionChanged executes. Metadata preserved in payload.

### Implementation for User Story 2

- [X] T030 [US2] Implement WidgetEventBridge in widgets/ax-ganttchart/src/main/services/WidgetEventBridge.ts mapping outgoing events to Mendix actions (mirror packages/chart-core/src/eventbus/widgetEventBridge.ts)
- [X] T031 [US2] Implement useSelectionSync hook in widgets/ax-ganttchart/src/main/hooks/useSelectionSync.ts writing selectedTaskId and selectedPayload JSON to Mendix EditableValue attributes
- [X] T032 [US2] Attach onTaskClick native handler in GanttConfiguration.attachNativeEvents() calling bridge.handleTaskClick and store.selectTask in widgets/ax-ganttchart/src/main/components/GanttConfiguration.ts
- [X] T033 [US2] Emit GanttOutgoingEvents.TASK_SELECTED and GanttOutgoingEvents.TASK_CLICKED from WidgetEventBridge with full GanttTask payload including metadata
- [X] T034 [US2] Wire onSelectionChanged Mendix action execution in WidgetEventBridge.handleSelectionChanged in widgets/ax-ganttchart/src/main/services/WidgetEventBridge.ts
- [X] T035 [US2] Integrate useSelectionSync and WidgetEventBridge into GanttProvider and AxGanttChartView.tsx

**Checkpoint**: Selection lifecycle complete — click → store → Mendix attrs → actions → event bus (FR-004, User Story 2 acceptance scenarios)

---

## Phase 5: User Story 3 — Timeline View Modes (Priority: P2)

**Goal**: Day/Week/Month/Quarter switching via scale reconfiguration only; no Gantt reinitialization

**Independent Test**: Change defaultViewMode in Studio Pro and fire ZOOM_* via event bus; verify scales update, VIEW_CHANGED/TIMELINE_CHANGED emit, no destructor call.

### Implementation for User Story 3

- [X] T036 [US3] Complete TimelineManager scale presets for day, week, month, quarter modes in widgets/ax-ganttchart/src/main/components/TimelineManager.ts
- [X] T037 [US3] Initialize GanttStore.viewMode from defaultViewMode prop on mount in widgets/ax-ganttchart/src/main/hooks/useGanttInstance.ts
- [X] T038 [P] [US3] Create GanttToolbar in widgets/ax-ganttchart/src/main/components/GanttToolbar.tsx with antd Button/Segmented view mode controls (visible when showToolbar=true)
- [X] T039 [US3] Wire GanttToolbar mode changes to TimelineManager.applyMode() and GanttStore.setViewMode() in AxGanttChartView.tsx
- [X] T040 [US3] Emit GanttOutgoingEvents.VIEW_CHANGED and GanttOutgoingEvents.TIMELINE_CHANGED from WidgetEventBridge on view mode change in widgets/ax-ganttchart/src/main/services/WidgetEventBridge.ts

**Checkpoint**: All four view modes switch smoothly without gantt.destructor() (FR-006)

---

## Phase 6: User Story 4 — Event Bus Programmatic Control (Priority: P2)

**Goal**: External widgets send 22 incoming commands; Gantt responds and emits outgoing notifications

**Independent Test**: Publish REFRESH, EXPAND_ALL, ENTER_FULLSCREEN, SCROLL_TO_TASK via event bus; verify store and Gantt state update correctly.

### Implementation for User Story 4

- [X] T041 [US4] Implement useEventBusBridge hook in widgets/ax-ganttchart/src/main/hooks/useEventBusBridge.ts registering all GanttIncomingEvents handlers on mount with cleanup on unmount
- [X] T042 [P] [US4] Implement FullscreenService in widgets/ax-ganttchart/src/main/services/FullscreenService.ts using Browser Fullscreen API with fullscreenchange listener
- [X] T043 [US4] Wire ENTER_FULLSCREEN and EXIT_FULLSCREEN commands to FullscreenService and GanttStore.setFullscreen() with FULLSCREEN_CHANGED emit in useEventBusBridge.ts
- [X] T044 [US4] Implement REFRESH and LOAD_DATA handlers triggering datasource re-sync via useDatasourceSync in widgets/ax-ganttchart/src/main/hooks/useEventBusBridge.ts
- [X] T045 [US4] Implement EXPAND_ALL and COLLAPSE_ALL handlers using gantt.eachTask open/close in useEventBusBridge.ts
- [X] T046 [US4] Implement SCROLL_TO_TODAY, SCROLL_TO_TASK, FIT_TIMELINE, SET_START_DATE, SET_END_DATE handlers delegating to TimelineManager in useEventBusBridge.ts
- [X] T047 [US4] Implement SHOW_GRID, HIDE_GRID, SHOW_TIMELINE, HIDE_TIMELINE handlers updating GanttStore and gantt.config layout in useEventBusBridge.ts
- [X] T048 [US4] Wire ZOOM_DAY, ZOOM_WEEK, ZOOM_MONTH, ZOOM_QUARTER commands to TimelineManager.applyMode() in useEventBusBridge.ts

**Checkpoint**: All 22 incoming events handled; fullscreen, scroll, zoom, grid/timeline toggle verified (FR-005, FR-007)

---

## Phase 7: User Story 5 — Enterprise Visual Design (Priority: P2)

**Goal**: Cross-highlight hover, today marker, and polished enterprise grid styling

**Independent Test**: Hover rows/cells — row #fff8cc and column #fffbe6 highlight. Today marker visible as thin red line while scrolling.

### Implementation for User Story 5

- [X] T049 [P] [US5] Create widgets/ax-ganttchart/src/styles/hover.scss with .gantt-cross-hover-row (#fff8cc) and .gantt-cross-hover-col (#fffbe6) rules per plan.md styling strategy
- [X] T050 [US5] Implement onMouseMove cross-highlight handler in GanttConfiguration.attachNativeEvents() toggling row/column CSS classes with 16ms debounce in widgets/ax-ganttchart/src/main/components/GanttConfiguration.ts
- [X] T051 [US5] Enable gantt.config.today_marker and style .gantt_marker.today in widgets/ax-ganttchart/src/styles/gantt.scss (1px #ff4d4f) gated by showTodayMarker prop
- [X] T052 [P] [US5] Apply enterprise grid polish in widgets/ax-ganttchart/src/styles/gantt.scss — 32px row height, #f0f0f0 borders, #fafafa header per plan.md
- [X] T053 [US5] Import hover.scss and variables.scss from widgets/ax-ganttchart/src/styles/gantt.scss entry; apply ThemeProvider token overrides to GanttToolbar in AxGanttChartView.tsx

**Checkpoint**: Visual acceptance — cross-highlight, today marker, grid polish (FR-008, FR-009, FR-013)

---

## Phase 8: User Story 6 — Large Dataset Performance (Priority: P3)

**Goal**: Smooth scrolling at 1,000+ tasks; incremental single-task updates without full re-parse

**Independent Test**: Load 100/500/1000/5000 mock tasks; verify scroll responsiveness and single-task update via gantt.updateTask.

### Implementation for User Story 6

- [X] T054 [US6] Enforce smart_rendering:true and autosize:false in GanttConfiguration.init() per research.md §4 in widgets/ax-ganttchart/src/main/components/GanttConfiguration.ts
- [X] T055 [US6] Implement gantt.silent(() => parse()) bulk load path in GanttSyncService.sync() in widgets/ax-ganttchart/src/main/services/GanttSyncService.ts
- [X] T056 [US6] Implement incremental diff sync using gantt.updateTask and gantt.batchUpdate for single-task datasource changes in widgets/ax-ganttchart/src/main/services/GanttSyncService.ts
- [X] T057 [P] [US6] Add generateLargeMockTasks(count) helper in widgets/ax-ganttchart/src/preview/previewConfig.ts for manual performance benchmarking
- [X] T058 [US6] Disable row animation above 500 tasks in GanttConfiguration.init() based on task count threshold

**Checkpoint**: 1,000-task dataset scrolls smoothly; single-row datasource edit triggers updateTask only (FR-011, NFR-003)

---

## Phase 9: User Story 7 — Export Architecture (Priority: P3)

**Goal**: PDF/PNG/JPEG/Excel export via service layer triggered by event bus; no export logic in UI components

**Independent Test**: Fire EXPORT_PDF and EXPORT_PNG via event bus; verify ExportService delegates to DHTMLX export_api. Network failure surfaces error without crash.

### Implementation for User Story 7

- [X] T059 [US7] Implement ExportService in widgets/ax-ganttchart/src/main/services/ExportService.ts with exportPdf, exportPng, exportJpeg, exportExcel per specs/002-enterprise-gantt-widget/contracts/export-service.ts
- [X] T060 [US7] Enable export_api plugin in GanttConfiguration.enablePlugins() in widgets/ax-ganttchart/src/main/components/GanttConfiguration.ts
- [X] T061 [US7] Wire EXPORT_PDF, EXPORT_PNG, EXPORT_JPEG, EXPORT_EXCEL incoming events to ExportService in widgets/ax-ganttchart/src/main/hooks/useEventBusBridge.ts
- [X] T062 [US7] Pass exportServerUrl widget prop to ExportService default server URL in widgets/ax-ganttchart/src/AxGanttChart.tsx
- [X] T063 [US7] Handle export errors gracefully (network failure) returning error in event payload without widget crash in widgets/ax-ganttchart/src/main/services/ExportService.ts

**Checkpoint**: Export commands work via event bus only; UI components have zero export imports (FR-012)

---

## Phase 10: User Story 8 — Studio Pro Preview (Priority: P3)

**Goal**: Studio Pro preview renders mock Gantt hierarchy without datasource binding

**Independent Test**: Open widget in Studio Pro design mode; mock tasks, toolbar, grid, and timeline visible. Height and view mode prop changes reflect in preview.

### Implementation for User Story 8

- [X] T064 [P] [US8] Create widgets/ax-ganttchart/src/preview/previewConfig.ts with mock GanttTask[] hierarchy (parent/child, mixed types, progress values)
- [X] T065 [US8] Implement AxGanttChart.editorPreview.tsx with preview props bypassing datasource (mirror widgets/ax-barchart/src/AxBarChart.editorPreview.tsx pattern) in widgets/ax-ganttchart/src/AxGanttChart.editorPreview.tsx
- [X] T066 [US8] Add preview-only code path in GanttProvider injecting mock tasks into GanttStore when preview mode detected in widgets/ax-ganttchart/src/main/providers/GanttProvider.tsx
- [X] T067 [US8] Verify preview reflects height and defaultViewMode property changes in widgets/ax-ganttchart/src/AxGanttChart.editorPreview.tsx

**Checkpoint**: Studio Pro preview renders without datasource (FR-010)

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Build verification, release artifact, documentation, and acceptance validation

- [X] T068 Run pnpm --filter ax-ganttchart run lint and fix any issues in widgets/ax-ganttchart/
- [X] T069 Run pnpm --filter ax-ganttchart run build and verify dist/ output succeeds
- [X] T070 Run pnpm --filter ax-ganttchart run release and verify .mpk artifact in widgets/ax-ganttchart/dist/
- [X] T071 [P] Validate all acceptance scenarios from spec.md against implemented widget (document results in specs/002-enterprise-gantt-widget/quickstart.md)
- [X] T072 [P] Attach onTaskDoubleClick, onTaskCreated, onTaskUpdated, onTaskDeleted native handlers and bridge methods in widgets/ax-ganttchart/src/main/components/GanttConfiguration.ts and WidgetEventBridge.ts
- [X] T073 Verify no direct API/REST calls exist in widgets/ax-ganttchart/src/ (FR-001 compliance grep check)

**Checkpoint**: Widget builds, releases as .mpk, and passes spec acceptance checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — **MVP**
- **US2 (Phase 4)**: Depends on US1 (needs rendered Gantt + click targets)
- **US3 (Phase 5)**: Depends on US1 (needs live Gantt instance)
- **US4 (Phase 6)**: Depends on US1 + US3 (handlers call TimelineManager and sync)
- **US5 (Phase 7)**: Depends on US1 (needs Gantt DOM for hover/marker CSS)
- **US6 (Phase 8)**: Depends on US1 (optimizes sync path built in US1)
- **US7 (Phase 9)**: Depends on US1 + US4 (export wired through event bus bridge)
- **US8 (Phase 10)**: Depends on Phase 2 + US1 view components (can parallel after US1)
- **Polish (Phase 11)**: Depends on all desired user stories

### User Story Dependency Graph

```text
Phase 1 Setup → Phase 2 Foundational
                      ↓
                 US1 (MVP) 🎯
                ↙   ↓   ↓   ↘
            US2   US3  US5  US8
                    ↓
                   US4
                    ↓
              US6, US7
                    ↓
                 Polish
```

### Within Each User Story

- Services before hooks that consume them
- Managers/config before useGanttInstance
- Hooks before view integration
- View integration before event bus wiring (US4+)

### Parallel Opportunities

- **Phase 1**: T003, T004, T005, T007 in parallel after T001
- **Phase 2**: T008–T010, T012–T013, T016–T017 in parallel after T001
- **US1**: T021, T027 in parallel while T019–T020 proceed
- **US3**: T038 (GanttToolbar) parallel with T036–T037
- **US4**: T042 (FullscreenService) parallel with T041
- **US5**: T049, T052 in parallel
- **US6**: T057 parallel with T054–T056
- **US8**: T064 parallel with US1 late tasks (preview config has no runtime dependency)
- **Polish**: T071, T072 in parallel

---

## Parallel Example: User Story 1

```bash
# After T019–T020 (adapter + hook) start, launch in parallel:
Task T021: "ColumnManager in widgets/ax-ganttchart/src/main/components/ColumnManager.ts"
Task T027: "gantt.scss in widgets/ax-ganttchart/src/styles/gantt.scss"

# Core chain (sequential):
T022 GanttConfiguration → T023 TimelineManager → T024 GanttSyncService → T025 useGanttInstance → T026 AxGanttChartView → T029 pipeline wire
```

---

## Parallel Example: Foundational Phase

```bash
# Launch together after T001 package scaffold:
Task T008: "eventTypes.ts"
Task T009: "GanttEventBus.ts"
Task T010: "GanttEvents.ts"
Task T012: "RootStore.ts"
Task T013: "ThemeProvider.tsx"
Task T016: "AxGanttChartProps.ts"
Task T017: "variables.scss"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T007)
2. Complete Phase 2: Foundational (T008–T018)
3. Complete Phase 3: User Story 1 (T019–T029)
4. **STOP and VALIDATE**: Deploy with Mendix datasource; verify render, loading, empty states
5. Demo MVP Gantt before selection or event bus work

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Datasource Gantt renders → **MVP**
3. US2 → Selection + Mendix actions
4. US3 + US5 → Timeline modes + visual polish (can overlap)
5. US4 → Full event bus command surface
6. US6 + US7 → Performance + export
7. US8 → Studio Pro preview
8. Polish → Build, release, acceptance

### Suggested MVP Scope

**User Story 1 only** (Phases 1–3, T001–T029): Delivers datasource-driven Gantt render — the minimum viable widget.

### Task Count Summary

| Phase | Story | Tasks | Parallel tasks |
|-------|-------|-------|----------------|
| 1 Setup | — | 7 | 4 |
| 2 Foundational | — | 11 | 7 |
| 3 US1 Datasource | P1 | 11 | 2 |
| 4 US2 Selection | P1 | 6 | 0 |
| 5 US3 Timeline | P2 | 5 | 1 |
| 6 US4 Event Bus | P2 | 8 | 1 |
| 7 US5 Visual | P2 | 5 | 2 |
| 8 US6 Performance | P3 | 5 | 1 |
| 9 US7 Export | P3 | 5 | 0 |
| 10 US8 Preview | P3 | 4 | 1 |
| 11 Polish | — | 6 | 2 |
| **Total** | | **73** | **21** |

---

## Notes

- [P] tasks = different files, no incomplete dependencies
- [Story] label maps to spec.md user stories US1–US8
- US2 depends on US1; US4 depends on US1 + US3; most other stories depend only on US1
- US8 can start after US1 view exists (T026) even though spec priority is P3
- Commit after each phase checkpoint
- Run `pnpm --filter ax-ganttchart run build` after Phases 3, 6, and 11

---

# Improvement Batch (2026-06-15)

**Input**: plan.md improvement section, spec.md User Stories 9–13 (FR-015–FR-021)

**Prerequisites**: Original Gantt widget (US1–US8) complete — Phases 1–11 above

**Tests**: Not explicitly requested. Manual validation per specs/002-enterprise-gantt-widget/quickstart.md § Improvement Batch Verification.

**Organization**: Tasks grouped by User Stories US9–US13

---

## Phase 12: User Story 9 — ComboBox antd Deprecation Fix (Priority: P1)

**Goal**: Eliminate Mendix runtime warning by migrating `dropdownRender` → `popupRender`

**Independent Test**: Open ComboBox in mock-ui Form tab; DevTools console shows zero `dropdownRender is deprecated` warnings; Select-all UX unchanged

### Implementation for User Story 9

- [X] T074 [P] [US9] Replace `dropdownRender` with `popupRender` in widgets/ax-combobox/src/main/components/ComboBoxView.tsx
- [X] T075 [P] [US9] Replace `dropdownRender` with `popupRender` in mock-ui/src/demos/CascadingComboboxDemo.tsx

**Checkpoint**: `pnpm --filter ax-combobox run build` succeeds; Select-all dropdown works in mock-ui

---

## Phase 13: User Story 10 — Gantt Level-2 Add Button & Brand Color (Priority: P1)

**Goal**: Teal `#009999` brand identity; `+` button only on level-2 rows; `onAddTask` Mendix action on click

**Independent Test**: mock-ui Gantt tab — Phase rows show teal `+`; child counts and task bars use `#009999`; click `+` fires action with row JSON

### Implementation for User Story 10

- [X] T076 [P] [US10] Add `$gantt-brand`, `$gantt-brand-hover`, `$gantt-brand-muted` tokens to widgets/ax-ganttchart/src/styles/variables.scss per specs/002-enterprise-gantt-widget/contracts/gantt-theme.ts
- [X] T077 [P] [US10] Style `.gantt-text-cell__count` and `.gantt-add-btn` with brand tokens in widgets/ax-ganttchart/src/styles/gantt.scss
- [X] T078 [P] [US10] Update default task bar colors (`.gantt-type-task`, `.gantt-type-project`) to `$gantt-brand` in widgets/ax-ganttchart/src/styles/gantt.scss
- [X] T079 [US10] Render level-2 `+` button in `renderTextCell` when `task.$level === 1` in widgets/ax-ganttchart/src/main/components/ColumnManager.ts
- [X] T080 [US10] Attach delegated click handler for `.gantt-add-btn` in `GanttConfiguration.attachNativeEvents()` in widgets/ax-ganttchart/src/main/components/GanttConfiguration.ts
- [X] T081 [US10] Add `ADD_TASK_REQUESTED` to `GanttOutgoingEvents` and `AddTaskRequestedData` in widgets/ax-ganttchart/src/main/eventbus/eventTypes.ts
- [X] T082 [US10] Implement `handleAddTaskRequested` executing `onAddTask` Mendix action in widgets/ax-ganttchart/src/main/services/WidgetEventBridge.ts
- [X] T083 [US10] Add `onAddTask` action property in widgets/ax-ganttchart/src/AxGanttChart.xml and wire in widgets/ax-ganttchart/src/typings/AxGanttChartProps.ts

**Checkpoint**: Brand colors visible; `+` only on `$level === 1` rows; Mendix action receives full task payload

---

## Phase 14: User Story 11 — Gantt Progressive Expand Fix (Priority: P1)

**Goal**: Toolbar expand advances one hierarchy level per click; state preserved after Mendix datasource re-sync

**Independent Test**: Collapsed 4-level Gantt → click expand N times → each click reveals next level; after datasource refresh expand level preserved

### Implementation for User Story 11

- [X] T084 [US11] Add MobX `reaction` on `store.expandLevel` calling `expandToLevel(gantt, level)` in widgets/ax-ganttchart/src/main/hooks/useGanttInstance.ts
- [X] T085 [US11] Re-apply `expandToLevel(gantt, store.expandLevel)` after `syncTasks` bulk re-parse in widgets/ax-ganttchart/src/main/hooks/useGanttInstance.ts
- [X] T086 [US11] Use `TreeExpandManager.getMaxExpandableLevel(gantt)` for toolbar max level when gantt initialized in widgets/ax-ganttchart/src/main/components/GanttToolbar.tsx
- [X] T087 [P] [US11] Export `getMaxExpandableLevel` from widgets/ax-ganttchart/src/main/components/TreeExpandManager.ts for toolbar reuse

**Checkpoint**: Expand button works for all hierarchy levels in mock-ui and Mendix runtime `.mpk`

---

## Phase 15: User Story 12 — Bar Chart Diagonal Labels (Priority: P2)

**Goal**: X-axis category labels slanted upward at clock 1:30 (−45°)

**Independent Test**: mock-ui Charts tab → bar chart labels slant upward-right; no label clipping into chart area

### Implementation for User Story 12

- [X] T088 [US12] Set `xAxis` `rotate: -45` and `grid bottom: "15%"` in packages/chart-echarts/src/builders/buildBarChartOption.ts
- [X] T089 [P] [US12] Adjust `buildGrid` bottom margin in packages/chart-echarts/src/helpers/chartStyleHelpers.ts if labels still clip with many categories

**Checkpoint**: `pnpm --filter ax-barchart run build` succeeds; labels visible at −45° in mock-ui

---

## Phase 16: User Story 13 — Chart Fullscreen Commands (Priority: P2)

**Goal**: All four chart widgets support `ENTER_FULLSCREEN` / `EXIT_FULLSCREEN` via Mendix `command` attribute

**Independent Test**: Write `ENTER_FULLSCREEN` to chart `command` attribute → container enters browser fullscreen; `EXIT_FULLSCREEN` exits

### Shared infrastructure for User Story 13

- [X] T090 [US13] Implement `ChartCommand` enum and `parseChartCommand` in packages/chart-core/src/commands/ChartCommand.ts per specs/002-enterprise-gantt-widget/contracts/chart-commands.ts
- [X] T091 [P] [US13] Implement `FullscreenService` in packages/chart-core/src/services/FullscreenService.ts (extract from widgets/ax-ganttchart/src/main/services/FullscreenService.ts)
- [X] T092 [US13] Add `fullscreen` field and `setFullscreen()` to packages/chart-core/src/stores/ChartStore.ts
- [X] T093 [US13] Extend `ChartEvents` with `FULLSCREEN_CHANGED` in packages/chart-core/src/eventbus/types.ts
- [X] T094 [US13] Export command and fullscreen modules from packages/chart-core/src/index.ts
- [X] T095 [US13] Create `useChartCommandSync` hook in packages/chart-core/src/hooks/useChartCommandSync.ts mirroring widgets/ax-ganttchart/src/main/hooks/useCommandSync.ts pattern

### Widget integration for User Story 13

- [X] T096 [P] [US13] Add `command` and `commandPayload` properties to widgets/ax-barchart/src/AxBarChart.xml
- [X] T097 [P] [US13] Add `command` and `commandPayload` properties to widgets/ax-columnchart/src/AxColumnChart.xml
- [X] T098 [P] [US13] Add `command` and `commandPayload` properties to widgets/ax-stackareachart/src/AxStackAreaChart.xml
- [X] T099 [P] [US13] Add `command` and `commandPayload` properties to widgets/ax-reportchart/src/AxReportChart.xml
- [X] T100 [US13] Wire `useChartCommandSync` and fullscreen handlers in widgets/ax-barchart/src/main/providers/BarChartProvider.tsx and BarChartView.tsx
- [X] T101 [US13] Wire `useChartCommandSync` and fullscreen handlers in widgets/ax-columnchart/src/main/providers/ColumnChartProvider.tsx
- [X] T102 [US13] Wire `useChartCommandSync` and fullscreen handlers in widgets/ax-stackareachart/src/main/providers/StackAreaChartProvider.tsx
- [X] T103 [US13] Wire `useChartCommandSync` and fullscreen handlers in widgets/ax-reportchart/src/main/providers/ReportChartProvider.tsx
- [X] T104 [P] [US13] Add fullscreen CSS class to packages/chart-ui/src/components/ChartContainer.tsx for fixed inset styling
- [X] T105 [P] [US13] Add chart fullscreen command buttons to mock-ui/src/App.tsx Charts section

**Checkpoint**: All four chart widgets build; fullscreen enter/exit works via mock-ui and Mendix command attribute

---

## Phase 17: Polish — Improvement Batch Validation

**Purpose**: Cross-widget build verification and quickstart acceptance

- [X] T106 Run `pnpm --filter ax-combobox --filter ax-ganttchart --filter ax-barchart --filter ax-columnchart --filter ax-stackareachart --filter ax-reportchart run build`
- [X] T107 [P] Validate improvement acceptance scenarios from specs/002-enterprise-gantt-widget/quickstart.md § Improvement Batch Verification
- [X] T108 [P] Verify FR-015–FR-021 compliance (grep: no `dropdownRender`; brand `#009999`; chart command XML on all 4 widgets)

---

## Dependencies & Execution Order (Improvement Batch)

### Phase Dependencies

- **Phase 12 (US9)**: No dependencies — can start immediately
- **Phase 13 (US10)**: No dependencies — can run parallel with US9
- **Phase 14 (US11)**: No dependencies on US10 — can run parallel with US9/US10
- **Phase 15 (US12)**: No dependencies — can run parallel with US9–US11
- **Phase 16 (US13)**: T090–T095 block T100–T103; XML tasks T096–T099 parallel after T095
- **Phase 17**: Depends on Phases 12–16

### User Story Dependencies

| Story | Depends on | Independent |
|-------|------------|-------------|
| US9 ComboBox | — | ✅ |
| US10 Gantt brand/add | — | ✅ |
| US11 Gantt expand | — | ✅ |
| US12 Bar labels | — | ✅ |
| US13 Chart fullscreen | chart-core T090–T095 | ✅ after foundation |

### Parallel Opportunities

```bash
# Phase 12 — both files independent:
T074: ComboBoxView.tsx
T075: CascadingComboboxDemo.tsx

# Phase 13 — SCSS tasks parallel before ColumnManager:
T076: variables.scss
T077: gantt.scss (count/add styles)
T078: gantt.scss (task bar colors)

# Phase 16 — all four XML files in parallel:
T096: AxBarChart.xml
T097: AxColumnChart.xml
T098: AxStackAreaChart.xml
T099: AxReportChart.xml

# Cross-story parallelism (different widgets):
Developer A: US9 + US12
Developer B: US10 + US11
Developer C: US13 (after T090–T095)
```

---

## Implementation Strategy (Improvement Batch)

### MVP First (US9 + US12 — quickest wins)

1. Phase 12: US9 ComboBox popupRender (T074–T075)
2. Phase 15: US12 bar label rotation (T088–T089)
3. **STOP and VALIDATE** in mock-ui

### Full P1 Delivery

4. Phase 13: US10 Gantt brand + add button (T076–T083)
5. Phase 14: US11 Gantt expand fix (T084–T087)
6. **STOP and VALIDATE** Gantt in mock-ui + Mendix `.mpk`

### P2 Delivery

7. Phase 16: US13 chart fullscreen (T090–T105)
8. Phase 17: Polish (T106–T108)

### Improvement Batch Task Count Summary

| Phase | Story | Tasks | Parallel tasks |
|-------|-------|-------|----------------|
| 12 US9 ComboBox | P1 | 2 | 2 |
| 13 US10 Gantt brand/add | P1 | 8 | 3 |
| 14 US11 Gantt expand | P1 | 4 | 1 |
| 15 US12 Bar labels | P2 | 2 | 1 |
| 16 US13 Chart fullscreen | P2 | 16 | 6 |
| 17 Polish | — | 3 | 2 |
| **Improvement total** | | **35** | **15** |
| **Grand total (incl. original)** | | **108** | **36** |

---

## Notes (Improvement Batch)

- [Story] labels US9–US13 map to spec.md improvement user stories
- US10 and US11 both touch Gantt but modify different files — can run in parallel with care
- US13 T091 should extract shared FullscreenService; optionally refactor Gantt to import from `@iris/chart-core` (follow-up, not blocking)
- Mendix runtime verification for US11 expand fix is mandatory — mock-ui alone may not reproduce datasource re-sync
- Suggested MVP scope for improvement batch: **US9 + US12** (4 tasks, ~30 min)
