# Research: Gantt Refactor — Unified Event Bridge + Simplification

**Date**: 2026-06-18 | **Plan**: [plan.md](./plan.md)

---

## §1 — Mendix Attribute Write-back Pattern

**Decision**: Dùng `EditableValue<string>` cho `eventType` và `eventPayload` property trong widget XML.

**Rationale**:
- Mendix pluggable widget API hỗ trợ `.setValue(value)` trên `EditableValue` object — cập nhật attribute đồng bộ, tức thì
- Nanoflow/microflow đọc attribute như biến thông thường (`$EventType`, `$EventPayload`) — không cần JavaScript
- Pattern này đã được dùng thành công trong các built-in Mendix widgets (e.g., TextBox writes back to attribute)
- Thứ tự đúng: `setValue(eventType)` → `setValue(eventPayload)` → `executeAction(onEvent)` — Mendix đảm bảo attribute đã được cập nhật trước khi action chạy

**Implementation trong WidgetEventBridge**:
```typescript
function emitOutgoing(type: GanttOutgoingEvents, data?: unknown): void {
    const payload: GanttEventPayload = { widgetId, type, data };
    
    // 1. Write to Mendix attributes (sync)
    options.eventType?.setValue(type);
    options.eventPayload?.setValue(JSON.stringify(payload));
    
    // 2. Internal event bus
    recordGanttOutgoingEvent(payload);
    eventBus.emit(payload);
    notifyGanttOutgoingEvent(payload);
    
    // 3. Trigger Mendix action (nanoflow reads updated attributes)
    executeAction(onEvent);
}
```

**Alternatives rejected**:
- `window.__AX_GANTT__.getLastEvent()` — yêu cầu JavaScript action trong nanoflow, khó maintain
- Non-persistent entity object — quá nặng, mỗi event cần tạo/xóa object
- Mendix `$currentObject` passed vào action — không applicable cho non-contextual action

---

## §2 — Event Gap Analysis

### Outgoing Events: So sánh contracts vs. implementation

| Event | Cần thiết | Hiện có | Action |
|-------|-----------|---------|--------|
| `TASK_CLICKED` | ✅ Cao | ✅ Có | GIỮ |
| `TASK_DOUBLE_CLICKED` | ✅ Cao | ✅ Có | GIỮ |
| `ADD_TASK_REQUESTED` | ✅ Cao | ✅ Có (tên cũ: `TASK_REQUEST_ADD`) | GIỮ, rename |
| `TASK_UPDATED` (drag/resize) | ✅ Cao | ❌ Thiếu | **THÊM** |
| `TASK_REORDERED` (grid DnD) | ✅ Cao | ❌ Thiếu | **THÊM** |
| `TASK_CREATED` | ⚠️ Trung bình | ✅ Có | GIỮ |
| `TASK_DELETED` | ⚠️ Trung bình | ✅ Có | GIỮ |
| `VIEW_CHANGED` | 🔵 Thấp | ❌ Thiếu | THÊM (Phase C) |
| `FULLSCREEN_CHANGED` | 🔵 Thấp | ❌ Thiếu | THÊM (Phase C) |
| `TASK_SELECTED` (separate) | ❌ Không cần | Không | SKIP — merge vào TASK_CLICKED |

### Lý do TASK_UPDATED là critical

DHTMLX Gantt cung cấp event `onAfterTaskDrag` và `onAfterTaskResize`. Khi người dùng kéo bar:
1. DHTMLX cập nhật `task.start_date` / `task.end_date` / `task.duration` trong memory
2. Widget PHẢI emit `TASK_UPDATED` ngay lúc này — TRƯỚC KHI datasource refresh
3. Nanoflow nhận `TASK_UPDATED` → cập nhật Mendix object → commit
4. Nếu không làm bước này, drag changes bị mất sau mỗi lần datasource reload

**DHTMLX events để listen**:
```javascript
gantt.attachEvent("onAfterTaskDrag", (id, mode, e) => {
    // mode: "move" | "resize" | "progress"
    const task = gantt.getTask(id);
    bridge.handleTaskUpdated(task);
});
```

### Lý do TASK_REORDERED là critical

Grid reorder (allowGridReorder) cho phép kéo row sang parent khác. Hiện tại:
- Reorder thay đổi `task.parent` trong DHTMLX memory
- Nhưng không có callback về Mendix → mất sau reload

**DHTMLX events**:
```javascript
gantt.attachEvent("onRowDragEnd", (id, target) => {
    const task = gantt.getTask(id);
    const newParent = task.parent;
    bridge.handleTaskReordered(task, String(newParent));
});
```

---

## §3 — XML Properties to Remove

### showCriticalPath + showBaseline

**Decision**: Xóa cả hai khỏi XML và typings.

**Evidence**:
- `showCriticalPath`: Được đọc trong `GanttConfiguration.ts` nhưng không làm gì cả (future placeholder)
- `showBaseline`: Tương tự, không có rendering code
- Cả hai luôn là `defaultValue="false"` — dev không được lợi gì từ việc toggle

**Risk**: Breaking change nếu ai đó đang dùng widget và đã set property. Nhưng vì value luôn false và không ảnh hưởng rendering, safe to remove.

### exportServerUrl

**Decision**: Xóa khỏi `AxGanttChartProps.ts`.

**Evidence**:
- Không có trong `AxGanttChart.xml` — Mendix sẽ không bao giờ pass prop này
- Chỉ xuất hiện trong typings — dead code
- Export feature vẫn hoạt động qua command bus (`EXPORT_PDF` etc.) với URL hardcoded hoặc không cần server

---

## §4 — Incoming Commands: Simplification Analysis

Không cần thay đổi incoming commands hiện tại. Tất cả đều có use-case hợp lệ:

| Command | Use-case | Keep? |
|---------|----------|-------|
| REFRESH / LOAD_DATA | Force reload | ✅ |
| EXPAND_ALL / COLLAPSE_ALL | Toolbar buttons | ✅ |
| ENTER/EXIT_FULLSCREEN | Custom toolbar | ✅ |
| ENTER/EXIT/TOGGLE_EXPAND_HEIGHT | Dashboard layout | ✅ |
| ZOOM_DAY/WEEK/MONTH | View switcher | ✅ |
| SET_START_DATE / SET_END_DATE | Date range filter | ✅ |
| SCROLL_TO_TODAY / SCROLL_TO_TASK | Navigation | ✅ |
| FIT_TIMELINE | Auto-fit | ✅ |
| SHOW/HIDE_GRID + SHOW/HIDE_TIMELINE | Dynamic layout | ✅ (hiếm dùng nhưng không gây hại) |
| EXPORT_PDF / PNG / EXCEL | Programmatic export | ✅ |

**Kết luận**: Giữ nguyên incoming commands — không có lý do xóa, và xóa là breaking change.

---

## §5 — Mendix Non-Persistent Entity Pattern (Recommended Setup)

**Recommended approach** cho Mendix developer:

```
Domain Model:
  GanttEventContext (non-persistent)
    - EventType: String (unlimited)
    - EventPayload: String (unlimited)

Page:
  DataView (source: nanoflow DS_GetGanttEventContext returns GanttEventContext)
    - AxGanttChart widget
      - Event type (out) → GanttEventContext/EventType
      - Event payload (out) → GanttEventContext/EventPayload
      - On event → ACT_Gantt_OnEvent

Nanoflow ACT_Gantt_OnEvent($EventContext: GanttEventContext):
  ExclusiveSplit: $EventContext/EventType
    = "ADD_TASK_REQUESTED" → [handle add]
    = "TASK_UPDATED"       → [handle update]
    = "TASK_REORDERED"     → [handle reorder]
    = "TASK_CLICKED"       → [handle selection/modal]
    = "TASK_DOUBLE_CLICKED"→ [handle edit]
```

**Ưu điểm so với pattern cũ**:
- Không cần JavaScript action để đọc event
- Studio Pro hiểu type của attribute — autocomplete, type-checking
- Non-persistent entity → không tốn DB, tự cleanup sau session
