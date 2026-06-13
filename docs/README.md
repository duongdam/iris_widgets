# Iris Widgets — Documentation

Tài liệu triển khai và **sử dụng** Mendix pluggable widgets trong monorepo **iris-widgets**.

## Bắt đầu nhanh

| Bước | Tài liệu |
|------|----------|
| 1. Import widget vào Mendix | [Cài đặt (.mpk)](mendix/00-installation.md) |
| 2. **Hướng dẫn sử dụng trên page** | **[Sử dụng widgets](mendix/using-widgets.md)** ← đọc trước |
| 3. Preview UI local | [mock-ui](mendix/mock-ui.md) — `pnpm dev:mock-ui` |
| 4. Pattern datasource / events | [Pattern chung](mendix/01-common-patterns.md) |

## Mendix Implementation Guides

Hướng dẫn cấu hình widget trong **Mendix Studio Pro** (entity, datasource, attribute mapping, events):

| Tài liệu | Widget | Mô tả ngắn |
|----------|--------|------------|
| **[Sử dụng widgets](mendix/using-widgets.md)** | **Tất cả** | **Hướng dẫn dùng trên page — workflow, kịch bản, checklist** |
| [Cài đặt widget (.mpk)](mendix/00-installation.md) | Tất cả | Build, import MPK, deploy |
| [Pattern chung](mendix/01-common-patterns.md) | Tất cả | Datasource, selection writeback, events |
| [mock-ui preview](mendix/mock-ui.md) | Tất cả | Preview local không cần Mendix |
| [Chart widgets](mendix/chart-widgets.md) | Bar, Column, Stack Area, Report, Negative Bar | Biểu đồ ECharts + ListValue datasource |
| [Ax Gantt Chart](mendix/ax-ganttchart.md) | `ax-ganttchart` | Gantt DHTMLX, editing, commands, task events |
| [Ax Date Picker](mendix/ax-datepicker.md) | `ax-datepicker` | Chọn ngày/tuần/tháng/năm (antd) |
| [Ax Combo Box](mendix/ax-combobox.md) | `ax-combobox` | Multi-select, select all, datasource |
| [Ax Input](mendix/ax-input.md) | `ax-input` | Text input String / Enum writeback |
| [Ax Number Input](mendix/ax-numberinput.md) | `ax-numberinput` | Numeric input Decimal/Integer |
| [Ax Switch](mendix/ax-switch.md) | `ax-switch` | Boolean toggle |
| [Ax Text Area](mendix/ax-textarea.md) | `ax-textarea` | Multi-line String |
| [Ax Checkbox Group](mendix/ax-checkboxgroup.md) | `ax-checkboxgroup` | Multi-select checkboxes + datasource |
| [Cascading Combo Box](mendix/cascading-combobox-pattern.md) | Nhiều `ax-combobox` | Filter phụ thuộc Site → Team → … |

## Widget Inventory

| Widget | Studio name | Package | mock-ui tab |
|--------|-------------|---------|-------------|
| `ax-barchart` | Ax Bar Chart | `com.mendix.axbarchart` | Bar Chart |
| `ax-columnchart` | Ax Column Chart | `com.mendix.axcolumnchart` | Column Chart |
| `ax-stackareachart` | Ax Stack Area Chart | `com.mendix.axstackareachart` | Stack Area |
| `ax-reportchart` | Ax Report Chart | `com.mendix.axreportchart` | Report |
| `ax-negativebarchart` | Ax Negative Bar Chart | `com.mendix.axnegativebarchart` | Negative Bar |
| `ax-ganttchart` | Ax Gantt Chart | `com.mendix.axganttchart` | Gantt Chart |
| `ax-datepicker` | Ax Date Picker | `com.mendix.axdatepicker` | Date Picker |
| `ax-combobox` | Ax Combo Box | `com.mendix.axcombobox` | Combo Box / Cascading |
| `ax-input` | Ax Input | `com.mendix.axinput` | Form |
| `ax-numberinput` | Ax Number Input | `com.mendix.axnumberinput` | Form |
| `ax-switch` | Ax Switch | `com.mendix.axswitch` | Form |
| `ax-textarea` | Ax Text Area | `com.mendix.axtextarea` | Form |
| `ax-checkboxgroup` | Ax Checkbox Group | `com.mendix.axcheckboxgroup` | Form |

## Developer Resources

### mock-ui (preview nhanh)

```bash
pnpm dev:mock-ui   # http://localhost:5173
```

10 tab: 5 chart, Gantt, Date Picker, Combo Box, Cascading, Form. Chi tiết: [mendix/mock-ui.md](mendix/mock-ui.md).

### Dev từng widget (Studio live preview)

```bash
pnpm dev:ganttchart    # 3004
pnpm dev:datepicker    # 3005
pnpm dev:combobox      # 3006
pnpm dev:input         # 3007
pnpm dev:numberinput   # 3008
pnpm dev:switch        # 3009
pnpm dev:textarea      # 3010
pnpm dev:checkboxgroup # 3011
```

### Build & specs

- **Build tất cả widgets**: `pnpm release:widgets` → file `.mpk` trong `builds/`
- **Specs**: `specs/` — feature specs và task lists
- **Shared form helpers**: `packages/form-core` — datasource combobox, Mendix writeback guards, mock helpers

## Yêu cầu

- Mendix Studio Pro **10.24.9+** (khuyến nghị **11.8.x** cho pluggable-widgets-tools 11.8.1)
- Node.js **18+**, pnpm **10.30.0** (chỉ cần khi build widget từ source)
