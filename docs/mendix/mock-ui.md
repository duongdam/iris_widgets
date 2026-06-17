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

| Tab | Widget | Demo | Sidebar controls |
|-----|--------|------|------------------|
| Gantt Chart | `ax-ganttchart` | `GanttChartDemo.tsx` | Dataset, view mode, display, editing, commands, selection, event log |
| Date Picker | `ax-datepicker` | `DatePickerDemo.tsx` | Trong panel demo |
| Combo Box | `ax-combobox` | `ComboBoxDemo.tsx` | Trong panel demo |

Demo chart khác (`StackAreaChartDemo.tsx`, v.v.) vẫn có trong `mock-ui/src/demos/` để tái sử dụng khi cần; tab chart chưa được gắn lại vào shell chính.

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
| `ganttListValue.ts` | Gantt ListValue + attribute mapping |
| `ganttSelection.ts` | Selection state trong sidebar (event bus, không ghi Mendix attribute) |
| `ganttDatasets.ts` | Bộ task Gantt mẫu |
| `@iris/form-core` | `createMockStringValue`, `createMockComboboxDatasource`, … |

Form widget demos import trực tiếp `*View.tsx` từ `widgets/ax-*/src/main/components/` — thay đổi runtime trong widget tự phản ánh vào mock-ui.

## Gantt — event bus trong mock-ui

Sidebar tab Gantt có nút gọi lệnh qua `eventBus` hoặc:

```javascript
window.__AX_GANTT__.emit("mock-ganttchart", "FIT_TIMELINE")
```

Widget name mặc định trong demo: `mock-ganttchart`.

Trong Mendix, dùng **một** action `onEvent` trên widget. Nanoflow JavaScript đọc payload:

```javascript
const event = window.__AX_GANTT__?.getLastEvent("YourWidgetName");
// event.type — TASK_CLICKED, TASK_DOUBLE_CLICKED, TASK_REQUEST_ADD, …
// event.data — { task }, { taskId }, …
```

Sidebar mock-ui hiển thị selection từ event bus, log sự kiện, và nút **Refresh from registry** để mô phỏng `getLastEvent`.

Create / update / delete luôn bật trong widget (trừ khi `readOnly`). Sidebar chỉ điều khiển `allowDrag`, `allowResize`, và `readOnly`.

## Liên quan

- [00-installation.md](./00-installation.md) — build MPK
- [01-common-patterns.md](./01-common-patterns.md) — datasource & selection
- Root [docs/README.md](../README.md) — inventory widget
