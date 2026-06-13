# Feature Specification: Mendix Form Input Widgets (DatePicker & ComboBox)

**Feature Branch**: `004-form-input-widgets`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description — *"Dùng antd. Viết widget ax-datepicker (Select date/week/month/year) và ax-combobox (multi-select, select all, datasource, default value). Demo cascading combobox: Combobox A chọn dimension (Site, Team, Group…), các combobox phụ thuộc hiển thị giá trị tương ứng (Site1, Site2, Team1, Team2…)."*

## User Scenarios & Testing

### User Story 1 - Date Picker with Multiple Picker Modes (Priority: P1)

As a Mendix developer, I place an `ax-datepicker` widget on a page and configure the picker mode (date, week, month, year) so end users can select the appropriate time granularity using a familiar Ant Design control.

**Why this priority**: Simplest standalone widget; proves antd integration pattern for form widgets.

**Independent Test**: Open mock-ui → DatePicker tab → switch modes (date/week/month/year) → verify antd DatePicker renders and writes selected value to mock attribute.

**Acceptance Scenarios**:

1. **Given** `pickerMode=date`, **When** the user selects a date, **Then** `selectedDate` attribute is updated and `onChange` action executes.
2. **Given** `pickerMode=week`, **When** the user selects a week, **Then** the week start date is written to `selectedDate`.
3. **Given** `pickerMode=month` or `year`, **When** the user selects a value, **Then** the first day of that month/year is written to `selectedDate`.
4. **Given** a `defaultDate` attribute with a value, **When** the widget loads, **Then** the picker displays that default without overwriting until user interaction.

---

### User Story 2 - ComboBox with Datasource and Multi-Select (Priority: P1)

As a Mendix developer, I bind a ListValue datasource to `ax-combobox` with label/value attribute mappings so users can select one or many options, including a "Select all" action when enabled.

**Why this priority**: Core reusable input widget; datasource pattern aligns with chart/gantt widgets.

**Independent Test**: Open mock-ui → ComboBox tab → verify options load from mock ListValue; toggle multi-select and select-all; verify selected values write back.

**Acceptance Scenarios**:

1. **Given** a datasource with label/value attributes, **When** the widget loads, **Then** antd Select displays all options from the datasource.
2. **Given** `selectionMode=multiple` and `allowSelectAll=true`, **When** the user clicks "Select all", **Then** all visible options are selected.
3. **Given** pre-selected default values via `defaultSelectedValues` (String JSON array attribute), **When** the widget loads, **Then** those options appear selected.
4. **Given** `selectionMode=single`, **When** the user picks an option, **Then** `selectedValue` is updated (not `selectedValues`).
5. **Given** empty datasource, **When** the widget loads, **Then** an empty Select renders without runtime crash.

---

### User Story 3 - Cascading ComboBox Demo (Priority: P2)

As a dashboard developer, I see a mock-ui demo where Combobox A selects dimension types (Site, Team, Group, Part, Prious, Project, Block L1, Block L2, Function L1, Function L2, Activity L1, Activity L2) and dependent comboboxes appear dynamically, each showing fake values for the selected dimension (Site1/Site2, Team1/Team2, etc.).

**Why this priority**: Validates real-world multi-combobox orchestration; mock data proves the datasource + selection writeback model scales to dependent filters.

**Independent Test**: Open mock-ui → Cascading ComboBox tab → select "Site" in Combobox A → Combobox B appears with Site1, Site2… → add "Team" in A → Combobox C appears with Team1, Team2… → selections are independent per dimension.

**Acceptance Scenarios**:

1. **Given** no selection in Combobox A, **When** the demo loads, **Then** only Combobox A is visible with all 12 dimension type options.
2. **Given** "Site" selected in A, **When** rendered, **Then** a dependent combobox labeled "Site" shows options Site1, Site2, Site3 from mock data.
3. **Given** "Site" and "Team" selected in A, **When** rendered, **Then** two dependent comboboxes appear (Site values + Team values) and selections do not cross-contaminate.
4. **Given** a dimension deselected in A, **When** updated, **Then** its dependent combobox is removed and its selection state is cleared.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide Mendix pluggable widgets `ax-datepicker` and `ax-combobox` built on antd 6.4.3.
- **FR-002**: System MUST provide shared package `@iris/form-core` with datasource mapping helpers and mock data utilities.
- **FR-003**: `ax-datepicker` MUST support picker modes: `date`, `week`, `month`, `year`.
- **FR-004**: `ax-datepicker` MUST write selected value to a writable DateTime attribute and support optional default date attribute.
- **FR-005**: `ax-combobox` MUST consume Mendix ListValue datasource with `labelAttribute` and `valueAttribute` mappings.
- **FR-006**: `ax-combobox` MUST support `selectionMode` of `single` or `multiple`.
- **FR-007**: When `allowSelectAll=true` and mode is `multiple`, widget MUST provide select-all/deselect-all in dropdown.
- **FR-008**: `ax-combobox` MUST support default pre-selected values via Mendix attribute binding.
- **FR-009**: Both widgets MUST provide Studio Pro editor preview components.
- **FR-010**: mock-ui MUST include demos for DatePicker, ComboBox, and Cascading ComboBox with fake dimension hierarchy data.

### Non-Functional Requirements

- **NFR-001**: TypeScript 5.4 strict; React 18.2; `@mendix/pluggable-widgets-tools` 11.8.1.
- **NFR-002**: Widgets independently buildable via PNPM workspace.
- **NFR-003**: antd components styled consistently with existing Iris widgets (reuse ThemeProvider from `@iris/chart-ui` where applicable).

## Edge Cases

- Datasource loading → show antd loading state on Select; DatePicker disabled until ready (if bound).
- Invalid default JSON for multi-select → ignore defaults, log dev warning.
- Deselect all in multi mode → clear `selectedValues` to empty array string `[]`.
- Week/month/year picker → normalize to Date object before Mendix writeback.
- Large option lists (500+) → enable antd `virtual` scrolling on Select.
