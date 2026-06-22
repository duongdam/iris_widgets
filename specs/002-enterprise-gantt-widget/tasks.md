# Tasks: AxGanttChart Refactor — Simplified Architecture + Typed Mendix Actions

**Input**: Design documents from `specs/002-enterprise-gantt-widget/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tech stack**: TypeScript strict · React 18.2 · MobX 6.16 · dhtmlx-gantt ^9.1.4 · @mendix/pluggable-widgets-tools 11.8.1

**Format**: `- [ ] [TaskID] [P?] [Story?] Description — file path`

## User Stories (mapped to refactor scope)

| ID | Spec story | Priority | Refactor focus |
|----|------------|----------|----------------|
| US1 | Render Gantt from Mendix Datasource | P1 | Adapter, unscheduled groups, no global startDate requirement |
| US2 | Task Selection and Mendix Actions | P1 | `onClicked`, `onDoubleClicked`, `onChanged`, `onAdded`, `onDropped` + write-back attrs |
| US3 | Timeline View Modes | P2 | Day/Week/Month scale reconfiguration |
| US4 | Event Bus Programmatic Control | P2 | Global `AX_EVENT_BUS` + `AxGanttInner` command listener |
| US5 | Enterprise Visual Design | P2 | Cross-highlight, today marker, brand styling |
| US6 | Large Dataset Performance | P3 | Smart rendering, incremental sync |
| US7 | Export Architecture | P3 | ExportService via event bus commands |
| US8 | Studio Pro Preview | P3 | Mock data from `gantt-test.json` |
| US10 | Gantt Level-2 Add Button & Brand Color | P1 | (+) button, `#009999` palette |
| US11 | Gantt Progressive Expand Fix | P1 | Toolbar expand one level at a time |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Fix widget XML contract and verify build baseline before refactor.

- [X] T001 Verify widget builds clean: run `pnpm --filter ax-ganttchart build` from repo root and record baseline errors — `widgets/ax-ganttchart/`
- [X] T002 Fix `dataSource="tasksDatasource"` → `dataSource="roadmapItems"` on all attribute properties; remove duplicate `hasTuningAttribute` block — `widgets/ax-ganttchart/src/AxGanttChart.xml`
- [X] T003 Add `<returnType assignableTo="Integer|String|Boolean" />` to expression properties (`height`, `defaultViewMode`, `allowDrag`, `allowResize`, `allowGridReorder`, `readOnly`, `optStartDateAttribute`, `optEndDateAttribute`) — `widgets/ax-ganttchart/src/AxGanttChart.xml`
- [X] T004 Remove `onEvent`, `eventType`, `eventPayload` properties; add `onClicked`, `onDoubleClicked`, `onChanged`, `onAdded`, `onDropped` actions and `outItemId`, `outType`, `outChangedNum` write-back attributes — `widgets/ax-ganttchart/src/AxGanttChart.xml`
- [X] T005 Change `startDateAttribute` to `required="false"` in XML — `widgets/ax-ganttchart/src/AxGanttChart.xml`
- [X] T006 Regenerate or manually update `AxGanttChartProps` / `AxGanttChartPreviewProps` to match new XML (roadmapItems, expression types, new actions, remove old event props) — `widgets/ax-ganttchart/typings/AxGanttChartProps.d.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core modules that MUST exist before any user story work. **⚠️ CRITICAL**: No user story work until this phase completes.

- [X] T007 [P] Implement `createBus()` with `emit`, `on`, `removeListener`, `clear` — `widgets/ax-ganttchart/src/shared/eventBus/createBus.ts`
- [X] T008 [P] Implement `globalScope.ts` with `AX_EVENT_BUS_KEY = "AX_EVENT_BUS"` typed accessor — `widgets/ax-ganttchart/src/shared/eventBus/globalScope.ts`
- [X] T009 [P] Implement `initEventBus()`, `getEventBus()`, `emitEvent(topic, event)` — `widgets/ax-ganttchart/src/shared/eventBus/initEventBus.ts`, `getEventBus.ts`, `emitEvent.ts`
- [X] T010 [P] Define `AxEvent`, `AxGanttTask`, `AxTaskType`, `normalizeTaskType()`, `isGroupType()`, `isScheduledType()` — `widgets/ax-ganttchart/src/shared/types/axGanttTask.ts`
- [X] T011 Rename `GanttStore` → `AxGanttStore`; add `dragStartDates` map and `snapshotDragStart`/`clearDragSnapshot`; delete `RootStore.ts` — `widgets/ax-ganttchart/src/stores/AxGanttStore.ts`
- [X] T012 [P] Create `ganttTestData.ts` importing `gantt-test.json`, normalizing AREA→DISTRICT_GROUP, BIZ_LINE→CUSTOM_GROUP, field names — `widgets/ax-ganttchart/src/shared/mock/ganttTestData.ts`
- [X] T013 Implement `createMendixActionBridge()` with `fireClicked`, `fireDoubleClicked`, `fireChanged`, `fireAdded`, `fireDropped` and `computeChangedNum()` month delta — `widgets/ax-ganttchart/src/shared/bridge/mendixActionBridge.ts`
- [X] T014 Refactor `AxGanttChart.tsx` entry: `ThemeProvider` → `AxGanttInner` → `AxGanttChartView`; call `initEventBus()` on mount — `widgets/ax-ganttchart/src/AxGanttChart.tsx`
- [X] T015 Create `AxGanttInner.tsx` scaffold accepting `widgetProps`, `store`, `widgetId`; subscribe to global bus topics filtered by `widgetId` — `widgets/ax-ganttchart/src/main/AxGanttInner.tsx`

**Checkpoint**: Event bus, store, types, mock loader, and action bridge compile. Old `GanttProvider` not yet removed but new modules exist.

---

## Phase 3: User Story 1 — Render Gantt from Mendix Datasource (P1) 🎯 MVP

**Goal**: Map `roadmapItems` datasource to `AxGanttTask[]`; render hierarchy with unscheduled group rows (no dates required).

**Independent Test**: Bind datasource with 50+ items including DISTRICT_GROUP/CUSTOM_GROUP rows without dates; verify grid + hierarchy render; loading/empty states work.

- [X] T016 [P] [US1] Update `validateDatasourceMapping` to require only aid/itemId/type/text/parentId; remove global `startDateAttribute` requirement — `widgets/ax-ganttchart/src/shared/validators/validateDatasourceMapping.ts`
- [X] T017 [US1] Refactor `MendixTaskAdapter` to use `roadmapItems` prop keys from new XML; map all attributes per data-model.md; set `unscheduled: true` for group types — `widgets/ax-ganttchart/src/main/services/MendixTaskAdapter.ts`
- [X] T018 [US1] Add `mapTaskForDhtmlx()` helper setting `unscheduled` flag and optional dates for TASK/SUB_TASK — `widgets/ax-ganttchart/src/shared/utils/mapTaskForDhtmlx.ts`
- [X] T019 [US1] Set `gantt.config.show_unscheduled = false` in init; mark group tasks `unscheduled: true` on parse — `widgets/ax-ganttchart/src/main/components/GanttConfiguration.ts`
- [X] T020 [US1] Consolidate datasource sync into `AxGanttChartView.tsx`: loading overlay, empty state, config error state, `store.setTasksIfChanged` — `widgets/ax-ganttchart/src/main/components/AxGanttChartView.tsx`
- [X] T021 [US1] Wire gantt parse/sync from store tasks in view init lifecycle (migrate logic from `useGanttInstance.ts` + `useDatasourceSync.ts`) — `widgets/ax-ganttchart/src/main/components/AxGanttChartView.tsx`

**Checkpoint**: Runtime renders Mendix datasource with groups (no dates) + scheduled TASK/SUB_TASK bars.

---

## Phase 4: User Story 2 — Task Selection and Mendix Actions (P1)

**Goal**: Replace unified event bridge with typed Mendix actions writing `outItemId`, `outType`, `outChangedNum`.

**Independent Test**: Click task → `onClicked` fires, `$outItemId` and `$outType` populated. Drag bar 2 months back → `onChanged` fires with `$outChangedNum = -2`.

- [X] T022 [US2] Wire `fireClicked` on task row/bar click via delegated interaction handlers — `widgets/ax-ganttchart/src/main/components/AxGanttChartView.tsx`
- [X] T023 [US2] Wire `fireDoubleClicked` on double-click — `widgets/ax-ganttchart/src/main/components/AxGanttChartView.tsx`
- [X] T024 [US2] Snapshot drag start date on `onBeforeTaskDrag`; on `onAfterTaskDrag` call `fireChanged(itemId, type, computeChangedNum(...))` — `widgets/ax-ganttchart/src/main/components/AxGanttChartView.tsx`
- [X] T025 [US2] Wire `fireAdded` on level-2 (+) button click — `widgets/ax-ganttchart/src/main/components/AxGanttChartView.tsx`
- [X] T026 [US2] Wire `fireDropped` on grid row reorder (`onAfterTaskMove` / `gridReorder.ts`) — `widgets/ax-ganttchart/src/shared/utils/gridReorder.ts`
- [X] T027 [US2] Remove `WidgetEventBridge.ts`, `useSelectionBridge.ts`, and all `eventType`/`eventPayload`/`onEvent` references — `widgets/ax-ganttchart/src/main/services/WidgetEventBridge.ts`

**Checkpoint**: All five Mendix actions fire with correct write-back attributes; no JSON payload bridge remains.

---

## Phase 5: User Story 8 — Studio Pro Preview (P3)

**Goal**: Preview uses `gantt-test.json` normalized mock data instead of hand-written `MOCK_GANTT_TASKS`.

**Independent Test**: Open widget in Studio Pro design mode; hierarchy from gantt-test.json renders with toolbar, grid, timeline.

- [X] T028 [P] [US8] Replace `MOCK_GANTT_TASKS` export with re-export from `ganttTestData.ts` — `widgets/ax-ganttchart/src/preview/previewConfig.ts`
- [X] T029 [US8] Update `AxGanttChart.editorPreview.tsx` to pass `ganttTestData` tasks and new prop defaults — `widgets/ax-ganttchart/src/AxGanttChart.editorPreview.tsx`
- [X] T030 [US8] Ensure preview path bypasses Mendix datasource validation and loads mock tasks into `AxGanttStore` — `widgets/ax-ganttchart/src/main/AxGanttInner.tsx`

**Checkpoint**: Studio Pro preview shows real gantt-test.json hierarchy without datasource.

---

## Phase 6: User Story 3 — Timeline View Modes (P2)

**Goal**: Day/Week/Month views via scale reconfiguration without gantt remount.

**Independent Test**: Switch toolbar view mode and send `ZOOM_WEEK` command; scales update, no `gantt.destructor()`.

- [X] T031 [US3] Migrate view mode state to `AxGanttStore.viewMode`; toolbar updates store — `widgets/ax-ganttchart/src/main/components/GanttToolbar.tsx`
- [X] T032 [US3] Apply `getScales(viewMode)` + `applyTimelineRange` on viewMode change without re-init — `widgets/ax-ganttchart/src/main/components/TimelineManager.ts`
- [X] T033 [US3] React to `ZOOM_DAY`/`ZOOM_WEEK`/`ZOOM_MONTH` bus topics in `AxGanttInner.tsx` — `widgets/ax-ganttchart/src/main/AxGanttInner.tsx`

**Checkpoint**: View mode switches smoothly from toolbar and event bus.

---

## Phase 7: User Story 4 — Event Bus Programmatic Control (P2)

**Goal**: External Mendix commands control Gantt via global bus; `AxGanttInner` is sole incoming listener.

**Independent Test**: Set `command=REFRESH` → datasource reloads. `command=ENTER_FULLSCREEN` → fullscreen toggles. `command=SCROLL_TO_TASK` with payload → scrolls to task.

- [X] T034 [US4] Migrate `useCommandSync` logic into `AxGanttInner.tsx` watching `command`/`commandPayload` props — `widgets/ax-ganttchart/src/main/AxGanttInner.tsx`
- [X] T035 [US4] Migrate incoming command handlers from `useEventBusBridge.ts` / `GanttCommandRegistry.ts` to bus topic handlers in `AxGanttInner.tsx` — `widgets/ax-ganttchart/src/main/AxGanttInner.tsx`
- [X] T036 [US4] Replace old `GanttEventBusImpl` usages with `emitEvent`/`getEventBus().on()` — `widgets/ax-ganttchart/src/main/components/AxGanttChartView.tsx`
- [ ] T037 [US4] Delete obsolete files: `main/eventbus/GanttEventBus.ts`, `main/eventbus/eventTypes.ts`, `main/hooks/useEventBusBridge.ts`, `main/hooks/useCommandSync.ts` — `widgets/ax-ganttchart/src/main/`

**Checkpoint**: All incoming commands work through `AxGanttInner`; old enum event bus removed.

---

## Phase 8: User Story 5 — Enterprise Visual Design (P2)

**Goal**: Cross-highlight hover, today marker, polished grid styling preserved after refactor.

**Independent Test**: Hover row → row `#fff8cc` + column `#fffbe6`. Today marker visible when enabled.

- [X] T038 [P] [US5] Verify cross-highlight CSS and hover handlers still wired after view consolidation — `widgets/ax-ganttchart/src/styles/gantt.scss`
- [X] T039 [US5] Ensure `TodayMarker.ts` sync still called from view init with `showTodayMarker` prop — `widgets/ax-ganttchart/src/main/components/TodayMarker.ts`
- [X] T040 [US5] Ensure `MtoMarker.ts` sync still called for TASK/SUB_TASK milestone bars — `widgets/ax-ganttchart/src/main/components/MtoMarker.ts`

**Checkpoint**: Visual UX unchanged or improved post-refactor.

---

## Phase 9: User Story 10 & 11 — Add Button + Progressive Expand (P1)

**Goal**: (+) on level-2 rows in `#009999`; toolbar expand reveals one hierarchy level per click.

**Independent Test**: (+) only on `$level === 1` rows; expand button opens next level each click.

- [X] T041 [US10] Verify `ColumnManager.ts` (+) button renders only at `$level === 1` with brand color `#009999` — `widgets/ax-ganttchart/src/main/components/ColumnManager.ts`
- [X] T042 [US11] Verify `TreeExpandManager.ts` progressive expand preserved in toolbar — `widgets/ax-ganttchart/src/main/components/TreeExpandManager.ts`
- [X] T043 [US11] Preserve expand level across datasource refresh in `AxGanttStore` sync path — `widgets/ax-ganttchart/src/main/components/AxGanttChartView.tsx`

**Checkpoint**: Add button and progressive expand work in Mendix runtime.

---

## Phase 10: User Story 6 — Large Dataset Performance (P3)

**Goal**: Smart rendering and incremental updates at 1,000+ tasks.

**Independent Test**: Load 1,000+ tasks; scroll responsive; single task change uses `gantt.updateTask` not full re-parse.

- [X] T044 [US6] Ensure `smart_rendering: true` and `show_task_cells: false` when task count > 500 — `widgets/ax-ganttchart/src/main/components/GanttConfiguration.ts`
- [X] T045 [US6] Migrate incremental sync from `GanttSyncService.ts` into view/store path using `gantt.updateTask`/`gantt.addTask`/`gantt.deleteTask` — `widgets/ax-ganttchart/src/main/services/GanttSyncService.ts`

**Checkpoint**: Performance behavior preserved; no full re-parse on single-row datasource change.

---

## Phase 11: User Story 7 — Export Architecture (P3)

**Goal**: Export via service layer triggered by bus commands, not UI components.

**Independent Test**: Emit `EXPORT_PNG` topic → `ExportService` calls `gantt.exportToPNG` without crash.

- [X] T046 [US7] Wire `EXPORT_PDF`/`EXPORT_PNG`/`EXPORT_EXCEL` bus topics in `AxGanttInner.tsx` to `ExportService` — `widgets/ax-ganttchart/src/main/services/ExportService.ts`
- [X] T047 [US7] Ensure `enablePlugins({ export_api: true })` still called during gantt init — `widgets/ax-ganttchart/src/main/components/GanttConfiguration.ts`

**Checkpoint**: Export commands work via event bus.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Remove dead layers, finalize simplified architecture, validate build.

- [ ] T048 [P] Delete `main/providers/GanttProvider.tsx`, `main/hooks/useGanttInstance.ts`, `main/hooks/useDatasourceSync.ts`, `main/hooks/useSelectionBridge.ts`, `stores/RootStore.ts` — `widgets/ax-ganttchart/src/`
- [ ] T049 [P] Update all imports from `GanttTask`/`GanttStore` to `AxGanttTask`/`AxGanttStore` across widget package — `widgets/ax-ganttchart/src/`
- [X] T050 Update unit tests for `computeChangedNum`, adapter unscheduled mapping, and remove stale bridge tests — `widgets/ax-ganttchart/src/shared/utils/__tests__/`
- [X] T051 Run `pnpm --filter ax-ganttchart build && pnpm --filter ax-ganttchart test`; fix TypeScript errors — `widgets/ax-ganttchart/`
- [X] T052 Validate integration steps in `specs/002-enterprise-gantt-widget/quickstart.md` match implemented action props — `specs/002-enterprise-gantt-widget/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (T006 props must exist) — **BLOCKS all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 — MVP datasource rendering
- **Phase 4 (US2)**: Depends on Phase 3 (needs rendered gantt to wire interactions)
- **Phase 5 (US8)**: Depends on Phase 2 (T012 mock data); can parallel with Phase 3 after T012
- **Phase 6–11**: Depend on Phase 3 minimum; Phase 7 depends on Phase 2 bus; Phase 4 before Phase 9 (add button uses action bridge)
- **Phase 12 (Polish)**: Depends on Phases 3–11

### User Story Dependencies

| Story | Depends on | Can parallel with |
|-------|------------|-------------------|
| US1 (P1) | Foundational | — |
| US2 (P1) | US1 | — |
| US8 (P3) | Foundational (T012) | US1 after T012 |
| US3 (P2) | US1 | US8 |
| US4 (P2) | Foundational + US1 | US3, US5 |
| US5 (P2) | US1 | US3, US4 |
| US10/11 (P1) | US2 | US5 |
| US6 (P3) | US1 | US7 |
| US7 (P3) | US4 | US6 |

### Parallel Opportunities

**Phase 2** (after T006):
```text
T007 createBus.ts ∥ T008 globalScope.ts ∥ T010 axGanttTask.ts ∥ T012 ganttTestData.ts
```

**Phase 3** (after Phase 2):
```text
T016 validateDatasourceMapping.ts ∥ T018 mapTaskForDhtmlx.ts
```

**Phase 12**:
```text
T048 delete old files ∥ T049 update imports
```

---

## Parallel Example: User Story 1

```bash
# After Phase 2 completes, run in parallel:
T016  validateDatasourceMapping.ts
T018  mapTaskForDhtmlx.ts

# Then sequential:
T017 → T019 → T020 → T021
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (XML + props)
2. Complete Phase 2: Foundational (bus, store, types, mock, action bridge)
3. Complete Phase 3: US1 — datasource + unscheduled groups render
4. Complete Phase 4: US2 — typed Mendix actions
5. **STOP and VALIDATE**: Deploy to Mendix; click/drag/reorder fires correct actions

### Incremental Delivery

1. Setup + Foundational → infrastructure ready
2. US1 → datasource renders (MVP visual)
3. US2 → Mendix integration complete (MVP functional)
4. US8 → preview with real mock data
5. US3 + US4 → view modes + programmatic control
6. US5 + US10/11 → polish UX
7. US6 + US7 → performance + export
8. Phase 12 → cleanup + ship

### Suggested MVP Scope

**Phases 1–4 only** (T001–T027): XML contract, simplified architecture core, datasource rendering, typed Mendix actions.

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 52 |
| **Phase 1 Setup** | 6 |
| **Phase 2 Foundational** | 9 |
| **US1** | 6 |
| **US2** | 6 |
| **US8** | 3 |
| **US3** | 3 |
| **US4** | 4 |
| **US5** | 3 |
| **US10/11** | 3 |
| **US6** | 2 |
| **US7** | 2 |
| **Polish** | 5 |
| **Parallel-marked [P]** | 14 |
| **Format validation** | ✅ All tasks use `- [ ] T### [P?] [US?] Description — path` |
