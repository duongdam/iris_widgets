# Pattern chung — Datasource, Selection, Events

Các pattern dưới đây áp dụng cho **hầu hết Iris widgets**. Hướng dẫn sử dụng từng nhóm widget trên page: [using-widgets.md](./using-widgets.md). Chi tiết từng widget xem file riêng.

---

## 1. ListValue Datasource

Chart và Combo Box dùng **Datasource** kiểu list (không phải association trực tiếp trên widget).

### Trong Studio Pro

1. Page có **Data view** hoặc **List view** / microflow trả về list object
2. Widget **Datasource** → chọn cùng nguồn list đó
3. Map từng **attribute** từ object trong list

### Ví dụ entity `ChartDataPoint`

| Attribute | Type | Widget mapping (chart) |
|-----------|------|------------------------|
| `RecordId` | String | ID attribute (optional) |
| `SeriesName` | String | Name attribute |
| `PeriodLabel` | String | Period attribute |
| `MetricValue` | Decimal | Value attribute |

Microflow **Get chart data** → trả list `ChartDataPoint` → datasource widget.

---

## 2. Selection writeback

Widget ghi selection vào **writable attributes** trên context object (thường là object của data view).

### Chart widgets

| Widget property | Mendix attribute | Kiểu | Nội dung |
|-----------------|------------------|------|----------|
| Selected ID | `SelectedRecordId` | String | ID bản ghi click |
| Selected Name | `SelectedRecordName` | String | Tên series / label |
| Selected Payload | `SelectedPayload` | String (unlimited) | JSON đầy đủ |

**Payload JSON** (chart):

```json
{
  "id": "rec-001",
  "name": "CPU",
  "period": "2025-01",
  "pm": 120,
  "metadata": { "region": "apac" }
}
```

Microflow **On selection changed**:

1. Parse `SelectedPayload` (hoặc dùng `SelectedRecordId` / `SelectedRecordName`)
2. Navigate, filter list khác, hoặc commit entity

### Gantt

| Widget property | Attribute | Kiểu |
|-----------------|-----------|------|
| Selected task ID | `SelectedTaskId` | String hoặc AutoNumber |
| Selected payload | `SelectedTaskPayload` | String (JSON task) |

### Combo Box — Single mode

| Widget property | Attribute | Kiểu |
|-----------------|-----------|------|
| Selected value | `SelectedSiteCode` | String hoặc **Enum** |

### Combo Box — Multiple mode

| Widget property | Attribute | Kiểu | Format |
|-----------------|-----------|------|--------|
| Selected values | `SelectedSiteCodes` | String (unlimited) | JSON array |

Ví dụ: `["Site1","Site2","Site3"]`

Parse trong microflow:

```text
Import JSON → List of String
(hoặc custom Java action / string split tùy logic app)
```

---

## 3. Default values

| Widget | Property | Cách set trong Mendix |
|--------|----------|------------------------|
| Date Picker | Default date | Attribute DateTime trên context (ví dụ `FilterStartDate`) |
| Combo Box | Default selected values | String attribute chứa JSON array, ví dụ `["Site1"]` — set trong microflow Before show page |
| Chart | — | Không có default selection; datasource quyết định data hiển thị |

---

## 4. Events (Actions)

| Pattern | Khi nào fire | Ví dụ action |
|---------|--------------|--------------|
| On Click | User click phần tử chart/bar | Show page detail |
| On Selection Changed | Selection thay đổi | Refresh list, store filter |
| On Change | Date/combobox đổi giá trị | Commit object, refresh datasource |
| On Task Click / Updated (Gantt) | Tương tác task | Open task form, sync DB |

**Best practice**: Action ngắn — commit context → gọi microflow refresh datasource phụ thuộc.

---

## 5. Refresh datasource khi filter đổi

Pattern chuẩn cho **cascading filter** (Combo Box A → B → C):

```text
[User chọn Combo A]
    → On Change
    → Commit / set filter attributes trên Session hoặc Filter helper object
    → Microflow "Refresh dependent lists"
    → XPath / DB retrieve có constraint theo selection A
    → Datasource Combo B tự reload (cùng page, cùng context)
```

Widget **không** embed logic cascading — Mendix page + microflow điều phối.

Xem chi tiết: [cascading-combobox-pattern.md](./cascading-combobox-pattern.md)

---

## 6. Empty / loading state

- **Datasource loading**: Combo Box hiện spinner; chart hiện loading overlay
- **Datasource empty**: Chart empty state; Combo Box dropdown rỗng
- **Invalid JSON** (selectedValues / defaultSelectedValues): Widget bỏ qua, không crash

---

## 7. Form widgets — EditableValue writeback

Các widget Ant Design (`ax-input`, `ax-datepicker`, `ax-combobox`, …) dùng **EditableValue** từ Mendix.

| Hành vi | Mô tả |
|---------|--------|
| Ghi giá trị | Chỉ khi `status === available` và `readOnly !== true` |
| Validation | Message từ Mendix hiển thị dưới control khi invalid |
| Disabled | Property **Disabled** **hoặc** attribute read-only |
| On Change action | Chỉ execute khi `canExecute && !isExecuting` |

Shared logic: package `@iris/form-core` (`updateEditableValue`, `executeAction`, …).

| Widget | Value attribute types |
|--------|----------------------|
| Ax Input | String, Enum |
| Ax Text Area | String |
| Ax Number Input | Decimal, Integer, Long |
| Ax Switch | Boolean |
| Ax Date Picker | DateTime |
| Ax Combo Box (single) | String, Enum |
| Ax Combo Box (multi) | String (JSON array) |
| Ax Checkbox Group | String (JSON array) |

---

## 8. Checklist triển khai nhanh

- [ ] Entity + attributes đúng kiểu (String, DateTime, Decimal, …)
- [ ] Datasource trỏ list/microflow có data
- [ ] Map đủ required attributes (Name, Period, Value / Label, Value)
- [ ] Writable attributes cho selection/output
- [ ] On Change / On Selection Changed wired
- [ ] Test Run: chọn giá trị → attribute cập nhật → microflow chạy đúng
