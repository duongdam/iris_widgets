# Ax Gantt Chart — Mendix Implementation

**Widget ID**: `com.mendix.axganttchart.AxGanttChart`  
**Studio name**: Ax Gantt Chart

Gantt enterprise (DHTMLX): grid + timeline, hierarchy task, toolbar, Mendix command sync.

> **Cách sử dụng nhanh:** Entity task + datasource list → map id/text/start/end/parent → **Selected task ID** → cấu hình **Editing** → wire **On task updated**. Toolbar Mendix ghi **Command** attribute. Xem [using-widgets.md §7](./using-widgets.md#7-ax-gantt-chart--lịch-dự-án) · Preview: mock-ui tab **Gantt Chart**.

---

## Domain Model — Entity mẫu

Entity **`GanttTask`**:

| Attribute | Type | Widget mapping | Required |
|-----------|------|----------------|----------|
| `TaskId` | String **hoặc AutoNumber** | ID attribute | **Có** |
| `Name` | String | Text attribute | **Có** |
| `StartDate` | DateTime | Start date attribute | **Có** |
| `EndDate` | DateTime | End date attribute | Một trong End hoặc Duration |
| `DurationDays` | Integer | Duration attribute | Một trong End hoặc Duration |
| `Progress` | Decimal (0–1) | Progress attribute | Không |
| `ParentTaskId` | String **hoặc AutoNumber** | Parent attribute | Không (root = empty) |
| `IsExpanded` | Boolean | Open attribute | Không |
| `TaskType` | String/Enum | Type attribute | Không (`task`, `project`, `milestone`) |

**Selection helper**:

| Attribute | Type |
|-----------|------|
| `SelectedTaskId` | String **hoặc AutoNumber** |
| `SelectedTaskPayload` | String (unlimited JSON) |

**Command control** (optional):

| Attribute | Type | Mô tả |
|-----------|------|-------|
| `GanttCommand` | String / Enum | Tên lệnh (xem bảng dưới) |
| `GanttCommandPayload` | String | JSON hoặc taskId |

---

## Bước triển khai trong Studio Pro

### 1. Datasource

| Property | Cấu hình |
|----------|----------|
| Data source | List `GanttTask` — Database / Microflow |
| ID attribute | `GanttTask/TaskId` |
| Text attribute | `GanttTask/Name` |
| Start date attribute | `GanttTask/StartDate` |
| End date attribute | `GanttTask/EndDate` |
| Duration attribute | `GanttTask/DurationDays` |
| Progress attribute | `GanttTask/Progress` |
| Parent attribute | `GanttTask/ParentTaskId` |
| Open attribute | `GanttTask/IsExpanded` |
| Type attribute | `GanttTask/TaskType` |

### 2. Display

| Property | Default | Mô tả |
|----------|---------|-------|
| Height | 600 | Chiều cao widget (px) |
| Show toolbar | true | Zoom, today, expand, export, … |
| Show grid | true | Cột task bên trái |
| Show timeline | true | Timeline bên phải |
| Show progress | true | Thanh % trên bar |
| Show today marker | true | Vạch ngày hôm nay |
| Show critical path | false | Highlight critical path *(future — plugin)* |
| Show baseline | false | Baseline bars *(future — plugin)* |

### 3. Editing

Điều khiển tương tác DHTMLX trực tiếp từ Mendix (không cần custom JS).

| Property | Default | DHTMLX behavior |
|----------|---------|-----------------|
| Allow create | true | Cho phép thêm task mới |
| Allow update | true | Cho phép sửa task (drag progress, edit) |
| Allow delete | true | Cho phép xóa task |
| Allow drag | true | Kéo task trên timeline |
| Allow resize | true | Resize bar |
| Read only | false | `gantt.config.readonly = true` — tắt mọi editing |

**Gợi ý:** Set **Read only = true** trên page view-only; hoặc bind expression từ quyền user.

### 4. Timeline

| Property | Options |
|----------|---------|
| Default view mode | Day / Week / Month / Quarter |

### 5. Selection

| Property | Attribute |
|----------|-----------|
| Selected task ID | `Context/SelectedTaskId` |
| Selected payload | `Context/SelectedTaskPayload` |

### 6. Events

| Event | Khi nào dùng |
|-------|--------------|
| On task click | Mở detail, highlight |
| On task double click | Edit form |
| On task created | Persist task mới từ Gantt |
| On task updated | Sync drag/resize về DB |
| On task deleted | Xóa record |
| On selection changed | Filter / navigation |

---

## Mendix Commands (điều khiển từ microflow)

Ghi vào attribute **Command**; sau khi widget thực thi, **clear Command** để có thể gửi lại cùng lệnh.

| Command | Payload | Mô tả |
|---------|---------|-------|
| `ZOOM_DAY` | — | Zoom timeline day |
| `ZOOM_WEEK` | — | Zoom week |
| `ZOOM_MONTH` | — | Zoom month |
| `ZOOM_QUARTER` | — | Zoom quarter |
| `REFRESH` | — | Reload datasource / re-parse tasks |
| `SCROLL_TO_TODAY` | — | Cuộn tới hôm nay |
| `FIT_TIMELINE` | — | Fit toàn bộ task |
| `EXPAND_ALL` | — | Mở rộng hierarchy |
| `COLLAPSE_ALL` | — | Thu gọn hierarchy |
| `SCROLL_TO_TASK` | `{"taskId":"..."}` hoặc plain taskId | Cuộn tới task |
| `SET_START_DATE` | `{"date":"2026-01-01T00:00:00.000Z"}` | Đặt start timeline |
| `SET_END_DATE` | `{"date":"..."}` | Đặt end timeline |

### Microflow mẫu — nút "Fit timeline"

```text
Change object: Context
  GanttCommand = 'FIT_TIMELINE'
Commit
→ (widget executes)
Change object: Context
  GanttCommand = empty
Commit
```

---

## Page layout mẫu

```text
Page: ProjectSchedule
├── Data view: ProjectContext
│   ├── Ax Gantt Chart
│   │   ├── tasksDatasource: DS_GanttTasksByProject
│   │   ├── Selection → SelectedTaskId, SelectedTaskPayload
│   │   ├── Command → GanttCommand, GanttCommandPayload
│   │   └── On task updated → ACT_SyncTaskToDatabase
│   └── Buttons → set GanttCommand (Fit, Today, …)
```

---

## Hierarchy tasks

- Root task: `ParentTaskId` = empty / null
- Child: `ParentTaskId` = `TaskId` của parent
- Project row: `TaskType` = `project`
- Milestone: `TaskType` = `milestone`

---

## Troubleshooting

| Triệu chứng | Kiểm tra |
|-------------|----------|
| Empty state "configuration incomplete" | Map đủ id, text, start date; **và** end date **hoặc** duration |
| Task không hiện timeline | StartDate; EndDate hoặc Duration |
| Hierarchy lỗi | ParentTaskId trỏ đúng TaskId tồn tại (String/AutoNumber) |
| Command không chạy | Clear Command sau execute; đúng tên lệnh (xem console nếu unsupported) |
| Progress không hiện | Progress 0–1 (hoặc 0–100); Show progress = true |
| Không sửa được task | Read only / Allow update / Allow drag / Allow resize |

---

## Liên quan

- [Pattern chung](./01-common-patterns.md)
- [mock-ui preview](./mock-ui.md) — tab Gantt, sidebar Editing & commands
- Spec quickstart: `specs/002-enterprise-gantt-widget/quickstart.md`
