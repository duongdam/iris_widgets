# Tasks: Migrate Chart Widgets to Mendix ListValue Datasource

**Feature**: `003-datasource-migration`

**Input**: Migrate all chart widgets (`ax-barchart`, `ax-columnchart`, `ax-stackareachart`, `ax-reportchart`, `ax-negativebarchart`) from JSON string attribute data input (`jsonData` + `dataFormat`) to a Mendix `ListValue` datasource pattern — matching the `propertyGroup caption="Data Source"` design of `ax-ganttchart`.

**Tech stack**: TypeScript 5.4 strict, React 18.2, MobX 6.16, PNPM monorepo, `@mendix/pluggable-widgets-tools` 11.8.1

**Scope**:
- `packages/chart-core` — new `DatasourceAdapter`
- `packages/chart-ui` — new `useChartDatasource` hook
- `widgets/ax-barchart`, `ax-columnchart`, `ax-stackareachart`, `ax-reportchart`, `ax-negativebarchart` — XML + typings + View
- `mock-ui` — updated demo helpers

**Format**: `[ID] [P?] [Story] Description with file path`

- **[P]**: Parallelizable (different files, no blocking dependency)
- **[USn]**: User story / widget scope

---

## Phase 1: Setup

**Purpose**: Verify scope and update workspace config if needed.

- [X] T001 Read current `packages/chart-core/src/index.ts` and `packages/chart-ui/src/index.ts` to confirm exported API surface before modification
- [X] T002 [P] Read `widgets/ax-barchart/src/typings/AxBarChartProps.ts` to capture exact current `Data` prop shape as migration reference
- [X] T003 [P] Confirm `mendix` package exports `ListValue` and `ListAttributeValue<T>` types by reading `node_modules/mendix/index.d.ts` or existing usages in `widgets/ax-ganttchart/src/typings/AxGanttChartProps.d.ts`

---

## Phase 2: Foundational — Shared Infrastructure (Blocking)

**Purpose**: Add `DatasourceAdapter` to `chart-core` and `useChartDatasource` hook to `chart-ui`. ALL widget migrations depend on this phase.

**⚠️ CRITICAL**: No per-widget migration work can begin until T004–T009 are complete.

**Independent Test**: Import `mapDatasourceToRecords` in a widget view, pass a mock `ListValue` with 3 items, verify 3 `ChartRecord` objects are returned with correct `id`, `name`, `period`, `pm` values.

### Implementation

- [X] T004 Create `packages/chart-core/src/adapters/DatasourceAdapter.ts` — export `DatasourceMapping` interface (`idAttribute?: ListAttributeValue<string>`, `nameAttribute: ListAttributeValue<string>`, `periodAttribute: ListAttributeValue<string>`, `valueAttribute: ListAttributeValue<Big>`) and `mapDatasourceToRecords(datasource: ListValue, mapping: DatasourceMapping): ChartRecord[]` that iterates `datasource.items`, reads each attribute via `.get(item).value`, converts `Big` to `number` via `.toNumber()`, and generates `id` from `generateId()` if `idAttribute` is absent
- [X] T005 [P] Add `export { mapDatasourceToRecords, type DatasourceMapping } from "./adapters/DatasourceAdapter"` to `packages/chart-core/src/index.ts`
- [X] T006 Create `packages/chart-ui/src/hooks/useChartDatasource.ts` — signature `useChartDatasource(store: ChartStore, datasource: ListValue | undefined, mapping: DatasourceMapping): UseChartDataResult`. Reactively maps `datasource.status === "available"` → call `mapDatasourceToRecords` → `store.setRecords(records)`. Handle `status === "loading"` → `store.setLoading(true)`. Return `{ error, isEmpty }` matching `UseChartDataResult` type from `useChartData.ts`
- [X] T007 [P] Add `export { useChartDatasource } from "./hooks/useChartDatasource"` to `packages/chart-ui/src/index.ts`
- [X] T008 [P] Verify no TypeScript errors in `packages/chart-core` by reading lints on `packages/chart-core/src/adapters/DatasourceAdapter.ts`
- [X] T009 [P] Verify no TypeScript errors in `packages/chart-ui` by reading lints on `packages/chart-ui/src/hooks/useChartDatasource.ts`

**Checkpoint**: Shared infrastructure ready — per-widget phases 3–7 can now begin in parallel.

---

## Phase 3: User Story 1 — Migrate ax-barchart (Priority: P1) 🎯 MVP

**Goal**: Replace `jsonData`/`dataFormat` in `ax-barchart` with `datasource` + attribute mappings. All existing Display/Selection/Events properties remain unchanged.

**Independent Test**: Open mock-ui → Bar Chart tab → verify bars render from mock `ListValue` with `name`, `period`, `pm` items; existing selection and click events still work.

### Implementation

- [X] T010 [US1] Update `widgets/ax-barchart/src/AxBarChart.xml` — replace `propertyGroup caption="Data"` block: remove `jsonData` (String attribute) and `dataFormat` (enumeration); add `datasource` (`type="datasource" isList="true" required="true"`), `idAttribute` (`type="attribute" dataSource="datasource" required="false"` — String/AutoNumber), `nameAttribute` (`type="attribute" dataSource="datasource" required="true"` — String), `periodAttribute` (`type="attribute" dataSource="datasource" required="true"` — String), `valueAttribute` (`type="attribute" dataSource="datasource" required="true"` — Decimal/Integer/Long)
- [X] T011 [US1] Update `widgets/ax-barchart/src/typings/AxBarChartProps.ts` — remove `jsonData: EditableValue<string>` and `dataFormat: "flat" | "elastic"`; add `import type { ListValue, ListAttributeValue } from "mendix"`, `import type { Big } from "big.js"`, and props `datasource: ListValue`, `idAttribute?: ListAttributeValue<string>`, `nameAttribute: ListAttributeValue<string>`, `periodAttribute: ListAttributeValue<string>`, `valueAttribute: ListAttributeValue<Big>`
- [X] T012 [US1] Update `widgets/ax-barchart/src/main/components/BarChartView.tsx` — replace `const jsonData = widgetProps.jsonData.value ?? ""` and `useChartData(store, jsonData, widgetProps.dataFormat)` with `useChartDatasource(store, widgetProps.datasource, { idAttribute: widgetProps.idAttribute, nameAttribute: widgetProps.nameAttribute, periodAttribute: widgetProps.periodAttribute, valueAttribute: widgetProps.valueAttribute })`; remove `jsonData` from `useEffect` deps; update import to include `useChartDatasource` from `@iris/chart-ui`
- [X] T013 [US1] Update `widgets/ax-barchart/src/AxBarChart.editorPreview.tsx` — remove `previewJsonData` and `dataFormat` from `previewProps`; add mock `datasource` using static `ChartRecord[]` converted to a fake `ListValue` shape with `status: "available"` and `items` array where each item exposes `.get()` returning mock attribute values

**Checkpoint**: ax-barchart fully migrated; bar chart renders from datasource in mock-ui.

---

## Phase 4: User Story 2 — Migrate ax-columnchart (Priority: P1)

**Goal**: Same migration pattern as ax-barchart applied to `ax-columnchart`.

**Independent Test**: Open mock-ui → Column Chart tab → verify columns render from mock `ListValue`.

### Implementation

- [X] T014 [P] [US2] Update `widgets/ax-columnchart/src/AxColumnChart.xml` — same Data section replacement as T010 (datasource + 4 attribute properties)
- [X] T015 [P] [US2] Update `widgets/ax-columnchart/src/typings/AxColumnChartProps.ts` — same typings replacement as T011
- [X] T016 [P] [US2] Update `widgets/ax-columnchart/src/main/components/ColumnChartView.tsx` — same hook replacement as T012
- [X] T017 [P] [US2] Update `widgets/ax-columnchart/src/AxColumnChart.editorPreview.tsx` — same preview mock as T013

**Checkpoint**: ax-columnchart migrated; parallelizable with Phase 3.

---

## Phase 5: User Story 3 — Migrate ax-stackareachart (Priority: P1)

**Goal**: Same migration pattern applied to `ax-stackareachart`. Note: existing `referenceLineValue` and `referenceLineLabel` properties stay in their `propertyGroup caption="Reference Line"` — only the `Data` group changes.

**Independent Test**: Open mock-ui → Stack Area tab → verify stacked areas render from mock `ListValue`; reference line still renders at value 110.

### Implementation

- [X] T018 [P] [US3] Update `widgets/ax-stackareachart/src/AxStackAreaChart.xml` — replace `propertyGroup caption="Data"` with datasource + 4 attribute properties; keep `propertyGroup caption="Reference Line"` block unchanged
- [X] T019 [P] [US3] Update `widgets/ax-stackareachart/src/typings/AxStackAreaChartProps.ts` — same typings replacement as T011; `referenceLineValue?: EditableValue<Big>` and `referenceLineLabel: string` remain unchanged
- [X] T020 [P] [US3] Update `widgets/ax-stackareachart/src/main/components/StackAreaChartView.tsx` — replace `useChartData` with `useChartDatasource`; remove `jsonData` variable; keep `referenceLineValue` / `referenceLineLabel` pass-through unchanged
- [X] T021 [P] [US3] Update `widgets/ax-stackareachart/src/AxStackAreaChart.editorPreview.tsx` — replace `previewJsonData` with mock `ListValue`

**Checkpoint**: ax-stackareachart migrated; reference line feature unaffected.

---

## Phase 6: User Story 4 — Migrate ax-reportchart (Priority: P2)

**Goal**: Same migration pattern applied to `ax-reportchart`.

**Independent Test**: Open mock-ui → Report Chart tab → verify report chart renders from mock `ListValue`.

### Implementation

- [X] T022 [P] [US4] Update `widgets/ax-reportchart/src/AxReportChart.xml` — same Data section replacement
- [X] T023 [P] [US4] Update `widgets/ax-reportchart/src/typings/AxReportChartProps.ts` — same typings replacement
- [X] T024 [P] [US4] Update report chart View component — same hook replacement (check exact file path under `widgets/ax-reportchart/src/main/components/`)
- [X] T025 [P] [US4] Update `widgets/ax-reportchart/src/AxReportChart.editorPreview.tsx` — same preview mock

**Checkpoint**: ax-reportchart migrated.

---

## Phase 7: User Story 5 — Migrate ax-negativebarchart (Priority: P2)

**Goal**: Same migration pattern applied to `ax-negativebarchart`. Note: existing `baselineValue` and `baselineLabel` properties stay in `propertyGroup caption="Baseline"` — only the `Data` group changes.

**Independent Test**: Open mock-ui → Negative Bar tab → verify bars colored red/green from mock `ListValue`; baseline line still renders.

### Implementation

- [X] T026 [P] [US5] Update `widgets/ax-negativebarchart/src/AxNegativeBarChart.xml` — replace `propertyGroup caption="Data"` with datasource + 4 attribute properties; keep `propertyGroup caption="Baseline"` unchanged
- [X] T027 [P] [US5] Update `widgets/ax-negativebarchart/src/typings/AxNegativeBarChartProps.ts` — same typings replacement; `baselineValue?: EditableValue<Big>` and `baselineLabel: string` remain unchanged
- [X] T028 [P] [US5] Update `widgets/ax-negativebarchart/src/main/components/NegativeBarChartView.tsx` — replace `useChartData` with `useChartDatasource`; remove `jsonData` variable; keep `baselineValue` pass-through unchanged
- [X] T029 [P] [US5] Update `widgets/ax-negativebarchart/src/AxNegativeBarChart.editorPreview.tsx` — replace `previewJsonData` with mock `ListValue`

**Checkpoint**: All 5 widgets migrated.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Update mock-ui shared helpers and remove JSON-related dead code.

- [X] T030 Add `createMockListValue(records: ChartRecord[]): ListValue` helper in `mock-ui/src/mocks/listValue.ts` — returns object with `status: "available"`, `items` array where each item has a `get(attr) → { value }` lookup via a `Map<ListAttributeValue, unknown>`; used by all 5 demo components
- [X] T031 [P] Update `mock-ui/src/demos/BarChartDemo.tsx` — replace `jsonData: EditableValue<string>` + `dataFormat` props with `datasource: ListValue` + 4 `ListAttributeValue` props; use `createMockListValue`
- [X] T032 [P] Update `mock-ui/src/demos/ColumnChartDemo.tsx` — same demo update pattern as T031
- [X] T033 [P] Update `mock-ui/src/demos/StackAreaChartDemo.tsx` — same demo update; keep `referenceLineValue`/`referenceLineLabel` pass-through
- [X] T034 [P] Update `mock-ui/src/demos/ReportChartDemo.tsx` — same demo update pattern
- [X] T035 [P] Update `mock-ui/src/demos/NegativeBarChartDemo.tsx` — same demo update; keep `baselineValue`/`baselineLabel` pass-through
- [X] T036 Update `mock-ui/src/App.tsx` — replace `jsonData = createMockEditableValue(jsonString)` with `jsonData = createMockListValue(parseRecords(jsonString))`; remove `dataSource` segmented control since format selector is no longer needed; keep dataset selector (to drive which `ChartRecord[]` the `ListValue` exposes)
- [X] T037 [P] Remove `dataFormat` prop forwarding from `demoProps` in `mock-ui/src/App.tsx`
- [X] T038 Run lint check on all modified files and fix any remaining TypeScript errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS Phases 3–7**
- **Phases 3–7 (Per-widget)**: All depend on Phase 2; can run **fully in parallel** (different widget packages, no cross-dependencies)
- **Phase 8 (Polish)**: Depends on Phases 3–7 complete

### User Story Dependencies

- **US1 ax-barchart**: Independent after Phase 2
- **US2 ax-columnchart**: Independent after Phase 2
- **US3 ax-stackareachart**: Independent after Phase 2
- **US4 ax-reportchart**: Independent after Phase 2
- **US5 ax-negativebarchart**: Independent after Phase 2

### Within Each Widget Story

- XML (T010-type) → Typings (T011-type) → View (T012-type) → Preview (T013-type)
- XML and Typings can be done in parallel (different files)
- View depends on Typings being updated
- Preview depends on View being stable

---

## Parallel Example: Phases 3–7

```bash
# After Phase 2 completes — launch all widget migrations concurrently:
Task: "Migrate ax-barchart"        (T010–T013)
Task: "Migrate ax-columnchart"     (T014–T017)
Task: "Migrate ax-stackareachart"  (T018–T021)
Task: "Migrate ax-reportchart"     (T022–T025)
Task: "Migrate ax-negativebarchart" (T026–T029)
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 + Phase 2 (foundational)
2. Complete Phase 3 (ax-barchart only) → **STOP and validate in mock-ui**
3. Once ax-barchart works as proof-of-concept, apply same pattern to remaining 4 widgets in parallel

### Key Implementation Notes

- **`ListValue.items`** is `ObjectItem[]` — each `item` is passed to `ListAttributeValue<T>.get(item)` to retrieve an `EditableValue<T>`
- **`valueAttribute.get(item).value`** returns `Big | undefined` — convert with `.toNumber()` (fallback `0`)
- **`idAttribute` is optional** — if absent, generate via `generateId()` from chart-core
- **`datasource.status`** mirrors `EditableValue.status`: `"loading"` → `store.setLoading(true)`, `"available"` → map items, `"unavailable"` → treat as empty
- **Preview mock**: Create a minimal fake `ListValue` + `ListAttributeValue` using plain objects with `as unknown as ListValue` cast — same pattern as existing `createMockEditableValue` in `mock-ui/src/mocks/editableValue.ts`
- **`dataFormat` property is fully removed** — no backward compat needed (monorepo internal)

---

## Summary

| Phase | Tasks | Story | Parallelizable |
|-------|-------|-------|---------------|
| 1 Setup | T001–T003 | — | Partially |
| 2 Foundational | T004–T009 | — | Partially |
| 3 ax-barchart | T010–T013 | US1 | Within story |
| 4 ax-columnchart | T014–T017 | US2 | Full parallel with US1 |
| 5 ax-stackareachart | T018–T021 | US3 | Full parallel with US1/2 |
| 6 ax-reportchart | T022–T025 | US4 | Full parallel |
| 7 ax-negativebarchart | T026–T029 | US5 | Full parallel |
| 8 Polish / mock-ui | T030–T038 | — | Partially |

**Total tasks**: 38
**Tasks per widget**: 4 each × 5 widgets = 20
**Parallel opportunities**: Phases 3–7 are fully parallel (5 independent packages)
**MVP scope**: Phase 1 + Phase 2 + Phase 3 (ax-barchart only)
