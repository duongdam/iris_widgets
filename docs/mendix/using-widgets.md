# Hướng dẫn sử dụng Iris Widgets trong Mendix

Tài liệu này mô tả **cách dùng widget trên page Mendix** — từ kéo widget vào layout đến wiring attribute, event và microflow. Chi tiết kỹ thuật từng widget xem file riêng ở cuối mục.

---

## 1. Chuẩn bị

| Bước | Việc cần làm |
|------|----------------|
| 1 | Import `.mpk` vào app — [00-installation.md](./00-installation.md) |
| 2 | Tạo entity + attributes (hoặc dùng entity có sẵn) |
| 3 | Tạo page với **Data view** (context object) |
| 4 | Kéo widget từ Toolbox → map properties |
| 5 | Gán **On change / On click** → microflow hoặc nanoflow |
| 6 | Run locally → kiểm tra attribute cập nhật |

**Preview không cần Mendix:** `pnpm dev:mock-ui` — [mock-ui.md](./mock-ui.md)

---

## 2. Quy trình chung trên page

```text
[Data view: Context object]
    ├── Writable attributes  ← widget ghi giá trị user chọn/nhập
    ├── Datasource (list)    ← chart / combobox / gantt / checkbox group
    └── Actions              ← On change → microflow refresh / commit / navigate
```

| Loại widget | Input chính | Output chính |
|-------------|-------------|--------------|
| Chart | List datasource | Selected ID / Name / Payload |
| Form field | Writable attribute | Cùng attribute (two-way) |
| Combo Box | List datasource + writable selection | String hoặc JSON array |
| Gantt | List task + commands | Selection + task CRUD events |

**Quy tắc vàng:** Widget render UI; **microflow** xử lý business logic (refresh list, commit, validation server-side).

---

## 3. Chart widgets — Dashboard & báo cáo

**Khi nào dùng:** Hiển thị metric theo thời gian/series; click bar/column để drill-down.

| Widget | Dùng khi |
|--------|----------|
| Ax Bar Chart | So sánh ngang theo category |
| Ax Column Chart | Xu hướng theo period, nhiều series |
| Ax Stack Area Chart | Tỷ trọng stacked theo thời gian |
| Ax Report Chart | View báo cáo / aggregation |
| Ax Negative Bar Chart | Giá trị +/- so với baseline |

### Các bước sử dụng

1. Entity **`ChartDataPoint`**: `SeriesName`, `PeriodLabel`, `MetricValue` (+ optional `RecordId`)
2. Microflow **`ACT_GetChartData`** → retrieve list
3. Page: Data view `Filter` → kéo **Ax Column Chart** (ví dụ)
4. Map datasource → microflow; map Name / Period / Value attributes
5. Map **Selected ID / Name / Payload** → attributes trên `Filter`
6. **On selection changed** → `ACT_OnChartSelection` (navigate, filter list khác)

```text
Page: AnalyticsDashboard
└── Data view: Filter
    ├── Ax Column Chart  (datasource ACT_GetChartData)
    ├── Ax Date Picker   (filter SelectedDate)
    └── List / Detail    (constraint theo SelectedPayload)
```

→ Chi tiết: [chart-widgets.md](./chart-widgets.md)

---

## 4. Form widgets — Nhập liệu & filter

**Khi nào dùng:** Form edit entity, filter panel, settings page.

| Widget | Bind attribute | Use case |
|--------|----------------|----------|
| Ax Input | String / Enum | Tên, mã, keyword |
| Ax Text Area | String | Mô tả, ghi chú dài |
| Ax Number Input | Decimal / Integer / Long | Số lượng, %, tiền |
| Ax Switch | Boolean | Bật/tắt flag |
| Ax Date Picker | DateTime | Filter ngày/tuần/tháng/năm |
| Ax Combo Box | String / Enum (+ datasource) | Chọn 1 hoặc nhiều từ list |
| Ax Checkbox Group | String JSON (+ datasource) | Multi-select dạng checkbox |

### Các bước sử dụng (ví dụ form edit)

1. Page **EditProduct** — Data view entity `Product`
2. Kéo widgets và map **Value** → attribute tương ứng:

```text
Ax Input          → Product/Name
Ax Number Input   → Product/Price
Ax Switch         → Product/IsActive
Ax Text Area      → Product/Description
Ax Date Picker    → Product/ReleaseDate
```

3. **On change** (tuỳ widget): microflow ngắn — `Commit` hoặc `Refresh` datasource phụ thuộc
4. Nút **Save** page: microflow validate + commit (validation Mendix trên entity)

### Gợi ý cấu hình

| Tình huống | Cấu hình |
|------------|----------|
| Microflow nặng khi gõ | Ax Input → **Update on = blur** |
| Filter realtime | **Update on = change** + On change refresh chart |
| Chỉ xem | **Disabled = true** hoặc attribute read-only |
| Enum thay String | Map attribute Enumeration — Input / Combo single |

→ Chi tiết từng widget: [ax-input.md](./ax-input.md), [ax-numberinput.md](./ax-numberinput.md), [ax-switch.md](./ax-switch.md), [ax-textarea.md](./ax-textarea.md), [ax-datepicker.md](./ax-datepicker.md)

---

## 5. Ax Combo Box — Single & multi select

### Single select

1. Entity options: `Code` (value), `Label` (label)
2. Datasource: list options (DB / microflow)
3. Widget: **Selection mode = Single**
4. **Selected value** → writable String hoặc Enum trên context
5. **On change** → refresh datasource widget khác

### Multi select + Select all

1. **Selection mode = Multiple**
2. **Selected values** → String (unlimited) lưu JSON: `["A","B"]`
3. Bật **Allow select all** nếu cần
4. Microflow parse JSON khi đọc filter

### Cascading (nhiều combobox phụ thuộc)

Pattern Mendix page — **không** logic trong widget:

```text
[Combo A: chọn dimension] → On change → commit FilterContext
    → Microflow refresh datasource Combo B, C
[Combo B: Site]   datasource constraint Site
[Combo C: Team]   datasource constraint Team
```

→ Chi tiết: [ax-combobox.md](./ax-combobox.md), [cascading-combobox-pattern.md](./cascading-combobox-pattern.md)

---

## 6. Ax Checkbox Group

Dùng khi UI checkbox rõ ràng hơn dropdown (permissions, tags, categories).

1. Datasource giống Combo Box (label + value attributes)
2. **Selected values** → String JSON array
3. **On change** → microflow parse JSON

→ [ax-checkboxgroup.md](./ax-checkboxgroup.md)

---

## 7. Ax Gantt Chart — Lịch dự án

**Khi nào dùng:** Timeline task, WBS hierarchy, drag/resize task (nếu bật editing).

### Các bước sử dụng

1. Entity **`GanttTask`**: TaskId, Name, StartDate, EndDate *hoặc* Duration, ParentTaskId, Progress, …
2. Microflow retrieve list task theo project
3. Page: **Ax Gantt Chart**
   - Datasource → list task
   - Map id / text / start / end / duration / parent / progress
   - **Selected task ID / Payload** → context
4. **Editing** (tuỳ quyền user):
   - View only: **Read only = true**
   - Cho phép kéo bar: **Allow drag**, **Allow resize**
5. **On task updated** → microflow sync về database
6. Nút toolbar Mendix: ghi **Command** attribute (`FIT_TIMELINE`, `ZOOM_WEEK`, …) → clear sau execute

```text
Page: ProjectSchedule
└── Data view: ProjectContext
    ├── Ax Gantt Chart
    ├── Button "Fit"  → set GanttCommand = 'FIT_TIMELINE'
    └── Data view task detail (SelectedTaskId)
```

→ Chi tiết: [ax-ganttchart.md](./ax-ganttchart.md)

---

## 8. Kịch bản page thường gặp

### A. Dashboard filter + chart

```text
Filter (non-persistent)
├── Ax Date Picker     → StartDate, EndDate
├── Ax Combo Box       → SelectedSites (JSON multi)
├── Ax Input           → Keyword
├── Button Search      → ACT_ApplyFilter
└── Ax Column Chart    → datasource ACT_GetChartData (đọc filter)
```

### B. Form tạo / sửa bản ghi

```text
Data view: Order
├── Ax Input / Number / Switch / Text Area
├── Ax Combo Box       → CustomerId (single)
├── Ax Date Picker     → OrderDate
└── Button Save        → ACT_SaveOrder
```

### C. Trang lịch Gantt + detail

```text
Data view: Project
├── Ax Gantt Chart
│   └── On task click → ACT_OpenTaskDetail
└── Nested page / drawer theo SelectedTaskId
```

---

## 9. Events — khi nào dùng action nào

| Event | Widget | Hành động microflow gợi ý |
|-------|--------|---------------------------|
| On change | Form, DatePicker, ComboBox | Commit context, refresh datasource |
| On selection changed | Chart, Gantt | Navigate, filter, show detail |
| On click | Chart, Gantt task | Open page, highlight |
| On task updated | Gantt | Persist drag/resize về DB |
| On task created / deleted | Gantt | Create/delete entity |

Action chỉ chạy khi **canExecute** — tránh gọi microflow khi context chưa sẵn sàng.

→ Pattern chung: [01-common-patterns.md](./01-common-patterns.md)

---

## 10. Kiểm tra & debug

| Cách | Mô tả |
|------|--------|
| **Run locally** | Mendix Studio → F4, xem attribute trong debugger |
| **mock-ui** | Preview UI + interaction không cần Mendix |
| **Browser console** | Gantt unsupported command; mapping validation errors |
| **So XML** | `widgets/<name>/src/*.xml` đối chiếu property Studio |

### Checklist trước go-live

- [ ] Datasource trả data (không empty do XPath sai)
- [ ] Writable attributes map đúng kiểu
- [ ] On change / selection wired
- [ ] Multi-select: JSON parse đúng trong microflow
- [ ] Gantt: end date **hoặc** duration cho mỗi task
- [ ] Read only / disabled đúng role user

---

## 11. Tra cứu nhanh theo widget

| Widget | Hướng dẫn chi tiết |
|--------|-------------------|
| Charts (×5) | [chart-widgets.md](./chart-widgets.md) |
| Ax Gantt Chart | [ax-ganttchart.md](./ax-ganttchart.md) |
| Ax Date Picker | [ax-datepicker.md](./ax-datepicker.md) |
| Ax Combo Box | [ax-combobox.md](./ax-combobox.md) |
| Cascading Combo | [cascading-combobox-pattern.md](./cascading-combobox-pattern.md) |
| Ax Input | [ax-input.md](./ax-input.md) |
| Ax Number Input | [ax-numberinput.md](./ax-numberinput.md) |
| Ax Switch | [ax-switch.md](./ax-switch.md) |
| Ax Text Area | [ax-textarea.md](./ax-textarea.md) |
| Ax Checkbox Group | [ax-checkboxgroup.md](./ax-checkboxgroup.md) |
| Cài đặt MPK | [00-installation.md](./00-installation.md) |
| Preview mock-ui | [mock-ui.md](./mock-ui.md) |
