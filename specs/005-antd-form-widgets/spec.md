# Feature Specification: Ant Design Form Widget Suite (Phase 2)

**Feature Branch**: `005-antd-form-widgets`

**Created**: 2026-06-13

**Status**: Draft

**Input**: *"/speckit-tasks viết antd form widget"* — mở rộng bộ Mendix form widgets trên antd 6.4.3, tiếp nối `004-form-input-widgets` (đã có `ax-datepicker`, `ax-combobox`).

## User Scenarios & Testing

### User Story 1 - Text Input (Priority: P1)

As a Mendix developer, I bind `ax-input` to a writable String attribute so users can enter plain text with placeholder, max length, and onChange action.

**Independent Test**: mock-ui → Form tab → type text → `value` attribute updates.

**Acceptance Scenarios**:

1. **Given** writable String attribute, **When** user types, **Then** attribute updates on change (or blur — configurable).
2. **Given** `defaultValue` attribute, **When** widget loads, **Then** input shows default until user edits.
3. **Given** `disabled=true`, **When** rendered, **Then** input is read-only styled.

---

### User Story 2 - Number Input (Priority: P1)

As a Mendix developer, I use `ax-numberinput` for Decimal/Integer/Long attributes with min, max, step, and formatter controls.

**Independent Test**: mock-ui → increment/decrement → numeric attribute updates within min/max.

**Acceptance Scenarios**:

1. **Given** Decimal attribute, **When** user changes value, **Then** Big/number writeback is correct.
2. **Given** min/max configured, **When** user enters out-of-range, **Then** antd clamps or rejects per config.

---

### User Story 3 - Switch (Priority: P2)

As a Mendix developer, I bind `ax-switch` to a Boolean attribute for on/off toggles.

**Independent Test**: mock-ui → toggle switch → Boolean attribute flips.

---

### User Story 4 - Text Area (Priority: P2)

As a Mendix developer, I bind `ax-textarea` to a String (unlimited) attribute with configurable rows and character count.

**Independent Test**: mock-ui → multi-line text → String attribute updates.

---

### User Story 5 - Checkbox Group with Datasource (Priority: P2)

As a Mendix developer, I bind `ax-checkboxgroup` to ListValue datasource (label/value) with multi-select writeback as JSON array — same pattern as `ax-combobox` but antd Checkbox.Group UI.

**Independent Test**: mock-ui → check Site1, Site2 → `selectedValues` JSON `["Site1","Site2"]`.

---

### User Story 6 - Form Demo Page & Mendix Docs (Priority: P3)

As a developer, I see all form widgets on one mock-ui page and Mendix implementation docs for each new widget.

**Independent Test**: `docs/mendix/` contains guides for Input, Number, Switch, TextArea, CheckboxGroup.

---

## Requirements

- **FR-001**: Widgets `ax-input`, `ax-numberinput`, `ax-switch`, `ax-textarea`, `ax-checkboxgroup` on antd 6.4.3.
- **FR-002**: Reuse `@iris/form-core` and `@iris/chart-ui` ThemeProvider; extend form-core with shared editable-value helpers.
- **FR-003**: Each widget: XML, typings, View, editorPreview, SCSS, mock-ui demo, Mendix doc.
- **FR-004**: Datasource widgets (checkbox group) reuse `mapDatasourceToOptions`.
- **FR-005**: All widgets support `disabled`, `onChange` action, default value binding where applicable.

## Edge Cases

- Empty/null attribute → show empty control, no crash.
- Number input with null → treat as undefined in antd InputNumber.
- Checkbox group invalid default JSON → ignore defaults.
- String unlimited vs limited — widget supports `maxLength` property where antd allows.
