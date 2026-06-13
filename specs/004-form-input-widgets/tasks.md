# Tasks: Form Input Widgets (DatePicker & ComboBox)

**Feature**: `004-form-input-widgets`

**Input**: Design documents from `/specs/004-form-input-widgets/` — antd-based `ax-datepicker` (date/week/month/year modes) and `ax-combobox` (datasource, multi-select, select all, default values) with mock-ui cascading dimension-filter demo.

**Tech stack**: TypeScript 5.4 strict, React 18.2, antd 6.4.3, dayjs, PNPM monorepo, `@mendix/pluggable-widgets-tools` 11.8.1

**Scope**:
- `packages/form-core` — shared ComboboxOption types, datasource adapter, dimension mock data
- `widgets/ax-datepicker` — antd DatePicker Mendix widget
- `widgets/ax-combobox` — antd Select Mendix widget
- `mock-ui` — DatePicker, ComboBox, and Cascading ComboBox demos

**Format**: `[ID] [P?] [Story] Description with file path`

- **[P]**: Parallelizable (different files, no blocking dependency)
- **[USn]**: User story from spec.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold shared package and both widget projects following existing monorepo conventions.

- [X] T001 Create `packages/form-core/package.json` with name `@iris/form-core`, workspace deps on `typescript`, peer on `mendix` types; scripts `build` (tsc) and `clean`
- [X] T002 [P] Create `packages/form-core/tsconfig.json` extending root strict TypeScript config matching `packages/chart-core/tsconfig.json`
- [X] T003 [P] Scaffold `widgets/ax-datepicker/` by copying structure from `widgets/ax-columnchart/` — update `package.json` (name `ax-datepicker`, widgetName `AxDatePicker`, developmentPort 3005), remove chart-specific deps, add `antd@6.4.3`, `dayjs`, `@iris/form-core`, `@iris/chart-ui`
- [X] T004 [P] Scaffold `widgets/ax-combobox/` by copying structure from `widgets/ax-columnchart/` — update `package.json` (name `ax-combobox`, widgetName `AxComboBox`, developmentPort 3006), remove chart-specific deps, add `antd@6.4.3`, `@iris/form-core`, `@iris/chart-ui`
- [X] T005 [P] Add `@iris/form-core` workspace dependency to `mock-ui/package.json`

---

## Phase 2: Foundational — Shared `@iris/form-core` (Blocking)

**Purpose**: Core types, datasource adapter, and mock data that BOTH widgets and mock-ui depend on.

**⚠️ CRITICAL**: No widget implementation can begin until T006–T011 are complete.

**Independent Test**: Import `mapDatasourceToOptions` and `DIMENSION_MOCK_DATA` in a scratch file; pass a mock ListValue with 3 items; verify 3 `ComboboxOption` objects with correct `label` and `value`.

### Implementation

- [X] T006 Create `packages/form-core/src/contracts/combobox-option.ts` — export interface `ComboboxOption { value: string; label: string }`
- [X] T007 Create `packages/form-core/src/adapters/ComboboxDatasourceAdapter.ts` — export `ComboboxMapping` interface (`labelAttribute: ListAttributeValue<string>`, `valueAttribute: ListAttributeValue<string>`) and `mapDatasourceToOptions(datasource: ListValue, mapping: ComboboxMapping): ComboboxOption[]` that iterates `datasource.items`, reads `.get(item).value`, skips rows with empty value
- [X] T008 [P] Create `packages/form-core/src/utils/createMockComboboxDatasource.ts` — export `createMockComboboxDatasource(options: ComboboxOption[]): MockComboboxDatasource` returning fake `ListValue` with `status: "available"` and `ListAttributeValue` getters (mirror pattern from `packages/chart-core/src/utils/mockData.ts`)
- [X] T009 [P] Create `packages/form-core/src/mocks/dimensionMockData.ts` — export `DIMENSION_TYPES` array (Site, Team, Group, Part, Prious, Project, Block L1, Block L2, Function L1, Function L2, Activity L1, Activity L2) and `DIMENSION_MOCK_DATA: Record<string, ComboboxOption[]>` with fake values (Site1–Site3, Team1–Team3, Group1–Group2, Part1–Part3, Prious1–Prious2, Project1–Project3, Block L1-A/B, Block L2-A/B/C, Function L1-A/B, Function L2-A/B, Activity L1-A/B/C, Activity L2-A/B)
- [X] T010 Export all public API from `packages/form-core/src/index.ts` — `ComboboxOption`, `ComboboxMapping`, `mapDatasourceToOptions`, `createMockComboboxDatasource`, `DIMENSION_TYPES`, `DIMENSION_MOCK_DATA`, `MockComboboxDatasource`
- [X] T011 Run `pnpm --filter @iris/form-core run build` and verify zero TypeScript errors in `packages/form-core/src/`

**Checkpoint**: Shared infrastructure ready — widget phases 3–4 and mock-ui phase 5 can proceed.

---

## Phase 3: User Story 1 — ax-datepicker (Priority: P1) 🎯 MVP

**Goal**: Mendix pluggable widget wrapping antd DatePicker with selectable modes date/week/month/year, default date support, and DateTime writeback.

**Independent Test**: Open mock-ui → DatePicker tab → cycle pickerMode (date/week/month/year) → pick a value → verify mock `selectedDate` state updates.

### Implementation

- [X] T012 [US1] Create `widgets/ax-datepicker/src/AxDatePicker.xml` — propertyGroup General: `pickerMode` enumeration (date/week/month/year, default date), `placeholder` string, `disabled` boolean default false, `allowClear` boolean default true; propertyGroup Value: `selectedDate` attribute DateTime writable, `defaultDate` attribute DateTime optional; propertyGroup Events: `onChange` action
- [X] T013 [P] [US1] Create `widgets/ax-datepicker/src/typings/AxDatePickerProps.ts` — export `PickerModeEnum = "date" | "week" | "month" | "year"`, `AxDatePickerContainerProps`, `AxDatePickerProps` with Mendix types (`EditableValue<Date>`, `ActionValue`)
- [X] T014 [US1] Create `widgets/ax-datepicker/src/main/components/DatePickerView.tsx` — render antd `DatePicker` with `picker={pickerMode}`, map `defaultDate` to initial `dayjs` value, on change convert dayjs → `Date` and write to `selectedDate.setValue()`, execute `onChange` action if canExecute
- [X] T015 [P] [US1] Create `widgets/ax-datepicker/src/preview/previewConfig.ts` — export `PREVIEW_PLACEHOLDER` and default preview date constant
- [X] T016 [US1] Create `widgets/ax-datepicker/src/AxDatePicker.tsx` — wrap `DatePickerView` in `@iris/chart-ui` `ThemeProvider`; export `AxDatePickerContainer` stub div
- [X] T017 [US1] Create `widgets/ax-datepicker/src/AxDatePicker.editorPreview.tsx` — static preview with `pickerMode="date"` and sample default date
- [X] T018 [P] [US1] Create `widgets/ax-datepicker/src/styles/ax-datepicker.scss` — BEM class `ax-datepicker` with full-width DatePicker styling
- [X] T019 [US1] Create `mock-ui/src/demos/DatePickerDemo.tsx` — local state mock for `selectedDate` and Segmented control to switch pickerMode; render `DatePickerView` or full widget with mock EditableValue helpers from `mock-ui/src/mocks/editableValue.ts`
- [X] T020 [US1] Register DatePicker tab in `mock-ui/src/App.tsx` — import `DatePickerDemo`, add tab key `datepicker` to existing Tabs layout

**Checkpoint**: ax-datepicker renders in mock-ui and Studio preview; date writeback works for all four picker modes.

---

## Phase 4: User Story 2 — ax-combobox (Priority: P1)

**Goal**: Mendix pluggable widget wrapping antd Select with ListValue datasource, single/multi selection, select-all, and default pre-selected values.

**Independent Test**: Open mock-ui → ComboBox tab → verify options from mock datasource; enable multi + select all; confirm `selectedValues` JSON updates.

### Implementation

- [X] T021 [US2] Create `widgets/ax-combobox/src/AxComboBox.xml` — propertyGroup Datasource: `datasource` (list, required), `labelAttribute` String required, `valueAttribute` String required; propertyGroup Behavior: `selectionMode` enumeration (single/multiple, default single), `allowSelectAll` boolean default false, `placeholder` string, `disabled` boolean; propertyGroup Value: `selectedValue` String writable (single), `selectedValues` String writable (multi JSON array), `defaultSelectedValues` String optional (JSON array); propertyGroup Events: `onChange` action
- [X] T022 [P] [US2] Create `widgets/ax-combobox/src/typings/AxComboBoxProps.ts` — export `SelectionModeEnum`, full props interface with `ListValue`, `ListAttributeValue<string>`, `EditableValue<string>`, `ActionValue`
- [X] T023 [US2] Create `widgets/ax-combobox/src/main/hooks/useComboboxDatasource.ts` — react to `datasource.status`: loading → return `{ options: [], loading: true }`; available → call `mapDatasourceToOptions`; handle empty/unavailable
- [X] T024 [US2] Create `widgets/ax-combobox/src/main/components/ComboBoxView.tsx` — antd `Select` with `mode={selectionMode === "multiple" ? "multiple" : undefined}`, `options` from hook, `value` from `selectedValue` or parsed `selectedValues` JSON, `defaultValue` from `defaultSelectedValues` JSON on mount; when `allowSelectAll && multiple` add dropdown header option "Select all" / "Deselect all" toggling all `options`; on change write back single string or `JSON.stringify(array)`; call `onChange` action
- [X] T025 [P] [US2] Create `widgets/ax-combobox/src/preview/previewConfig.ts` — preview placeholder and sample options via `createMockComboboxDatasource(DIMENSION_MOCK_DATA.Site)`
- [X] T026 [US2] Create `widgets/ax-combobox/src/AxComboBox.tsx` — wrap `ComboBoxView` in `ThemeProvider`; export container stub
- [X] T027 [US2] Create `widgets/ax-combobox/src/AxComboBox.editorPreview.tsx` — preview with mock Site options, multi mode, select all enabled
- [X] T028 [P] [US2] Create `widgets/ax-combobox/src/styles/ax-combobox.scss` — BEM class `ax-combobox` full-width Select styling
- [X] T029 [US2] Create `mock-ui/src/demos/ComboBoxDemo.tsx` — mock datasource from `DIMENSION_MOCK_DATA.Site`, toggles for single/multi and allowSelectAll, display current selection JSON
- [X] T030 [US2] Register ComboBox tab in `mock-ui/src/App.tsx` — import `ComboBoxDemo`, add tab key `combobox`

**Checkpoint**: ax-combobox renders options from datasource; single and multi modes work; select all toggles all options.

---

## Phase 5: User Story 3 — Cascading ComboBox Demo (Priority: P2)

**Goal**: mock-ui demo where Combobox A selects dimension types and dynamic dependent comboboxes (B, C, …) appear with fake values per selected dimension.

**Independent Test**: Open mock-ui → Cascading tab → select Site in A → Site combobox appears with Site1–Site3 → add Team → Team combobox appears independently → deselect Site → Site combobox removed.

### Implementation

- [X] T031 [P] [US3] Create `mock-ui/src/mocks/comboboxDimensions.ts` — re-export `DIMENSION_TYPES` and `DIMENSION_MOCK_DATA` from `@iris/form-core`; export helper `getOptionsForDimension(type: string): ComboboxOption[]`
- [X] T032 [US3] Create `mock-ui/src/demos/CascadingComboboxDemo.tsx` — Combobox A: antd Select multiple with `DIMENSION_TYPES` as static options; state `activeDimensions: string[]`; for each active dimension render a labeled dependent Select (multi, select all) fed by `getOptionsForDimension(dim)`; store selections in `Record<string, string[]>`; removing dimension from A clears its selection entry
- [X] T033 [US3] Register Cascading tab in `mock-ui/src/App.tsx` — import `CascadingComboboxDemo`, add tab key `cascading`; add brief description text explaining Mendix page would wire widget `onChange` → refresh downstream datasource constraints
- [X] T034 [US3] Add default-selected demo state in `mock-ui/src/demos/CascadingComboboxDemo.tsx` — pre-select "Site" in Combobox A and "Site1" in dependent Site combobox to demonstrate default value behavior

**Checkpoint**: Full cascading demo works with all 12 dimension types and independent per-dimension selections.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build verification, lint, and widget release readiness.

- [X] T035 [P] Verify `widgets/ax-datepicker` builds via `pnpm --filter ax-datepicker run build`
- [X] T036 [P] Verify `widgets/ax-combobox` builds via `pnpm --filter ax-combobox run build`
- [X] T037 [P] Run lint on `widgets/ax-datepicker` and `widgets/ax-combobox` via `pnpm --filter ax-datepicker run lint` and `pnpm --filter ax-combobox run lint`
- [X] T038 Run `pnpm --filter mock-ui run dev` smoke check — all three new tabs (DatePicker, ComboBox, Cascading) render without console errors
- [X] T039 [P] Add root `package.json` dev scripts `dev:datepicker` and `dev:combobox` mirroring existing `dev:barchart` pattern

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS** all user stories
- **US1 DatePicker (Phase 3)**: Depends on Phase 2 (form-core for consistency; widget itself only needs antd)
- **US2 ComboBox (Phase 4)**: Depends on Phase 2 — **requires** `mapDatasourceToOptions` and mock helpers
- **US3 Cascading Demo (Phase 5)**: Depends on Phase 2 (`DIMENSION_MOCK_DATA`); demo uses antd Select directly but validates combobox UX patterns before/alongside T024
- **Polish (Phase 6)**: Depends on Phases 3–5

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2 — no dependency on US2/US3
- **US2 (P1)**: Independent after Phase 2 — no dependency on US1/US3
- **US3 (P2)**: Depends on Phase 2 mock data; logically follows US2 (demonstrates combobox patterns) but can be built in parallel with US2 using antd Select directly

### Parallel Opportunities

- T003 + T004 (widget scaffolds) in parallel after T001–T002
- T008 + T009 (mock helpers + dimension data) in parallel within Phase 2
- Phase 3 (US1) and Phase 4 (US2) can run in parallel by different developers after Phase 2
- T035 + T036 + T037 (build/lint) in parallel in Phase 6

---

## Parallel Example: User Story 2

```bash
# After Phase 2 completes, launch independent US2 files together:
Task T022: "Create AxComboBoxProps.ts in widgets/ax-combobox/src/typings/"
Task T025: "Create previewConfig.ts in widgets/ax-combobox/src/preview/"
Task T028: "Create ax-combobox.scss in widgets/ax-combobox/src/styles/"

# Then sequential core:
Task T023: useComboboxDatasource hook
Task T024: ComboBoxView (depends on T023)
Task T026–T027: Entry + preview (depends on T024)
```

---

## Parallel Example: User Story 1 + User Story 2

```bash
# Two developers after Phase 2 checkpoint:
Developer A: T012–T020 (ax-datepicker + DatePickerDemo)
Developer B: T021–T030 (ax-combobox + ComboBoxDemo)
# Merge, then Developer A or B: T031–T034 (Cascading demo)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (form-core)
3. Complete Phase 3: ax-datepicker
4. **STOP and VALIDATE**: DatePicker tab in mock-ui, all four picker modes
5. Demo/deploy datepicker widget MPK

### Incremental Delivery

1. Setup + Foundational → shared package ready
2. US1 ax-datepicker → test independently → MVP release
3. US2 ax-combobox → test independently → second widget release
4. US3 Cascading demo → validates real-world multi-filter UX
5. Polish → build/lint/release both widgets

### Suggested MVP Scope

**User Story 1 (ax-datepicker)** — smallest vertical slice proving antd Mendix widget pattern.

---

## Notes

- Cascading behavior is intentionally implemented in mock-ui (T032), not inside a single widget — Mendix pages compose multiple `ax-combobox` instances with microflow/nanoflow datasource refresh.
- Use `dayjs` for all DatePicker value conversions; do not import moment.
- `selectedValues` and `defaultSelectedValues` use JSON string format e.g. `["Site1","Site2"]` for Mendix String attribute compatibility.
- Reuse `@iris/chart-ui` `ThemeProvider` for antd ConfigProvider — do not duplicate theme setup.
- Widget XML must follow Mendix schema rules from `specs/002-enterprise-gantt-widget/contracts/widget-xml.md` (defaultValue not default, caption before description).

---

## Task Summary

| Metric | Count |
|--------|-------|
| **Total tasks** | 39 |
| **Phase 1 Setup** | 5 |
| **Phase 2 Foundational** | 6 |
| **US1 DatePicker** | 9 |
| **US2 ComboBox** | 10 |
| **US3 Cascading Demo** | 4 |
| **Polish** | 5 |

| User Story | Tasks | Parallel tasks |
|------------|-------|----------------|
| US1 DatePicker | T012–T020 (9) | T013, T015, T018 |
| US2 ComboBox | T021–T030 (10) | T022, T025, T028 |
| US3 Cascading | T031–T034 (4) | T031 |

**Format validation**: ✅ All 39 tasks use checklist format with Task ID; story phases include [USn] labels; parallel tasks marked [P]; all include file paths.
