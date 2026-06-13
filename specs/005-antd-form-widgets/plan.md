# Implementation Plan: Ant Design Form Widget Suite (Phase 2)

**Branch**: `005-antd-form-widgets` | **Date**: 2026-06-13 | **Spec**: [spec.md](./spec.md)

**Prerequisite**: `004-form-input-widgets` complete (`@iris/form-core`, `ax-datepicker`, `ax-combobox`).

---

## Summary

Add five Mendix pluggable form widgets wrapping antd Input, InputNumber, Switch, Input.TextArea, and Checkbox.Group. Shared utilities extend `@iris/form-core`. mock-ui gets a unified Form demo tab; `docs/mendix/` gets per-widget guides.

---

## Technical Context

**Stack**: TypeScript 5.4, React 18.2, antd 6.4.3, SCSS, `@mendix/pluggable-widgets-tools` 11.8.1

**Packages**: `@iris/form-core` (extended), `@iris/chart-ui` (ThemeProvider)

**New widgets**:

| Widget | antd component | Dev port |
|--------|----------------|----------|
| `ax-input` | Input | 3007 |
| `ax-numberinput` | InputNumber | 3008 |
| `ax-switch` | Switch | 3009 |
| `ax-textarea` | Input.TextArea | 3010 |
| `ax-checkboxgroup` | Checkbox.Group | 3011 |

---

## Project Structure

```text
packages/form-core/src/
├── utils/parseJsonArray.ts          # shared from combobox pattern
├── utils/createMockEditableValue.ts # mock helpers for previews/demos
└── index.ts                         # re-export

widgets/ax-input/src/...
widgets/ax-numberinput/src/...
widgets/ax-switch/src/...
widgets/ax-textarea/src/...
widgets/ax-checkboxgroup/src/...

mock-ui/src/demos/FormWidgetsDemo.tsx
docs/mendix/ax-input.md
docs/mendix/ax-numberinput.md
docs/mendix/ax-switch.md
docs/mendix/ax-textarea.md
docs/mendix/ax-checkboxgroup.md
```

---

## Widget Property Summary

### ax-input

`value` (String writable), `defaultValue` (String), `placeholder`, `maxLength`, `disabled`, `allowClear`, `updateOn` (change/blur), `onChange`

### ax-numberinput

`value` (Decimal/Integer/Long writable), `defaultValue`, `min`, `max`, `step`, `precision`, `disabled`, `onChange`

### ax-switch

`value` (Boolean writable), `defaultValue` (Boolean), `disabled`, `checkedLabel`, `uncheckedLabel`, `onChange`

### ax-textarea

`value` (String writable), `defaultValue`, `placeholder`, `rows`, `maxLength`, `showCount`, `disabled`, `onChange`

### ax-checkboxgroup

Same datasource model as combobox: `datasource`, `labelAttribute`, `valueAttribute`, `selectedValues` (JSON array), `defaultSelectedValues`, `disabled`, `onChange`

---

## Design Decisions

| Decision | Choice |
|----------|--------|
| Shared parse JSON | Move to `form-core` — used by combobox + checkbox group |
| Widget scaffold | Copy `ax-datepicker` structure |
| Styling | BEM `ax-*` + reuse combobox tag styles where applicable |
| Docs | Extend existing `docs/mendix/` pattern from 004 |
