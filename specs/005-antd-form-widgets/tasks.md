# Tasks: Ant Design Form Widget Suite (Phase 2)

**Feature**: `005-antd-form-widgets`

**Input**: Design documents from `/specs/005-antd-form-widgets/` — mở rộng bộ antd form widgets: `ax-input`, `ax-numberinput`, `ax-switch`, `ax-textarea`, `ax-checkboxgroup` (tiếp nối `004-form-input-widgets`).

**Prerequisites**: `004-form-input-widgets` hoàn thành — `@iris/form-core`, `ax-datepicker`, `ax-combobox` đã tồn tại.

**Tech stack**: TypeScript 5.4 strict, React 18.2, antd 6.4.3, PNPM monorepo, `@mendix/pluggable-widgets-tools` 11.8.1

**Scope**:
- `packages/form-core` — shared JSON/editable helpers
- 5 widgets mới + mock-ui Form demo + Mendix docs

**Format**: `[ID] [P?] [Story] Description with file path`

---

## Phase 1: Setup

**Purpose**: Scaffold five widget projects and workspace scripts.

- [X] T001 [P] Scaffold `widgets/ax-input/` from `widgets/ax-datepicker/` — `package.json` name `ax-input`, widgetName `AxInput`, developmentPort **3007**, deps `antd@6.4.3`, `@iris/form-core`, `@iris/chart-ui`
- [X] T002 [P] Scaffold `widgets/ax-numberinput/` — name `ax-numberinput`, widgetName `AxNumberInput`, port **3008**, add `@types/big.js` devDep
- [X] T003 [P] Scaffold `widgets/ax-switch/` — name `ax-switch`, widgetName `AxSwitch`, port **3009**
- [X] T004 [P] Scaffold `widgets/ax-textarea/` — name `ax-textarea`, widgetName `AxTextArea`, port **3010**
- [X] T005 [P] Scaffold `widgets/ax-checkboxgroup/` — name `ax-checkboxgroup`, widgetName `AxCheckboxGroup`, port **3011**, reuse combobox datasource deps
- [X] T006 Add root `package.json` dev scripts `dev:input`, `dev:numberinput`, `dev:switch`, `dev:textarea`, `dev:checkboxgroup` mirroring `dev:datepicker` pattern

---

## Phase 2: Foundational — Extend `@iris/form-core` (Blocking)

**Purpose**: Shared helpers cho tất cả form widgets mới; refactor combobox dùng chung.

**⚠️ CRITICAL**: Hoàn thành trước Phase 3–7.

**Independent Test**: Import `parseJsonArray` và `createMockStringValue` từ `@iris/form-core`; verify parse `'["A","B"]'` → `["A","B"]`.

- [X] T007 Create `packages/form-core/src/utils/parseJsonArray.ts` — export `parseJsonArray(value: string | undefined): string[]` (move logic from `widgets/ax-combobox/src/main/components/ComboBoxView.tsx`)
- [X] T008 [P] Create `packages/form-core/src/utils/createMockEditableValue.ts` — export `createMockStringValue`, `createMockBooleanValue`, `createMockNumberValue` helpers for previews/demos (mirror mock-ui `editableValue.ts` pattern)
- [X] T009 Export new utils from `packages/form-core/src/index.ts`
- [X] T010 Refactor `widgets/ax-combobox/src/main/components/ComboBoxView.tsx` — import `parseJsonArray` from `@iris/form-core` instead of local function
- [X] T011 Run `pnpm --filter @iris/form-core run build` and `pnpm --filter ax-combobox run build` to verify refactor

**Checkpoint**: form-core extended — widget phases can proceed.

---

## Phase 3: User Story 1 — ax-input (Priority: P1) 🎯 MVP

**Goal**: antd Input Mendix widget với String writeback, default value, placeholder, maxLength.

**Independent Test**: mock-ui Form tab → type vào Input → mock String attribute cập nhật.

- [X] T012 [US1] Create `widgets/ax-input/src/AxInput.xml` — General: `placeholder`, `maxLength` integer optional, `disabled`, `allowClear`, `updateOn` enumeration (change/blur, default change); Value: `value` String writable, `defaultValue` String optional; Events: `onChange`
- [X] T013 [P] [US1] Create `widgets/ax-input/src/typings/AxInputProps.ts` — `UpdateOnEnum`, full props with `EditableValue<string>`, `ActionValue`
- [X] T014 [US1] Create `widgets/ax-input/src/main/components/InputView.tsx` — antd `Input`, sync `value`/`defaultValue`, write on change or blur per `updateOn`, fire `onChange` action
- [X] T015 [US1] Create `widgets/ax-input/src/AxInput.tsx` + `AxInput.editorPreview.tsx` + `preview/previewConfig.ts`
- [X] T016 [P] [US1] Create `widgets/ax-input/src/styles/ax-input.scss` — BEM `ax-input` full-width styling
- [X] T017 [US1] Create `docs/mendix/ax-input.md` — entity mẫu, property mapping, microflow On change, troubleshooting

**Checkpoint**: ax-input builds và có Mendix doc.

---

## Phase 4: User Story 2 — ax-numberinput (Priority: P1)

**Goal**: antd InputNumber với Decimal/Integer/Long writeback, min/max/step.

**Independent Test**: mock-ui → NumberInput → increment → Decimal attribute updates.

- [X] T018 [US2] Create `widgets/ax-numberinput/src/AxNumberInput.xml` — General: `min`, `max`, `step` (Decimal properties or integer where applicable), `precision` integer optional, `disabled`; Value: `value` attribute Decimal/Integer/Long writable, `defaultValue` optional same types; Events: `onChange`
- [X] T019 [P] [US2] Create `widgets/ax-numberinput/src/typings/AxNumberInputProps.ts` — `EditableValue<Big | number>`, `ActionValue`
- [X] T020 [US2] Create `widgets/ax-numberinput/src/main/components/NumberInputView.tsx` — antd `InputNumber`, convert Big ↔ number via `.toNumber()` / `big.js`, min/max/step/precision props
- [X] T021 [US2] Create entry + preview + scss in `widgets/ax-numberinput/src/` (AxNumberInput.tsx, editorPreview, ax-numberinput.scss)
- [X] T022 [US2] Create `docs/mendix/ax-numberinput.md` — map Decimal attribute, min/max examples

**Checkpoint**: ax-numberinput functional.

---

## Phase 5: User Story 3 — ax-switch (Priority: P2)

**Goal**: antd Switch với Boolean writeback.

**Independent Test**: mock-ui → toggle → Boolean attribute flips.

- [X] T023 [US3] Create `widgets/ax-switch/src/AxSwitch.xml` — General: `disabled`, `checkedLabel` string optional, `uncheckedLabel` string optional; Value: `value` Boolean writable, `defaultValue` Boolean optional; Events: `onChange`
- [X] T024 [P] [US3] Create `widgets/ax-switch/src/typings/AxSwitchProps.ts`
- [X] T025 [US3] Create `widgets/ax-switch/src/main/components/SwitchView.tsx` — antd `Switch`, optional `checkedChildren`/`unCheckedChildren` from labels
- [X] T026 [US3] Create entry + preview + scss in `widgets/ax-switch/src/`
- [X] T027 [US3] Create `docs/mendix/ax-switch.md`

**Checkpoint**: ax-switch functional.

---

## Phase 6: User Story 4 — ax-textarea (Priority: P2)

**Goal**: antd Input.TextArea với String writeback, rows, showCount.

**Independent Test**: mock-ui → type multi-line → String updates, char count visible when enabled.

- [X] T028 [US4] Create `widgets/ax-textarea/src/AxTextArea.xml` — General: `placeholder`, `rows` integer default 4, `maxLength` optional, `showCount` boolean, `disabled`; Value: `value` String writable (unlimited), `defaultValue` optional; Events: `onChange`
- [X] T029 [P] [US4] Create `widgets/ax-textarea/src/typings/AxTextAreaProps.ts`
- [X] T030 [US4] Create `widgets/ax-textarea/src/main/components/TextAreaView.tsx` — antd `Input.TextArea` with `showCount`, `maxLength`
- [X] T031 [US4] Create entry + preview + scss in `widgets/ax-textarea/src/`
- [X] T032 [US4] Create `docs/mendix/ax-textarea.md`

**Checkpoint**: ax-textarea functional.

---

## Phase 7: User Story 5 — ax-checkboxgroup (Priority: P2)

**Goal**: antd Checkbox.Group với ListValue datasource — pattern giống combobox (label/value, selectedValues JSON).

**Independent Test**: mock-ui → check options → `selectedValues` JSON correct.

- [X] T033 [US5] Create `widgets/ax-checkboxgroup/src/AxCheckboxGroup.xml` — Datasource: `datasource`, `labelAttribute`, `valueAttribute`; Behavior: `disabled`; Value: `selectedValues` String writable JSON array, `defaultSelectedValues` optional; Events: `onChange`
- [X] T034 [P] [US5] Create `widgets/ax-checkboxgroup/src/typings/AxCheckboxGroupProps.ts`
- [X] T035 [US5] Create `widgets/ax-checkboxgroup/src/main/hooks/useCheckboxGroupDatasource.ts` — reuse `mapDatasourceToOptions` from form-core
- [X] T036 [US5] Create `widgets/ax-checkboxgroup/src/main/components/CheckboxGroupView.tsx` — antd `Checkbox.Group` with options from hook, `value` from parsed JSON, writeback `JSON.stringify`
- [X] T037 [US5] Create entry + preview + scss in `widgets/ax-checkboxgroup/src/` — preview uses `DIMENSION_MOCK_DATA.Site`
- [X] T038 [US5] Create `docs/mendix/ax-checkboxgroup.md` — datasource + JSON selectedValues, link to cascading pattern

**Checkpoint**: ax-checkboxgroup functional.

---

## Phase 8: User Story 6 — Form Demo & Docs Index (Priority: P3)

**Goal**: Unified mock-ui demo + cập nhật docs index.

**Independent Test**: mock-ui Form tab shows all 5 new widgets + existing datepicker/combobox links; `docs/README.md` lists all form widgets.

- [X] T039 [US6] Create `mock-ui/src/demos/FormWidgetsDemo.tsx` — sections for Input, NumberInput, Switch, TextArea, CheckboxGroup with mock EditableValue state; reuse `createMockStringValue` from form-core
- [X] T040 [US6] Register Form tab in `mock-ui/src/App.tsx` — import `FormWidgetsDemo`, tab key `form`
- [X] T041 [P] [US6] Update `docs/README.md` — add rows for 5 new widgets + links to mendix docs
- [X] T042 [P] [US6] Update `docs/mendix/README.md` — add form widget section with links to all 7 form widgets (datepicker, combobox + 5 new)

**Checkpoint**: Full form suite documented and demoable.

---

## Phase 9: Polish & Cross-Cutting

- [X] T043 [P] Build all five widgets: `pnpm --filter ax-input run build` through `ax-checkboxgroup`
- [X] T044 [P] Lint and format all five widgets via `pnpm --filter ax-input run lint` (repeat per widget)
- [X] T045 Run `pnpm --filter mock-ui run build` smoke check — Form tab renders
- [X] T046 [P] Extend `packages/chart-ui/src/theme/ThemeProvider.tsx` Select/Input component tokens if InputNumber/Switch need theme tweaks (only if visual QA fails)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** (blocking) → **Phases 3–7** (widgets, parallel) → **Phase 8** → **Phase 9**

### User Story Dependencies

- **US1–US5**: Independent after Phase 2 — có thể làm song song
- **US6**: Depends on US1–US5 views being importable in FormWidgetsDemo

### Parallel Opportunities

- T001–T005 (scaffold 5 widgets) song song
- T007–T008 song song trong Phase 2
- US1–US5 phases song song sau Phase 2 (5 developers)
- T043–T044 build/lint song song

---

## Parallel Example: After Phase 2

```bash
Developer A: T012–T017 (ax-input)
Developer B: T018–T022 (ax-numberinput)
Developer C: T023–T027 (ax-switch)
Developer D: T028–T032 (ax-textarea)
Developer E: T033–T038 (ax-checkboxgroup)
# Then: T039–T042 (Form demo + docs index)
```

---

## Implementation Strategy

### MVP First

1. Phase 1–2 (scaffold + form-core)
2. Phase 3: **ax-input only** → validate pattern
3. Incrementally add NumberInput → Switch → TextArea → CheckboxGroup
4. Phase 8: unified demo

### Suggested MVP Scope

**User Story 1 (ax-input)** — smallest new widget proving text writeback pattern.

---

## Notes

- Copy widget structure từ `widgets/ax-datepicker/` — không copy chart providers.
- Checkbox group **không** cần select-all (checkbox UI khác combobox); multi-select via nhiều checkbox.
- Number input: handle `EditableValue<Big>` via `big.js` giống chart widgets.
- Mỗi widget cần `src/package.xml` với clientModule name `com.mendix.ax<inputname>`.
- Cập nhật `docs/mendix/01-common-patterns.md` nếu cần thêm Boolean/Number writeback examples (optional trong T042).

---

## Task Summary

| Metric | Count |
|--------|-------|
| **Total tasks** | 46 |
| Phase 1 Setup | 6 |
| Phase 2 Foundational | 5 |
| US1 Input | 6 |
| US2 NumberInput | 5 |
| US3 Switch | 5 |
| US4 TextArea | 5 |
| US5 CheckboxGroup | 6 |
| US6 Demo & Docs | 4 |
| Polish | 4 |

| User Story | Tasks | Parallel |
|------------|-------|----------|
| US1 Input | T012–T017 | T013, T016 |
| US2 NumberInput | T018–T022 | T019 |
| US3 Switch | T023–T027 | T024 |
| US4 TextArea | T028–T032 | T029 |
| US5 CheckboxGroup | T033–T038 | T034 |
| US6 Demo/Docs | T039–T042 | T041, T042 |

**Format validation**: ✅ All 46 tasks use checklist format with Task ID, file paths, [USn] labels where required.
