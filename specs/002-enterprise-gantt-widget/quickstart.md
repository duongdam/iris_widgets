# Gantt Widget — Hướng dẫn tích hợp Nanoflow

> **Phiên bản**: sau refactor Unified Event Bridge (2026-06-18)

---

## Tổng quan

Widget phát ra **một event duy nhất** (`onEvent`) cho tất cả các tương tác. Trong nanoflow, bạn đọc hai attribute:

- `EventType` — tên sự kiện (String), ví dụ `"TASK_CLICKED"`
- `EventPayload` — toàn bộ dữ liệu dạng JSON (String)

**Không cần JavaScript để đọc event.** Bạn chỉ cần một Exclusive Split trên `EventType` để route logic.

---

## Bước 1 — Domain Model

Tạo một **non-persistent entity** tên `GanttEventContext`:

```
Entity: GanttEventContext
Persistence: Non-persistent (không lưu DB)
Attributes:
  EventType    : String (unlimited)   ← widget ghi tên event vào đây
  EventPayload : String (unlimited)   ← widget ghi JSON vào đây
```

> Không cần generalization, không cần association, không cần index.

---

## Bước 2 — Page Setup

Cấu trúc page cần có một **DataView** bao quanh Gantt widget:

```
Page
└── DataView (source: nanoflow DS_GetGanttContext)
    └── AxGanttChart widget
          ├── Data Source      → [datasource tasks của bạn]
          ├── Event type (out) → GanttEventContext/EventType
          ├── Event payload (out) → GanttEventContext/EventPayload
          └── On event         → ACT_Gantt_OnEvent
```

### Nanoflow `DS_GetGanttContext`

```
Return type: GanttEventContext

Microflow activities:
  1. Create object  →  GanttEventContext
     EventType    = ""
     EventPayload = ""
  2. Return  →  $NewGanttEventContext
```

> DataView dùng nanoflow này để tạo một object GanttEventContext mới mỗi khi page load.  
> Object này là "hộp thư" — widget sẽ ghi vào đó mỗi khi có event.

---

## Bước 3 — Nanoflow `ACT_Gantt_OnEvent`

Nanoflow này được gọi mỗi khi Gantt phát ra event.

**Parameter**: `$GanttEventContext : GanttEventContext`

### Cấu trúc nanoflow

```
Start
  │
  ├── Exclusive Split: $GanttEventContext/EventType
  │
  ├── "TASK_CLICKED"          → [xử lý click]
  ├── "TASK_DOUBLE_CLICKED"   → [mở edit form]
  ├── "ADD_TASK_REQUESTED"    → [mở modal tạo task mới]
  ├── "TASK_UPDATED"          → [commit ngày mới vào DB]
  ├── "TASK_REORDERED"        → [commit hierarchy mới vào DB]
  ├── "TASK_CREATED"          → [xử lý tạo task in-gantt]
  ├── "TASK_DELETED"          → [xử lý xóa task]
  ├── "VIEW_CHANGED"          → [lưu user preference]
  ├── "FULLSCREEN_CHANGED"    → [sync UI]
  └── (default)               → End
```

---

## Bước 4 — Đọc EventPayload trong JavaScript Action

Widget ghi payload theo format sau:

```json
{
  "widgetId": "ganttChart1",
  "type": "TASK_CLICKED",
  "data": {
    "task": {
      "id": "123",
      "text": "Phase A",
      "start_date": "2026-07-01T00:00:00",
      "end_date": "2026-07-31T00:00:00",
      "duration": 30,
      "parent": "100",
      "metadata": {}
    }
  }
}
```

Tạo một **JavaScript action** tái sử dụng `JS_ParseGanttEvent`:

```javascript
// Parameters:
//   eventPayload : String  (= $GanttEventContext/EventPayload)
// Return type: String (trả về phần "data" dưới dạng JSON string)

var payload = JSON.parse(eventPayload);
return JSON.stringify(payload.data || {});
```

Sau đó trong từng nhánh nanoflow, dùng một JavaScript action nữa để lấy field cụ thể.

---

## Use Case 1 — Click task → Hiển thị thông tin

**Trigger**: User click vào bất kỳ task row hoặc bar nào.

### Nanoflow branch: `EventType = "TASK_CLICKED"`

**JavaScript action** (lấy task ID):
```javascript
// Parameter: eventPayload (String)
var payload = JSON.parse(eventPayload);
var taskId = payload.data.task.id;
return taskId;   // Return type: String
```

**Tiếp theo**:
```
Java action output: $TaskId (String)

Retrieve objects → Task
  XPath: [Task/ID = $TaskId]
  Range: First

Show page / Show popup → TaskDetailPage
  Parameter: $Task
```

> `task.id` chính là giá trị bạn đã map vào `ID attribute` khi cấu hình widget.  
> Nếu bạn map Mendix AutoNumber → `task.id` sẽ là String của số đó.

---

## Use Case 2 — Click nút `+` → Mở form tạo task con

**Trigger**: User click icon `+` trên row level-2 (Phase row).  
Widget gửi thông tin của **parent task** (row đang được click).

### Nanoflow branch: `EventType = "ADD_TASK_REQUESTED"`

**JavaScript action** (lấy parent info):
```javascript
// Parameter: eventPayload (String)
var payload = JSON.parse(eventPayload);
var data = payload.data;

// Trả về parentId để nanoflow dùng tiếp
return data.task.id;   // Return type: String
```

**Tiếp theo**:
```
Java action output: $ParentId (String)

Retrieve objects → Task  (entity parent)
  XPath: [Task/ID = $ParentId]
  Range: First

Create object → NewTask
  Change NewTask.Parent = $RetrievedParent

Show page → NewTaskForm
  Parameter: $NewTask
```

**Payload đầy đủ nếu cần thêm thông tin**:
```javascript
var payload = JSON.parse(eventPayload);
var parentTask = payload.data.task;

// parentTask.id         — ID của parent (để tìm Mendix object)
// parentTask.text       — Tên parent (hiển thị trên form)
// parentTask.parent     — ID của grandparent
// parentTask.metadata   — object tự do (nếu bạn đã map metadata khi load)
// payload.data.level        — luôn = 1 (0-indexed level-2)
// payload.data.childCount   — số task con hiện tại của parent
```

---

## Use Case 3 — Kéo task bar → Lưu ngày mới

**Trigger**: User kéo hoặc resize task bar trên timeline.  
Widget gửi task với `start_date`, `end_date`, `duration` đã được cập nhật.

### Nanoflow branch: `EventType = "TASK_UPDATED"`

**JavaScript action** (lấy dates mới):
```javascript
// Parameter: eventPayload (String)
var payload = JSON.parse(eventPayload);
var task = payload.data.task;
var changeType = payload.data.changeType; // "move" | "resize" | "progress"

// Trả về JSON string chứa các trường cần thiết
return JSON.stringify({
  id: task.id,
  startDate: task.start_date,
  endDate: task.end_date,
  duration: task.duration,
  changeType: changeType
});
// Return type: String
```

**Tiếp theo**:
```
JavaScript output: $UpdateInfo (String — JSON)

JavaScript action #2 — lấy từng field:
  var info = JSON.parse(updateInfo);
  return info.id;   // → $TaskId

Retrieve objects → Task
  XPath: [Task/ID = $TaskId]

Change Task:
  StartDate = parseDateTime(info.startDate)
  EndDate   = parseDateTime(info.endDate)

Commit → Task
```

> **Lưu ý**: `start_date` trong payload là ISO string dạng `"2026-07-01T00:00:00"`.  
> Mendix `parseDateTime` hoặc JavaScript `new Date(...)` đều parse được format này.

**Parse datetime trong JavaScript**:
```javascript
// Trong JavaScript action:
var payload = JSON.parse(eventPayload);
var task = payload.data.task;

// Trả về milliseconds — Mendix Date attribute nhận được
var startMs = new Date(task.start_date).getTime();
return startMs;   // Return type: Long/Integer
```

---

## Use Case 4 — Kéo row sang parent khác → Lưu hierarchy

**Trigger**: User kéo row trong grid (Grid Reorder mode bật) sang một parent khác.

### Nanoflow branch: `EventType = "TASK_REORDERED"`

**JavaScript action**:
```javascript
// Parameter: eventPayload (String)
var payload = JSON.parse(eventPayload);
var data = payload.data;

return JSON.stringify({
  taskId: data.task.id,
  newParentId: data.newParentId,   // "0" nếu move lên root
  newOrderNo: data.newOrderNo      // 1-indexed position trong parent mới
});
// Return type: String
```

**Tiếp theo**:
```
$Info = JavaScript parse output

Retrieve → $Task     where Task/ID = info.taskId
Retrieve → $NewParent where Task/ID = info.newParentId
                        (bỏ qua nếu info.newParentId = "0")

Change $Task:
  Parent  = $NewParent  (hoặc empty nếu root)
  OrderNo = info.newOrderNo

Commit → $Task
```

---

## Use Case 5 — Double click → Mở form chỉnh sửa

**Trigger**: User double-click task row hoặc bar.

### Nanoflow branch: `EventType = "TASK_DOUBLE_CLICKED"`

```javascript
// Parameter: eventPayload (String)
var payload = JSON.parse(eventPayload);
return payload.data.task.id;   // Return type: String
```

```
Retrieve → $Task where Task/ID = $TaskId

Show page → EditTaskForm
  Parameter: $Task (editable)
```

---

## Use Case 6 — Lưu view mode preference

**Trigger**: User click Day / Week / Month trên toolbar.

### Nanoflow branch: `EventType = "VIEW_CHANGED"`

```javascript
// Parameter: eventPayload (String)
var payload = JSON.parse(eventPayload);
return payload.data.viewMode;  // "day" | "week" | "month"
// Return type: String
```

```
$ViewMode = JavaScript output

Retrieve → $UserPreference (current user preference object)
Change $UserPreference.GanttViewMode = $ViewMode
Commit → $UserPreference
```

---

## Điều khiển Gantt từ Mendix (Commands)

Widget cũng nhận lệnh từ bên ngoài qua attribute `Command`.

### Setup

```
Context object (ví dụ page parameter entity):
  GanttCommand        : String
  GanttCommandPayload : String

Widget property:
  Command         → YourEntity/GanttCommand
  Command payload → YourEntity/GanttCommandPayload
```

### Cách dùng từ nanoflow/button

```
Change $Entity/GanttCommand = "FIT_TIMELINE"
Commit $Entity
→ Gantt auto-fit timeline
```

### Danh sách commands

| Command | Tác dụng |
|---------|----------|
| `FIT_TIMELINE` | Auto-fit timeline theo date range của tasks |
| `ZOOM_DAY` | Chuyển sang view Day |
| `ZOOM_WEEK` | Chuyển sang view Week |
| `ZOOM_MONTH` | Chuyển sang view Month |
| `EXPAND_ALL` | Mở rộng thêm một level hierarchy |
| `COLLAPSE_ALL` | Thu gọn toàn bộ |
| `SCROLL_TO_TODAY` | Cuộn đến ngày hôm nay |
| `SCROLL_TO_TASK` | Cuộn đến task cụ thể (cần payload) |
| `REFRESH` | Reload lại datasource |
| `ENTER_FULLSCREEN` | Vào fullscreen |
| `EXIT_FULLSCREEN` | Thoát fullscreen |
| `TOGGLE_EXPAND_HEIGHT` | Toggle chiều cao mở rộng |

### SCROLL_TO_TASK (cần payload)

```
Change $Entity/GanttCommand = "SCROLL_TO_TASK"
Change $Entity/GanttCommandPayload = '{"taskId": "' + $Task/ID + '"}'
Commit $Entity
```

### SET_START_DATE / SET_END_DATE

```
Change $Entity/GanttCommand = "SET_START_DATE"
Change $Entity/GanttCommandPayload = '{"date": "2026-01-01"}'
Commit $Entity
```

---

## Checklist kiểm tra

- [ ] Entity `GanttEventContext` tạo xong (non-persistent, 2 String attributes)
- [ ] Nanoflow `DS_GetGanttContext` trả về object mới với attributes rỗng
- [ ] DataView trên page dùng `DS_GetGanttContext` làm source
- [ ] Widget property **Event type (out)** → bind `GanttEventContext/EventType`
- [ ] Widget property **Event payload (out)** → bind `GanttEventContext/EventPayload`
- [ ] Widget property **On event** → bind `ACT_Gantt_OnEvent`
- [ ] `ACT_Gantt_OnEvent` có Exclusive Split trên `$GanttEventContext/EventType`
- [ ] Test: click task → nanoflow fire → `EventType = "TASK_CLICKED"` ✅
- [ ] Test: click `+` → `EventType = "ADD_TASK_REQUESTED"` ✅
- [ ] Test: kéo bar → `EventType = "TASK_UPDATED"`, payload có `start_date` mới ✅
- [ ] Test: kéo row → `EventType = "TASK_REORDERED"`, payload có `newParentId` ✅

---

## Debug

Nếu cần kiểm tra event data trong browser console (không cần nanoflow):

```javascript
// Mở DevTools → Console và chạy:
window.__AX_GANTT__.on("ganttChart1", function(payload) {
    console.log("[Gantt Event]", payload.type);
    console.log("[Data]", JSON.stringify(payload.data, null, 2));
});
```

> Thay `"ganttChart1"` bằng Mendix widget name thực tế của bạn (xem trong Studio Pro widget properties → tab Common → Name).
