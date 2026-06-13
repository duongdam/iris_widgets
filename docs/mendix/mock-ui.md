# mock-ui — Preview widget không cần Mendix

**mock-ui** là app Vite trong monorepo dùng để preview widget trực tiếp từ source TypeScript — không cần Mendix Studio Pro hay runtime.

Sau khi thử trên mock-ui, triển khai lên Mendix theo [using-widgets.md](./using-widgets.md).

## Chạy

```bash
pnpm dev:mock-ui
```

Mở http://localhost:5173

Build production:

```bash
pnpm --filter mock-ui run build
```

## Cấu trúc tab

| Tab | Widget(s) | Demo | Sidebar controls |
|-----|-----------|------|------------------|
| Bar Chart | `ax-barchart` | `BarChartDemo.tsx` | Dataset, title, tooltip, ref line |
| Column Chart | `ax-columnchart` | `ColumnChartDemo.tsx` | Stack mode, width, ref line, series labels |
| Stack Area | `ax-stackareachart` | `StackAreaChartDemo.tsx` | Dataset, selection |
| Report | `ax-reportchart` | `ReportChartDemo.tsx` | Dataset, selection |
| Negative Bar | `ax-negativebarchart` | `NegativeBarChartDemo.tsx` | Baseline, selection |
| Gantt Chart | `ax-ganttchart` | `GanttChartDemo.tsx` | Dataset, view mode, display, **Editing**, commands, selection |
| Date Picker | `ax-datepicker` | `DatePickerDemo.tsx` | Trong panel demo |
| Combo Box | `ax-combobox` | `ComboBoxDemo.tsx` | Trong panel demo |
| Cascading | `ax-combobox` (×N) | `CascadingComboboxDemo.tsx` | Filter Site → Team → … |
| Form | `ax-input`, `ax-numberinput`, `ax-switch`, `ax-textarea`, `ax-checkboxgroup` | `FormWidgetsDemo.tsx` | Trong panel demo |

**Lưu ý:** Date Picker và Combo Box có tab riêng; tab **Form** gom 5 widget phase 2 và dẫn link sang các tab kia.

## Dev server từng widget (Mendix live preview)

Khi develop widget riêng lẻ trong Studio Pro:

| Script | Widget | Port |
|--------|--------|------|
| `pnpm dev:barchart` | ax-barchart | 3001 |
| `pnpm dev:columnchart` | ax-columnchart | 3001 |
| `pnpm dev:ganttchart` | ax-ganttchart | 3004 |
| `pnpm dev:datepicker` | ax-datepicker | 3005 |
| `pnpm dev:combobox` | ax-combobox | 3006 |
| `pnpm dev:input` | ax-input | 3007 |
| `pnpm dev:numberinput` | ax-numberinput | 3008 |
| `pnpm dev:switch` | ax-switch | 3009 |
| `pnpm dev:textarea` | ax-textarea | 3010 |
| `pnpm dev:checkboxgroup` | ax-checkboxgroup | 3011 |

## Mock Mendix API

mock-ui mô phỏng Mendix props bằng helper trong `mock-ui/src/mocks/`:

| Mock | Dùng cho |
|------|----------|
| `editableValue.ts` | Chart selection (String) |
| `ganttListValue.ts` | Gantt ListValue + attribute mapping |
| `ganttSelection.ts` | Gantt selectedTaskId / payload |
| `ganttDatasets.ts` | Bộ task Gantt mẫu |
| `datasets.ts` | Chart records |
| `@iris/form-core` | `createMockStringValue`, `createMockComboboxDatasource`, … |

Form widget demos import trực tiếp `*View.tsx` từ `widgets/ax-*/src/main/components/` — thay đổi runtime trong widget tự phản ánh vào mock-ui.

## Gantt — event bus trong mock-ui

Sidebar tab Gantt có nút gọi lệnh qua `eventBus` hoặc:

```javascript
window.__AX_GANTT__.emit("mock-ganttchart", "FIT_TIMELINE")
```

Widget name mặc định trong demo: `mock-ganttchart`.

## Liên quan

- [00-installation.md](./00-installation.md) — build MPK
- [01-common-patterns.md](./01-common-patterns.md) — datasource & selection
- Root [docs/README.md](../README.md) — inventory widget
