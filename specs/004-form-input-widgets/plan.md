# Implementation Plan: Form Input Widgets (DatePicker & ComboBox)

**Branch**: `004-form-input-widgets` | **Date**: 2026-06-13 | **Spec**: [spec.md](./spec.md)

**Input**: antd-based Mendix pluggable widgets `ax-datepicker` and `ax-combobox` with datasource support, default values, multi-select + select all, and mock-ui cascading combobox demo.

---

## Summary

Add two new Mendix form input widgets following the existing monorepo patterns (chart/gantt widgets). Shared datasource mapping and mock utilities live in a new `@iris/form-core` package. UI is built with antd 6.4.3 DatePicker and Select components. mock-ui gains three demo tabs including a cascading dimension-filter scenario with fake Site/Team/Group… hierarchy data.

---

## Technical Context

**Language/Version**: TypeScript 5.4 strict, React 18.2, SCSS

**Primary Dependencies**: antd 6.4.3, dayjs (antd peer), `@mendix/pluggable-widgets-tools` 11.8.1, `@iris/chart-ui` (ThemeProvider reuse)

**Testing**: Manual validation via mock-ui; Studio Pro editor preview

**Target Platform**: Mendix pluggable widgets (Studio Pro 10.24.9+), mock-ui (Vite)

**Project Type**: PNPM monorepo — 1 shared package + 2 widgets + mock-ui demos

---

## Project Structure

### Documentation

```text
specs/004-form-input-widgets/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code

```text
packages/form-core/src/
├── adapters/ComboboxDatasourceAdapter.ts   # mapDatasourceToOptions
├── contracts/combobox-option.ts            # ComboboxOption { value, label }
├── mocks/dimensionMockData.ts              # Site1, Team1, Block L1… fake data
├── utils/createMockComboboxDatasource.ts   # mock ListValue for previews/demos
└── index.ts

widgets/ax-datepicker/src/
├── AxDatePicker.xml
├── AxDatePicker.tsx
├── AxDatePicker.editorPreview.tsx
├── typings/AxDatePickerProps.ts
├── main/components/DatePickerView.tsx
├── styles/ax-datepicker.scss
└── preview/previewConfig.ts

widgets/ax-combobox/src/
├── AxComboBox.xml
├── AxComboBox.tsx
├── AxComboBox.editorPreview.tsx
├── typings/AxComboBoxProps.ts
├── main/components/ComboBoxView.tsx
├── main/hooks/useComboboxDatasource.ts
├── styles/ax-combobox.scss
└── preview/previewConfig.ts

mock-ui/src/
├── demos/DatePickerDemo.tsx
├── demos/ComboBoxDemo.tsx
├── demos/CascadingComboboxDemo.tsx
└── mocks/comboboxDimensions.ts
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Shared package | `@iris/form-core` | Keeps datasource mapping out of widgets; mirrors `chart-core` |
| Date library | dayjs via antd | antd 6.x uses dayjs internally |
| Multi-select writeback | `selectedValues` String attribute (JSON array) | Mendix pluggable widgets lack native multi-attribute binding |
| Single-select writeback | `selectedValue` String attribute | Simple scalar binding |
| Cascading logic | mock-ui page orchestration | Mendix pages wire widget outputs to datasource constraints; demo models this |
| Select all | Custom dropdown render option at top | Standard antd multi-select pattern |
| Theme | Reuse `@iris/chart-ui` ThemeProvider | Consistent antd token overrides |

---

## Widget XML Summary

### ax-datepicker

| Property | Type | Notes |
|----------|------|-------|
| pickerMode | enumeration | date, week, month, year |
| selectedDate | attribute (DateTime, writable) | User selection output |
| defaultDate | attribute (DateTime, optional) | Initial value |
| placeholder | string | Input placeholder |
| disabled | boolean | Disable interaction |
| allowClear | boolean | Show clear button |
| onChange | action | Fires on selection change |

### ax-combobox

| Property | Type | Notes |
|----------|------|-------|
| datasource | datasource (list) | Options source |
| labelAttribute | attribute (String) | Display text |
| valueAttribute | attribute (String) | Option value |
| selectionMode | enumeration | single, multiple |
| allowSelectAll | boolean | Multi mode only |
| selectedValue | attribute (String, writable) | Single mode output |
| selectedValues | attribute (String, writable) | Multi mode JSON array output |
| defaultSelectedValues | attribute (String, optional) | JSON array of pre-selected values |
| placeholder | string | |
| disabled | boolean | |
| onChange | action | |

---

## Cascading Demo Data Model

**Combobox A options** (static dimension types):

Site, Team, Group, Part, Prious, Project, Block L1, Block L2, Function L1, Function L2, Activity L1, Activity L2

**Dependent combobox options** (per dimension key in `dimensionMockData`):

| Dimension | Mock values |
|-----------|-------------|
| Site | Site1, Site2, Site3 |
| Team | Team1, Team2, Team3 |
| Group | Group1, Group2 |
| Part | Part1, Part2, Part3 |
| Prious | Prious1, Prious2 |
| Project | Project1, Project2, Project3 |
| Block L1 | Block L1-A, Block L1-B |
| Block L2 | Block L2-A, Block L2-B, Block L2-C |
| Function L1 | Function L1-A, Function L1-B |
| Function L2 | Function L2-A, Function L2-B |
| Activity L1 | Activity L1-A, Activity L1-B, Activity L1-C |
| Activity L2 | Activity L2-A, Activity L2-B |
