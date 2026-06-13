# Mendix Implementation — Overview

Tài liệu này mô tả cách **implement (triển khai) Iris widgets trong Mendix app** — từ import widget đến wiring datasource, attributes và microflow/nanoflow.

## Luồng triển khai chuẩn

```text
1. Import .mpk vào Mendix project
2. Tạo / tái sử dụng Domain Model (entity + attributes)
3. Tạo page + datasource (Database / Microflow / XPath)
4. Kéo widget vào page → map properties
5. Wire selection attributes + On Change / On Click actions
6. (Tuỳ chọn) Microflow refresh datasource khi filter thay đổi
```

**Hướng dẫn sử dụng chi tiết (kịch bản page, từng nhóm widget):** [using-widgets.md](./using-widgets.md)

## Tài liệu theo widget

| # | File | Nội dung |
|---|------|----------|
| ★ | [using-widgets.md](./using-widgets.md) | **Cách dùng widget trên page Mendix** |
| 0 | [00-installation.md](./00-installation.md) | Import MPK, build từ source, dev ports |
| 1 | [01-common-patterns.md](./01-common-patterns.md) | Datasource ListValue, selection JSON, events, form writeback |
| 2 | [mock-ui.md](./mock-ui.md) | Preview local — 10 tab, mock helpers |
| 3 | [chart-widgets.md](./chart-widgets.md) | 5 chart widgets (cùng datasource model) |
| 4 | [ax-ganttchart.md](./ax-ganttchart.md) | Gantt tasks, editing, commands, CRUD events |
| 5 | [ax-datepicker.md](./ax-datepicker.md) | Date / week / month / year picker |
| 6 | [ax-combobox.md](./ax-combobox.md) | Single/multi select, default values |
| 7 | [ax-input.md](./ax-input.md) | Text input (String / Enum) |
| 8 | [ax-numberinput.md](./ax-numberinput.md) | Numeric input |
| 9 | [ax-switch.md](./ax-switch.md) | Boolean switch |
| 10 | [ax-textarea.md](./ax-textarea.md) | Multi-line text |
| 11 | [ax-checkboxgroup.md](./ax-checkboxgroup.md) | Checkbox group + datasource |
| 12 | [cascading-combobox-pattern.md](./cascading-combobox-pattern.md) | Nhiều combobox phụ thuộc nhau |

## Phân loại widget

### Nhóm Chart (ECharts)

Datasource **ListValue** với 4 attribute mapping: `name`, `period`, `value`, optional `id`.

- [Ax Bar Chart](./chart-widgets.md#ax-bar-chart)
- [Ax Column Chart](./chart-widgets.md#ax-column-chart)
- [Ax Stack Area Chart](./chart-widgets.md#ax-stack-area-chart)
- [Ax Report Chart](./chart-widgets.md#ax-report-chart)
- [Ax Negative Bar Chart](./chart-widgets.md#ax-negative-bar-chart)

### Nhóm Form (Ant Design)

Dùng chung pattern **EditableValue** writeback qua `@iris/form-core` (status available, readOnly, validation).

- [Ax Date Picker](./ax-datepicker.md)
- [Ax Combo Box](./ax-combobox.md) + [pattern cascading](./cascading-combobox-pattern.md)
- [Ax Input](./ax-input.md)
- [Ax Number Input](./ax-numberinput.md)
- [Ax Switch](./ax-switch.md)
- [Ax Text Area](./ax-textarea.md)
- [Ax Checkbox Group](./ax-checkboxgroup.md)

### Nhóm Gantt (DHTMLX)

- [Ax Gantt Chart](./ax-ganttchart.md)

## Preview nhanh (không cần Mendix)

```bash
pnpm dev:mock-ui
```

| Tab | Widget |
|-----|--------|
| Bar / Column / Stack Area / Report / Negative Bar | 5 chart widgets |
| Gantt Chart | `ax-ganttchart` (+ sidebar Editing, commands) |
| Date Picker | `ax-datepicker` |
| Combo Box | `ax-combobox` |
| Cascading | Nhiều `ax-combobox` |
| Form | Input, Number, Switch, TextArea, CheckboxGroup |

Chi tiết: [mock-ui.md](./mock-ui.md)

## Hỗ trợ

Khi gặp lỗi mapping, đối chiếu property trong Studio với file XML tương ứng:

```text
widgets/<widget-name>/src/<WidgetName>.xml
```
