# Chart Widgets — Mendix Implementation

Năm widget biểu đồ dùng **cùng datasource model** (ListValue + 4 attribute mappings). Khác nhau ở cách render (bar ngang, column, area, report, negative bar).

| Widget | Studio name | Trục chính |
|--------|-------------|------------|
| `ax-barchart` | Ax Bar Chart | Y = name, X = value |
| `ax-columnchart` | Ax Column Chart | X = period, Y = value, multi-series theo name |
| `ax-stackareachart` | Ax Stack Area Chart | X = period, stacked theo name |
| `ax-reportchart` | Ax Report Chart | Báo cáo / aggregation view |
| `ax-negativebarchart` | Ax Negative Bar Chart | Bar ngang, màu theo baseline |

> **Cách sử dụng nhanh:** Entity `ChartDataPoint` + microflow retrieve → map datasource + 4 attributes → wire **Selected ID/Name/Payload** → **On selection changed**. Xem [using-widgets.md §3](./using-widgets.md#3-chart-widgets--dashboard--báo-cáo) · Preview: mock-ui tabs **Bar / Column / Stack Area / Report / Negative Bar**.

---

## Domain Model — Entity mẫu

Tạo entity **`ChartDataPoint`** (hoặc tái sử dụng entity analytics có sẵn):

| Attribute | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `RecordId` | String | Khuyến nghị | ID duy nhất |
| `SeriesName` | String | **Có** | Tên series (CPU, Memory, …) |
| `PeriodLabel` | String | **Có** | Nhãn trục thời gian / category |
| `MetricValue` | Decimal | **Có** | Giá trị số |

**Helper object cho selection** (non-persistent hoặc trên Session):

| Attribute | Type |
|-----------|------|
| `SelectedId` | String |
| `SelectedName` | String |
| `SelectedPayload` | String (unlimited) |

---

## Datasource mapping (chung)

Trong property group **Datasource** của mọi chart widget:

| Property | Map tới |
|----------|---------|
| Data source | List từ Database / Microflow / XPath |
| ID attribute | `ChartDataPoint/RecordId` (optional) |
| Name attribute | `ChartDataPoint/SeriesName` |
| Period attribute | `ChartDataPoint/PeriodLabel` |
| Value attribute | `ChartDataPoint/MetricValue` |

### Microflow lấy data — ví dụ

```text
Microflow: ACT_GetChartData
  → Retrieve ChartDataPoint from database
     [XPath constraint theo filter page nếu có]
  → Return list
```

Page: Data view context = Filter object; Chart datasource = `ACT_GetChartData` với parameter filter.

---

## Selection wiring

| Property | Attribute |
|----------|-----------|
| Selected ID | `Filter/SelectedId` |
| Selected Name | `Filter/SelectedName` |
| Selected Payload | `Filter/SelectedPayload` |

| Event | Action |
|-------|--------|
| On Click | (tuỳ chọn) |
| On Selection Changed | `ACT_OnChartSelectionChanged` |

Microflow **ACT_OnChartSelectionChanged**: parse payload → navigate hoặc set filter cho widget khác.

---

## Ax Bar Chart

**Widget ID**: `com.mendix.axbarchart.AxBarChart`

Biểu đồ **thanh ngang**: tên trên trục Y, giá trị trên trục X.

### Property groups

| Group | Properties |
|-------|------------|
| General | Title, Height (default 400) |
| Datasource | *(mapping chung ở trên)* |
| Display | Show Title, Show Legend, Show Tooltip |
| Selection | Selected ID / Name / Payload |
| Events | On Click, On Selection Changed |

### Ví dụ use case

Top 10 resource usage: `SeriesName` = tên server, `MetricValue` = % CPU.

---

## Ax Column Chart

**Widget ID**: `com.mendix.axcolumnchart.AxColumnChart`

Biểu đồ **cột dọc**: `PeriodLabel` trên trục X, nhiều series theo `SeriesName`.

### Display bổ sung

| Property | Giá trị | Mô tả |
|----------|---------|-------|
| Stack mode | Grouped / Stacked | Cột cạnh nhau hoặc xếp chồng |
| Column width (%) | 10–100 (default 70) | Độ rộng cột |
| Show series labels | true/false | Nhãn trên từng segment |

### Reference Line

| Property | Map |
|----------|-----|
| Reference Line Value | Attribute Decimal (ví dụ KPI target) |
| Reference Line Label | String tĩnh hoặc để trống (hiện số) |

---

## Ax Stack Area Chart

**Widget ID**: `com.mendix.axstackareachart.AxStackAreaChart`

Area chart **xếp chồng** theo series qua các period.

### Display

Show Title, Show Legend, Show Tooltip + **Reference Line** (giống Column Chart).

### Data shape

Nhiều dòng cùng `PeriodLabel`, khác `SeriesName`:

| SeriesName | PeriodLabel | MetricValue |
|------------|-------------|-------------|
| CPU | 2025-01 | 40 |
| Memory | 2025-01 | 30 |
| CPU | 2025-02 | 50 |

---

## Ax Report Chart

**Widget ID**: `com.mendix.axreportchart.AxReportChart`

Chart báo cáo / tổng hợp — cùng datasource model, builder tối ưu cho aggregation view.

Property groups giống Bar Chart (General, Datasource, Display, Selection, Events).

---

## Ax Negative Bar Chart

**Widget ID**: `com.mendix.axnegativebarchart.AxNegativeBarChart`

Bar ngang: giá trị **trên baseline** = xanh, **dưới baseline** = đỏ.

### Baseline group

| Property | Map |
|----------|-----|
| Baseline Value | Attribute Decimal (default 0 nếu trống) |
| Baseline Label | String (ví dụ `"Target"`) |

Use case: variance so với target, deviation KPI.

---

## Page layout mẫu (Studio Pro)

```text
Page: Dashboard
├── Data view: Filter (non-persistent)
│   ├── Ax Combo Box (Site filter)     → selectedValues
│   ├── Ax Date Picker                 → selectedDate
│   └── Ax Column Chart
│       ├── Datasource: ACT_GetChartData(Filter)
│       ├── Selection → Filter/Selected*
│       └── On Selection Changed → ACT_DrillDown
```

---

## Troubleshooting

| Triệu chứng | Nguyên nhân thường gặp |
|-------------|------------------------|
| Chart trống | Datasource empty; sai XPath; thiếu required attribute mapping |
| Sai series | `Name attribute` map nhầm field |
| Click không ghi selection | Chưa map writable Selected ID/Name/Payload |
| Reference line không hiện | `Reference Line Value` attribute null hoặc chưa map |

---

## Liên quan

- [Pattern chung](./01-common-patterns.md)
- [Cài đặt MPK](./00-installation.md)
- mock-ui tabs: Bar, Column, Stack Area, Report, Negative Bar
