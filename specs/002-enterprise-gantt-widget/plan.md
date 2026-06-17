# Implementation Plan: Gantt Refactor — Unified Event Bridge + Simplification

**Branch**: `001-enterprise-chart-widgets` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)

**Input**: Refactor `ax-ganttchart` để đơn giản hóa tích hợp Mendix:
- Thay JS global hack bằng attribute write-back thuần Mendix
- Single `onEvent` nanoflow nhận tất cả events + đọc `eventType`/`eventPayload` trực tiếp như String attribute
- Loại bỏ các property XML chưa dùng/tương lai
- Bổ sung events thực tế còn thiếu (TASK_UPDATED từ drag, TASK_REORDERED)
- Tài liệu hóa recipe nanoflow cho từng use-case phổ biến

**Note**: Planning only — implementation via `/speckit-tasks` + `/speckit-implement`.

---

## Summary

Refactor Gantt widget theo hướng "Mendix-native event contract": mọi tương tác của người dùng được phản chiếu vào hai String attribute (`eventType` + `eventPayload`) mà nanoflow đọc trực tiếp — không cần JS, không cần `window.__AX_GANTT__`. Đồng thời dọn dẹp các property XML chưa dùng và chuẩn hóa tập events phản ánh đúng nhu cầu thực tế.

**Pain points hiện tại**:

| Vấn đề | Hiện trạng | Sau refactor |
|--------|-----------|--------------|
| Đọc event trong nanoflow | JS: `window.__AX_GANTT__.getLastEvent(name).data.task` | Attribute: `$eventType`, `$eventPayload` |
| XML cluttered | `showCriticalPath`, `showBaseline`, `exportServerUrl` — chưa dùng | Loại bỏ |
| TASK_UPDATED từ drag | Không có — thay đổi mất sau reload | Emit khi user thả bar |
| TASK_REORDERED từ grid | Không có — reorder không persist | Emit khi user thay parent |
| Event documentation | Không có recipe mẫu | quickstart.md với ví dụ nanoflow |

---

## Technical Context

**Language/Version**: TypeScript 5.4 (strict), React 18.2, SCSS, MobX 6.16

**Primary Dependencies**: antd 6.4.3, dhtmlx-gantt ^9.1.4, @mendix/pluggable-widgets-tools 11.8.1

**Target Platform**: Mendix Studio Pro 10.24.9+, pluggable widget

**Storage**: N/A (UI layer — viết ngược về Mendix attribute)

**Constraints**:
- `eventType` và `eventPayload` MUST là `EditableValue<string>` — Mendix ghi nhận thay đổi synchronously
- Widget PHẢI gọi `eventType.setValue(...)` → `eventPayload.setValue(...)` → sau đó `executeAction(onEvent)` — đúng thứ tự
- `onEvent` vẫn là single action (nanoflow/microflow); logic routing ở phía Mendix qua `$eventType`
- Backward compat: `window.__AX_GANTT__.getLastEvent()` GIỮ LẠI cho debug, nhưng không phải primary contract nữa
- Không có REST call; mọi thứ qua Mendix attribute và action

**Scope**: 1 widget (`ax-ganttchart`), 1 XML, 2 service files, 1 hook, 1 typings file, 1 contract file

---

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| Shared logic trong packages, không trong widgets | ✅ PASS | Không thêm shared packages |
| TypeScript strict, React hooks only | ✅ PASS | Không thay đổi pattern |
| MobX store patterns | ✅ PASS | Store không đổi |
| Mendix datasource — không gọi API trực tiếp | ✅ PASS | Attribute write-back là Mendix-native |
| Independent widget builds | ✅ PASS | Chỉ thay đổi ax-ganttchart |

**Post-design re-check**: ✅ Không vi phạm.

---

## Project Structure

```text
specs/002-enterprise-gantt-widget/
├── plan.md              # File này
├── research.md          # Phase 0 — attribute write-back + event gap analysis
├── data-model.md        # Phase 1 — GanttEventPayload shapes, XML contract mới
├── quickstart.md        # Phase 1 — Nanoflow recipes cho 6 use-cases
├── contracts/
│   └── event-bridge.ts  # UPDATED — unified event bridge contract
└── tasks.md             # Phase 2 — /speckit-tasks (chưa tạo)
```

```text
widgets/ax-ganttchart/src/
├── AxGanttChart.xml                    # UPDATED — thêm eventType/eventPayload, xóa unused
├── typings/AxGanttChartProps.ts        # UPDATED — thêm eventType/eventPayload EditableValue
├── main/services/WidgetEventBridge.ts  # UPDATED — write attributes trước executeAction
├── main/hooks/useGanttInstance.ts      # UPDATED — emit TASK_UPDATED khi drag/resize done
├── main/hooks/useEventBusBridge.ts     # UPDATED — emit TASK_REORDERED khi grid reorder
└── main/eventbus/eventTypes.ts         # UPDATED — thêm TASK_UPDATED, TASK_REORDERED vào outgoing
```

---

## Phase 0: Research Summary

### R1 — Mendix Attribute Write-back Pattern

**Decision**: Dùng `EditableValue<string>` cho `eventType` và `eventPayload`.

**Rationale**: Pluggable widget API cho phép widget gọi `.setValue(value)` trên `EditableValue` để cập nhật Mendix attribute đồng bộ. Nanoflow đọc attribute này như biến thông thường — không cần JS, không cần `$currentObject`. Đây là pattern chuẩn của Mendix (ví dụ: `selectedTaskId` + `selectedPayload` đã dùng trong spec ban đầu).

**Alternatives considered**: 
- Giữ `window.__AX_GANTT__.getLastEvent()` → từ chối vì yêu cầu JS action trong nanoflow
- Mendix `$currentObject` entity → quá nặng, không phù hợp với non-persistent event data

**Flow mới**:
```
User interaction
  → Widget emits outgoing event internally
  → eventType.setValue("TASK_REQUEST_ADD")
  → eventPayload.setValue(JSON.stringify({ task: {...} }))
  → executeAction(onEvent)
  → Nanoflow đọc $eventType + $eventPayload trực tiếp
  → Route theo $eventType (Decision/Exclusive Split)
```

---

### R2 — Events Gap Analysis

So sánh contracts chuẩn vs. implementation hiện tại:

| Event | Contracts | Implementation | Action |
|-------|-----------|----------------|--------|
| TASK_CLICKED | ✅ | ✅ | GIỮ |
| TASK_DOUBLE_CLICKED | ✅ | ✅ | GIỮ |
| TASK_REQUEST_ADD | ✅ | ✅ | GIỮ, rename → ADD_TASK_REQUESTED cho rõ |
| TASK_UPDATED (drag/resize) | ✅ contracts | ❌ chưa emit sau drag | **THÊM** |
| TASK_REORDERED (grid DnD) | ❌ | ❌ | **THÊM** |
| TASK_CREATED | ✅ | ✅ | GIỮ (nếu có in-gantt creation) |
| TASK_DELETED | ✅ | ✅ bridge | GIỮ |
| TASK_SELECTED | ✅ contracts | ❌ không có riêng | MERGE vào TASK_CLICKED |
| VIEW_CHANGED | ✅ contracts | ❌ chưa emit | **THÊM** (optional) |
| FULLSCREEN_CHANGED | ✅ contracts | ❌ chưa emit | **THÊM** (optional) |

---

### R3 — XML Properties to Remove

| Property | Lý do xóa |
|----------|-----------|
| `showCriticalPath` | Chưa implement, luôn false, chỉ tốn không gian Studio Pro |
| `showBaseline` | Chưa implement, luôn false, tương tự |
| `exportServerUrl` | Không có trong XML, chỉ trong typings — orphaned dead code, xóa khỏi typings |

---

### R4 — Suggested Additional Features (investigate)

Ngoài yêu cầu ban đầu, những use-case thực tế nên hỗ trợ:

#### 1. TASK_UPDATED khi drag/resize bar
```json
{
  "type": "TASK_UPDATED",
  "data": {
    "task": { "id": "123", "text": "...", "start_date": "2026-07-01", "end_date": "2026-07-15", "duration": 14 }
  }
}
```
Nanoflow: tìm Mendix object theo `id`, cập nhật `StartDate`, `EndDate`, commit.

#### 2. TASK_REORDERED khi kéo row trong grid
```json
{
  "type": "TASK_REORDERED",
  "data": {
    "task": { "id": "123", ... },
    "newParentId": "456",
    "newOrderNo": 2
  }
}
```
Nanoflow: cập nhật `Parent` và `OrderNo` của task, commit.

#### 3. ADD_TASK_REQUESTED khi click nút `+`
```json
{
  "type": "ADD_TASK_REQUESTED",
  "data": {
    "task": { "id": "456", "text": "Phase A", "parent": "100", ... },
    "level": 1,
    "childCount": 3
  }
}
```
Nanoflow: ShowPage(NewTaskForm) với parent pre-filled từ `data.task.id`.

#### 4. VIEW_CHANGED khi đổi zoom
```json
{
  "type": "VIEW_CHANGED",
  "data": { "viewMode": "week" }
}
```
Nanoflow: lưu user preference vào DB.

#### 5. FULLSCREEN_CHANGED
```json
{
  "type": "FULLSCREEN_CHANGED",
  "data": { "fullscreen": true }
}
```
Nanoflow: toggle CSS class trên container bên ngoài nếu cần.

---

## Phase 1: Design Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Event bridge contract | [contracts/event-bridge.ts](./contracts/event-bridge.ts) | Cần update |
| Data model (payload shapes) | [data-model.md](./data-model.md) | Cần tạo mới |
| Nanoflow recipes | [quickstart.md](./quickstart.md) | Cần viết mới |

---

## XML Contract Mới (sau refactor)

### Properties được THÊM

```xml
<propertyGroup caption="Events">
    <!-- Existing -->
    <property key="onEvent" type="action" required="false">
        <caption>On event</caption>
        <description>
            Nanoflow/microflow executed when any Gantt event fires.
            Read $eventType and $eventPayload attributes for event details.
        </description>
    </property>

    <!-- NEW: attribute write-back -->
    <property key="eventType" type="attribute" required="false">
        <caption>Event type (out)</caption>
        <description>
            Widget writes the event name here before calling On event.
            Read this in your nanoflow to route logic:
            TASK_CLICKED | TASK_DOUBLE_CLICKED | ADD_TASK_REQUESTED |
            TASK_UPDATED | TASK_REORDERED | VIEW_CHANGED | FULLSCREEN_CHANGED
        </description>
        <attributeTypes>
            <attributeType name="String" />
        </attributeTypes>
    </property>

    <property key="eventPayload" type="attribute" required="false">
        <caption>Event payload (out)</caption>
        <description>
            Widget writes JSON payload here before calling On event.
            Parse in nanoflow via parseJSON($eventPayload) or JavaScript.
        </description>
        <attributeTypes>
            <attributeType name="String" />
        </attributeTypes>
    </property>
</propertyGroup>
```

### Properties được XÓA

```xml
<!-- XÓA — chưa implement, luôn false -->
<property key="showCriticalPath" .../>
<property key="showBaseline" .../>
```

### Properties được GIỮ NGUYÊN

- Tất cả Data Source mappings
- Display toggles (showToolbar, showGrid, showTimeline, showProgress, showTodayMarker)
- Editing (allowDrag, allowResize, allowGridReorder, readOnly)
- Commands (command, commandPayload)

---

## Nanoflow Recipe (Mendix Developer Guide)

### Setup trong Studio Pro

1. Tạo non-persistent entity `GanttEventContext` với 2 attribute: `EventType` (String), `EventPayload` (String)
2. Trên page chứa Gantt widget:
   - Tạo data view với `GanttEventContext` làm data source (nanoflow trả object)
   - Đặt `GanttEventContext/EventType` → widget property `Event type (out)`
   - Đặt `GanttEventContext/EventPayload` → widget property `Event payload (out)`
3. Tạo nanoflow `ACT_Gantt_OnEvent`:
   ```
   Decision: $EventType = "ADD_TASK_REQUESTED"
     → True: JavaScript action để parse payload → ShowModal
   Decision: $EventType = "TASK_UPDATED"
     → True: JavaScript action để parse payload → Commit task dates
   Decision: $EventType = "TASK_REORDERED"
     → True: JavaScript action để parse payload → Commit parent + order
   ```

### Đọc payload trong Nanoflow JavaScript

```javascript
// Đọc event type
var eventType = $currentObject.EventType;

// Parse payload
var payload = JSON.parse($currentObject.EventPayload);

// Ví dụ: ADD_TASK_REQUESTED
if (eventType === "ADD_TASK_REQUESTED") {
    var parentTask = payload.data.task;
    // parentTask.id, parentTask.text, parentTask.parent, parentTask.metadata
}

// Ví dụ: TASK_UPDATED (drag/resize)
if (eventType === "TASK_UPDATED") {
    var updatedTask = payload.data.task;
    // updatedTask.id, updatedTask.start_date, updatedTask.end_date, updatedTask.duration
}
```

---

## Implementation Phases (for /speckit-tasks)

### Phase A — XML & Typings Contract (P1)

- **T-A1**: Xóa `showCriticalPath`, `showBaseline` khỏi `AxGanttChart.xml` và `AxGanttChartProps.ts`
- **T-A2**: Xóa `exportServerUrl` khỏi `AxGanttChartProps.ts` (orphaned — không có trong XML)
- **T-A3**: Thêm `eventType` và `eventPayload` (`EditableValue<string>`) vào XML + typings

### Phase B — Event Bridge Write-back (P1)

- **T-B1**: Cập nhật `WidgetEventBridge` — gọi `eventType.setValue()` + `eventPayload.setValue()` trước `executeAction(onEvent)`
- **T-B2**: Cập nhật `GanttProvider` — truyền `eventType`/`eventPayload` props xuống bridge
- **T-B3**: Thêm `TASK_UPDATED` outgoing event vào `eventTypes.ts` + emit trong `useGanttInstance` sau `gantt.attachEvent("onAfterTaskDrag")`
- **T-B4**: Thêm `TASK_REORDERED` outgoing event + emit sau `gantt.attachEvent("onRowDragEnd")`

### Phase C — Additional Outgoing Events (P2)

- **T-C1**: Emit `VIEW_CHANGED` khi `store.viewMode` thay đổi (trong `useEventBusBridge` hoặc MobX reaction)
- **T-C2**: Emit `FULLSCREEN_CHANGED` khi fullscreen state thay đổi

### Phase D — Documentation (P1, parallel)

- **T-D1**: Viết `quickstart.md` với Studio Pro setup guide + nanoflow recipes
- **T-D2**: Cập nhật `contracts/event-bridge.ts` — unified contract với payload shapes đầy đủ
- **T-D3**: Cập nhật `data-model.md` — document tất cả payload types

---

## Complexity Tracking

> Không có vi phạm constitution. Không cần complexity tracking.

---

## Migration Notes

Nếu đang dùng `window.__AX_GANTT__.getLastEvent()` trong nanoflow JS hiện tại:
- **Vẫn hoạt động** — global API được giữ nguyên
- **Nên migrate** sang attribute read-back để code nanoflow gọn hơn
- **Thứ tự migration**: Thêm attribute binding → test → xóa JS action cũ
