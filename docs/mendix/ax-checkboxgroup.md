# Ax Checkbox Group — Mendix Implementation

**Widget ID**: `com.mendix.axcheckboxgroup.AxCheckboxGroup` | **Studio name**: Ax Checkbox Group

antd `Checkbox.Group` with **ListValue datasource** — same data model as [Ax Combo Box](./ax-combobox.md), different UI.

> **Cách sử dụng nhanh:** Datasource options giống Combo Box → map **Selected values** → String JSON → **On change** parse JSON trong microflow. Xem [using-widgets.md §6](./using-widgets.md#6-ax-checkbox-group) · Preview: mock-ui tab **Form**.

## Property mapping

| Property | Map |
|----------|-----|
| Data source | List of option objects |
| Label attribute | String — display text |
| Value attribute | String — stored value |
| Selected values | String writable — JSON array e.g. `["Site1","Site2"]` |
| Default selected values | String — JSON array (optional) |
| Disabled | boolean |
| On change | action |

## Entity example

`SiteOption`: `Code` (value), `Label` (label).

## Cascading filters

Use multiple instances with page-level microflows — see [cascading-combobox-pattern.md](./cascading-combobox-pattern.md).

## vs Combo Box

| | Combo Box | Checkbox Group |
|---|-----------|----------------|
| UI | Dropdown Select | Visible checkboxes |
| Multi-select | Yes + select all | Yes (toggle each) |
| Datasource | Same | Same |
