# Ax Date Picker — Mendix Implementation

**Widget ID**: `com.mendix.axdatepicker.AxDatePicker`  
**Studio name**: Ax Date Picker

Date picker Ant Design với 4 chế độ: **ngày / tuần / tháng / năm**.

> **Cách sử dụng nhanh:** Data view → **Ax Date Picker** → map **Value** → DateTime attribute → chọn **Picker mode** → **On change** refresh chart/list. Xem [using-widgets.md §4](./using-widgets.md#4-form-widgets--nhập-liệu--filter) · Preview: mock-ui tab **Date Picker**.

---

## Domain Model

Trên **context object** (Filter, Session, hoặc entity chính của page):

| Attribute | Type | Writable | Mô tả |
|-----------|------|----------|-------|
| `SelectedDate` | DateTime | **Có** | Giá trị user chọn (output) |
| `DefaultDate` | DateTime | Không* | Giá trị ban đầu (*có thể set bằng microflow Before show) |

*Trong Studio, map **Default date** tới attribute read-only hoặc set giá trị trước khi render page.

---

## Property mapping

### General

| Property | Giá trị gợi ý |
|----------|----------------|
| Picker mode | `Select date` / `Select week` / `Select month` / `Select year` |
| Placeholder | `"Chọn ngày"` |
| Disabled | `false` (hoặc expression `$Filter/IsReadOnly`) |
| Allow clear | `true` |

### Value

| Property | Attribute |
|----------|-----------|
| Selected date | `Filter/SelectedDate` (writable) |
| Default date | `Filter/DefaultDate` hoặc `$CurrentObject/StartOfMonth` |

### Events

| Event | Action |
|-------|--------|
| On change | `ACT_OnDateFilterChanged` |

---

## Hành vi theo Picker mode

| Mode | User chọn | Giá trị ghi vào `SelectedDate` |
|------|-----------|----------------------------------|
| date | Một ngày | DateTime ngày đó |
| week | Một tuần | **Đầu tuần** (start of week) |
| month | Một tháng | **Ngày 1** của tháng |
| year | Một năm | **Ngày 1/1** của năm |

Dùng mode phù hợp filter báo cáo (filter theo tuần KPI → mode **week**).

---

## Triển khai từng bước

### 1. Tạo page filter

```text
Page: ReportFilter
Data view: Filter (non-persistent)
```

### 2. Microflow Before show page

```text
ACT_PrepareReportFilter
  → Create Filter (if needed)
  → Filter/DefaultDate = [%BeginOfCurrentMonth]
  → Filter/SelectedDate = Filter/DefaultDate
```

### 3. Kéo Ax Date Picker

- Selected date → `Filter/SelectedDate`
- Default date → `Filter/DefaultDate`
- On change → `ACT_RefreshReportData`

### 4. Microflow On change

```text
ACT_RefreshReportData
  → Commit Filter (SelectedDate đã được widget set)
  → Refresh chart/list datasource có constraint theo SelectedDate
```

---

## Kết hợp với Chart / Combo Box

```text
[Filter page]
  Ax Date Picker  → SelectedDate
  Ax Combo Box    → SelectedSiteCodes (JSON)
  Ax Column Chart → datasource ACT_GetMetrics(Filter)
```

Microflow **ACT_GetMetrics**: XPath constraint `ReportDate >= $Filter/SelectedDate`.

---

## Ví dụ: hai picker From / To

Dùng **2 instance** Ax Date Picker trên cùng data view:

| Instance | Picker mode | Selected date attribute |
|----------|-------------|-------------------------|
| From date | date | `Filter/DateFrom` |
| To date | date | `Filter/DateTo` |

On change → validate `DateFrom <= DateTo` trong microflow.

---

## Troubleshooting

| Triệu chứng | Nguyên nhân |
|-------------|-------------|
| Không ghi được date | Selected date chưa map writable DateTime |
| Clear không xóa | Allow clear = false |
| Default không hiện | Default date null; SelectedDate đã có giá trị (ưu tiên selected) |

---

## Liên quan

- [Pattern chung](./01-common-patterns.md)
- mock-ui tab **Date Picker**
