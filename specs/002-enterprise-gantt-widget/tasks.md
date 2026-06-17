# Tasks: Gantt Refactor — Unified Event Bridge + Simplification

**Input**: Plan `specs/002-enterprise-gantt-widget/plan.md`

**Tech stack**: TypeScript 5.4 strict · React 18.2 · MobX 6.16 · dhtmlx-gantt ^9.1.4 · @mendix/pluggable-widgets-tools 11.8.1

**Format**: `- [ ] [TaskID] [P?] [Story?] Description — file path`
- **[P]**: Có thể chạy song song (file khác nhau, không phụ thuộc lẫn nhau)
- **[US#]**: User story tương ứng

## User Stories

| ID | Mô tả | Priority |
|----|-------|----------|
| US1 | Mendix-native event contract — `eventType`/`eventPayload` attribute write-back | P1 |
| US2 | Data mutation events — `TASK_UPDATED` (drag/resize) + `TASK_REORDERED` (grid DnD) | P1 |
| US3 | State change events — `VIEW_CHANGED` + `FULLSCREEN_CHANGED` | P2 |

---

## Phase 1: Setup

**Purpose**: Không có cấu trúc mới — widget đang hoạt động, chỉ cần verify build baseline trước khi refactor.

- [x] T001 Verify widget builds clean: chạy `pnpm --filter ax-ganttchart build` từ repo root, ghi nhận lỗi hiện có (nếu có) — baseline trước refactor

---

## Phase 2: Foundation — Loại bỏ dead code (prerequisite cho mọi US)

**Purpose**: Xóa các property chưa được implement để TypeScript compile sạch sau khi thay đổi. Các task này không ảnh hưởng behavior runtime.

**⚠️ CRITICAL**: Phải hoàn thành trước khi implement bất kỳ User Story nào.

- [x] T002 [P] Xóa `showCriticalPath` và `showBaseline` khỏi `<properties>` trong `widgets/ax-ganttchart/src/AxGanttChart.xml` (2 `<property>` blocks trong group "Display")
- [x] T003 [P] Xóa `showCriticalPath: boolean` và `showBaseline: boolean` khỏi interface `AxGanttChartProps` trong `widgets/ax-ganttchart/src/typings/AxGanttChartProps.ts`; xóa `exportServerUrl?: string` cùng lúc
- [x] T004 [P] Xóa `showCriticalPath: false` và `showBaseline: false` khỏi default props object trong `widgets/ax-ganttchart/src/AxGanttChart.editorPreview.tsx`
- [x] T005 Xóa `showCriticalPath` và `showBaseline` khỏi `UseGanttInstanceOptions` interface + destructuring + `appearance` object trong `widgets/ax-ganttchart/src/main/hooks/useGanttInstance.ts` (lines ~35-36, ~124-125, ~160, ~232-233) — depends on T003
- [x] T006 Xóa `appearance.showCriticalPath` và `appearance.showBaseline` khỏi hàm apply trong `widgets/ax-ganttchart/src/main/components/GanttConfiguration.ts` (lines ~127-128); xóa luôn parameter `appearance` nếu không còn field nào
- [x] T007 Xóa interface `GanttAppearanceConfig` (hoặc xóa 2 fields từ nó) khỏi `widgets/ax-ganttchart/src/shared/types/editingConfig.ts` — depends on T006
- [x] T008 Xóa `exportServerUrl: widgetProps.exportServerUrl` khỏi `useEventBusBridge(...)` call trong `widgets/ax-ganttchart/src/main/components/AxGanttChartView.tsx`; xóa `showCriticalPath` + `showBaseline` khỏi `useGanttInstance(...)` call (lines ~105-106) — depends on T003
- [x] T009 Xóa `exportServerUrl?` khỏi `UseEventBusBridgeOptions` interface + destructuring + `createExportService(exportServerUrl)` useMemo trong `widgets/ax-ganttchart/src/main/hooks/useEventBusBridge.ts`; thay bằng `createExportService()` (no URL) — depends on T003

**Checkpoint**: Sau T002–T009, `pnpm --filter ax-ganttchart build` phải compile sạch. Verify trước khi tiếp tục.

---

## Phase 3: US1 — Mendix-native Event Contract (P1) 🎯

**Goal**: Nanoflow đọc `$EventType` và `$EventPayload` attributes trực tiếp — không cần JavaScript `window.__AX_GANTT__`.

**Independent Test**: Bind `GanttEventContext/EventType` vào widget property "Event type (out)". Click một task → `$EventType` = "TASK_CLICKED". Click nút `+` → `$EventType` = "ADD_TASK_REQUESTED". Không cần JS action để đọc data.

### Implementation US1

- [x] T010 [P] [US1] Thêm `<property key="eventType">` và `<property key="eventPayload">` vào `<propertyGroup caption="Events">` trong `widgets/ax-ganttchart/src/AxGanttChart.xml` — theo XML snippet trong plan.md
- [x] T011 [P] [US1] Thêm `eventType?: EditableValue<string>` và `eventPayload?: EditableValue<string>` vào interface `AxGanttChartProps` trong `widgets/ax-ganttchart/src/typings/AxGanttChartProps.ts` (cần import `EditableValue` từ `mendix` — đã có trong file)
- [x] T012 [US1] Cập nhật `WidgetEventBridgeOptions` interface trong `widgets/ax-ganttchart/src/main/services/WidgetEventBridge.ts`: thêm `eventType?: EditableValue<string>` và `eventPayload?: EditableValue<string>`; cập nhật hàm `emitOutgoing` để gọi `.setValue()` trên cả hai trước `executeAction(onEvent)` — depends on T011
- [x] T013 [US1] Rename enum value `TASK_REQUEST_ADD` → `ADD_TASK_REQUESTED` trong `widgets/ax-ganttchart/src/main/eventbus/eventTypes.ts` (outgoing enum); cập nhật reference tại `WidgetEventBridge.ts` line ~69 — depends on T012
- [x] T014 [US1] Cập nhật `createWidgetEventBridge(...)` call trong `widgets/ax-ganttchart/src/main/providers/GanttProvider.tsx`: thêm `eventType: widgetProps.eventType` và `eventPayload: widgetProps.eventPayload` vào options object — depends on T012

**Checkpoint**: Sau T010–T014, click task → `eventType` attribute cập nhật "TASK_CLICKED", `eventPayload` chứa JSON đầy đủ, nanoflow `onEvent` fires.

---

## Phase 4: US2 — Data Mutation Events (P1)

**Goal**: Drag task bar → `TASK_UPDATED` fires với dates mới. Kéo row sang parent khác → `TASK_REORDERED` fires với `newParentId`.

**Independent Test**: 
1. Kéo task bar → `eventType` = "TASK_UPDATED", `eventPayload.data.task.start_date` = ngày mới, `eventPayload.data.changeType` = "move"
2. Kéo row sang parent khác (allowGridReorder=true) → `eventType` = "TASK_REORDERED", `eventPayload.data.newParentId` = ID của parent mới

### Implementation US2

- [x] T015 [P] [US2] Thêm `TASK_UPDATED = "TASK_UPDATED"` và `TASK_REORDERED = "TASK_REORDERED"` vào `GanttOutgoingEvents` enum trong `widgets/ax-ganttchart/src/main/eventbus/eventTypes.ts`; thêm interfaces `TaskUpdatedData` (task + changeType) và `TaskReorderedData` (task + newParentId + newOrderNo) — depends on T013
- [x] T016 [US2] Thêm methods `handleTaskUpdated(task, changeType)` và `handleTaskReordered(task, newParentId, newOrderNo)` vào `WidgetEventBridge` interface + implementation trong `widgets/ax-ganttchart/src/main/services/WidgetEventBridge.ts` — depends on T015
- [x] T017 [US2] Trong `widgets/ax-ganttchart/src/main/hooks/useGanttInstance.ts`: attach DHTMLX event `gantt.attachEvent("onAfterTaskDrag", (id, mode) => { bridge?.handleTaskUpdated(gantt.getTask(id), mode) })` trong useEffect init block (sau `attachNativeEvents`); cleanup via returned id — depends on T016
- [x] T018 [US2] Trong `widgets/ax-ganttchart/src/shared/utils/gridReorder.ts`: cập nhật `syncTaskParentFromGantt` để gọi `bridge?.handleTaskReordered(...)` thay vì `handleTaskUpdated`; lấy `newOrderNo` bằng `gantt.getTaskIndex(id) + 1` — depends on T016

**Checkpoint**: Drag task bar trên timeline → `onEvent` nanoflow fires với `eventType="TASK_UPDATED"` chứa dates mới.

---

## Phase 5: US3 — State Change Events (P2)

**Goal**: Thay đổi view mode hoặc fullscreen → Mendix nhận được sự kiện để có thể lưu user preference.

**Independent Test**: Click "Week" trên toolbar → `eventType` = "VIEW_CHANGED", `eventPayload.data.viewMode` = "week". Vào fullscreen → `eventType` = "FULLSCREEN_CHANGED", `eventPayload.data.fullscreen` = true.

### Implementation US3

- [x] T019 [P] [US3] Thêm `VIEW_CHANGED = "VIEW_CHANGED"` và `FULLSCREEN_CHANGED = "FULLSCREEN_CHANGED"` vào `GanttOutgoingEvents` enum trong `widgets/ax-ganttchart/src/main/eventbus/eventTypes.ts`; thêm interface shapes tương ứng — depends on T015
- [x] T020 [P] [US3] Thêm `handleViewChanged(viewMode)` và `handleFullscreenChanged(fullscreen)` vào `WidgetEventBridge` interface + implementation trong `widgets/ax-ganttchart/src/main/services/WidgetEventBridge.ts` — depends on T019
- [x] T021 [US3] Trong `widgets/ax-ganttchart/src/main/hooks/useEventBusBridge.ts`: sau khi xử lý các ZOOM events, gọi `bridge.handleViewChanged(mode)` khi mode thay đổi thành công — depends on T020
- [x] T022 [US3] Trong `widgets/ax-ganttchart/src/main/hooks/useEventBusBridge.ts`: trong `fullscreenService.onChange` callback, gọi `bridge.handleFullscreenChanged(fullscreen)` — depends on T020

**Checkpoint**: Click Week → nanoflow fires với VIEW_CHANGED. Enter fullscreen → FULLSCREEN_CHANGED.

---

## Phase 6: Polish & Cross-cutting

**Purpose**: Verify toàn bộ refactor, check TypeScript strict compliance, clean up edge cases.

- [x] T023 [P] Cập nhật `widgets/ax-ganttchart/typings/AxGanttChartProps.d.ts` (generated file): chạy `pnpm --filter ax-ganttchart build` để regenerate, verify nó phản ánh XML mới (eventType, eventPayload thêm; showCriticalPath/showBaseline xóa)
- [x] T024 [P] Check linter trên tất cả files đã sửa: `pnpm --filter ax-ganttchart lint` — fix any TypeScript strict errors hoặc unused import
- [x] T025 Kiểm tra `widgets/ax-ganttchart/src/main/hooks/useSelectionBridge.ts` xem có reference nào đến props cũ không; update nếu cần
- [x] T026 [P] Verify `AxGanttChart.editorPreview.tsx` compile sạch và preview vẫn render được trong Studio Pro preview mode — không có showCriticalPath/showBaseline trong preview defaults

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Không phụ thuộc — bắt đầu ngay
- **Phase 2 (Foundation)**: Phụ thuộc Phase 1 — **BLOCKS tất cả US**
- **Phase 3 (US1)**: Sau Foundation — cần thiết cho US2 (bridge methods) 
- **Phase 4 (US2)**: Sau Phase 3 — cần bridge có handleTaskUpdated/handleTaskReordered
- **Phase 5 (US3)**: Có thể chạy song song với Phase 4 sau Phase 3
- **Phase 6 (Polish)**: Sau tất cả US

### Task-level Dependencies

```
T001 (baseline)
  → T002, T003, T004 [parallel — independent files]
    T003 → T005, T008, T009, T011
      T005 → T006 → T007
      T008 (depends T003)
      T009 (depends T003)
      T011 → T012 → T013, T014
        T013 → T015 → T016 → T017, T018 [parallel]
        T015 → T019 → T020 → T021, T022 [parallel]
  → T023, T024, T025, T026 [parallel, after T012+]
```

### Parallel Opportunities

**Foundation (T002-T009)**: T002, T003, T004 có thể chạy song song (khác file). T005-T009 sequential theo dependency.

**US1 + US2 setup**: T010, T011 song song; T015, T019 song song sau T013.

**Polish**: T023, T024, T025, T026 song song.

---

## Parallel Execution Example: US1

```bash
# Run together (different files):
Task T010: "Thêm eventType/eventPayload vào AxGanttChart.xml"
Task T011: "Thêm EditableValue props vào AxGanttChartProps.ts"

# After T011:
Task T012: "Update WidgetEventBridge write-back"
# After T012:
Task T013: "Rename TASK_REQUEST_ADD → ADD_TASK_REQUESTED"
Task T014: "Pass eventType/eventPayload từ GanttProvider"
```

---

## Implementation Strategy

### MVP (Phase 2 + Phase 3 chỉ — US1)

1. Complete Phase 2: Foundation cleanup
2. Complete Phase 3: US1 — attribute write-back
3. **STOP & TEST**: Bind widget trong Mendix test app → click task → verify `$EventType` = "TASK_CLICKED" trong nanoflow
4. Demo: "Không cần JavaScript để đọc Gantt events"

### Full Delivery (tất cả phases)

1. Foundation → US1 → US2 → US3 → Polish
2. Mỗi phase là một increment độc lập, có thể test riêng
3. US3 (VIEW_CHANGED/FULLSCREEN_CHANGED) có thể defer nếu không urgent

---

## Notes

- `[P]` = files khác nhau, không dependency → chạy song song được
- Verify TypeScript strict compile sau mỗi phase (không để dồn lỗi)
- `window.__AX_GANTT__` global API KHÔNG xóa — backward compat cho dev đang dùng
- Sau refactor: nanoflow chỉ cần 1 ExclusiveSplit trên `$EventType` — không cần JS
- Total tasks: **26** (T001–T026)
