# Feature Specification: Mendix Enterprise Chart Widget Suite

**Feature Branch**: `001-enterprise-chart-widgets`

**Created**: 2026-06-10

**Status**: Draft

**Input**: User description: "Design and implement a reusable enterprise-grade chart widget framework for Mendix with 4 independent pluggable widgets (ax-barchart, ax-columnchart, ax-stackareachart, ax-reportchart) built on a shared PNPM monorepo platform."

## User Scenarios & Testing

### User Story 1 - Render Chart from JSON Data (Priority: P1)

As a Mendix developer, I bind a String attribute containing chart JSON to a chart widget so that data from Elasticsearch, REST APIs, or analytics services renders without Mendix datasource coupling.

**Why this priority**: All widgets depend on a single, source-agnostic data ingestion model. Without it, no chart can function.

**Independent Test**: Deploy any chart widget with sample Flat JSON; verify chart renders in runtime and Studio Pro preview.

**Acceptance Scenarios**:

1. **Given** valid Flat JSON in `jsonData`, **When** the widget loads, **Then** records are adapted to `ChartRecord[]` and the chart displays correctly.
2. **Given** valid Elastic aggregation JSON and `dataFormat=Elastic`, **When** the widget loads, **Then** buckets are normalized to `ChartRecord[]` and the chart displays correctly.
3. **Given** invalid or empty JSON, **When** the widget loads, **Then** the chart shows an empty state without runtime crash.

---

### User Story 2 - Interactive Selection Lifecycle (Priority: P1)

As an end user, I click a chart element so that selection state is written back to Mendix attributes and Mendix actions fire consistently across all widgets.

**Why this priority**: Selection is the standard interaction model for dashboards and drilldown preparation.

**Independent Test**: Click a bar/column/area segment; verify `selectedId`, `selectedName`, `selectedPayload`, event bus emission, and `onSelectionChanged` action.

**Acceptance Scenarios**:

1. **Given** a rendered chart with data, **When** the user clicks a data point, **Then** `selectedId`, `selectedName`, and `selectedPayload` (full record JSON including metadata) are updated.
2. **Given** a selection exists, **When** `CHART_SELECTION_CHANGED` fires, **Then** `onSelectionChanged` Mendix action executes.
3. **Given** a record with opaque `metadata`, **When** selected, **Then** metadata is preserved verbatim in `selectedPayload` and event payloads.

---

### User Story 3 - Horizontal Bar Chart (Priority: P2)

As a dashboard consumer, I view resource usage as a horizontal bar chart (name on Y-axis, value on X-axis) with tooltip and click support.

**Why this priority**: First reference widget proving the shared platform end-to-end.

**Independent Test**: Deploy `ax-barchart` with Flat data; verify axis mapping, tooltip, selection lifecycle.

**Acceptance Scenarios**:

1. **Given** Flat records with `name` and `pm`, **When** rendered in `ax-barchart`, **Then** Y-axis shows names and X-axis shows values.
2. **Given** `showTooltip=true`, **When** hovering a bar, **Then** tooltip displays record details.
3. **Given** a bar click, **When** selection updates, **Then** `onClick` action executes.

---

### User Story 4 - Vertical Column Chart (Priority: P2)

As an analyst, I view time-series columns (period on X-axis, value on Y-axis) with tooltip, hover, and click.

**Independent Test**: Deploy `ax-columnchart`; verify period/pm mapping and hover events.

**Acceptance Scenarios**:

1. **Given** records grouped by `period`, **When** rendered, **Then** X-axis shows periods and Y-axis shows `pm` values.
2. **Given** hover on a column, **When** `CHART_HOVER` fires, **Then** event payload includes widgetId and record data.

---

### User Story 5 - Stacked Area Chart (Priority: P3)

As an operations user, I compare multiple series over time with stacked areas, zoom, legend interaction, and tooltips.

**Independent Test**: Deploy `ax-stackareachart` with multi-series Flat data; verify stacking by `name`, grouping by `period`.

**Acceptance Scenarios**:

1. **Given** multiple `name` values per `period`, **When** rendered, **Then** areas stack by series with `period` on X-axis.
2. **Given** `showLegend=true`, **When** legend item toggled, **Then** `CHART_LEGEND_SELECT` emits with series context.
3. **Given** zoom enabled, **When** user zooms, **Then** visible range updates without full widget remount.

---

### User Story 6 - Report Chart with Aggregations (Priority: P3)

As a reporting user, I view aggregated totals and summaries suitable for future drilldown, filtering, and KPI extensions.

**Independent Test**: Deploy `ax-reportchart` with sample data; verify aggregation display and architecture hooks for drilldown (not export).

**Acceptance Scenarios**:

1. **Given** chart records, **When** rendered in `ax-reportchart`, **Then** totals/summaries display per builder configuration.
2. **Given** a future drilldown hook, **When** `CHART_DRILLDOWN` is prepared, **Then** event bus and store support extension without widget rewrite.

---

### Edge Cases

- Empty `jsonData` or `[]` → empty chart, no error thrown.
- Malformed JSON → graceful degradation with optional console warning in dev; empty chart in production.
- Duplicate `id` values → last-write-wins in store; selection uses clicked record instance.
- Missing optional fields (`parent`, `metadata`) → adapter supplies defaults; metadata never assumed.
- Large datasets (5,000+ records) → option builders memoized; chart remains interactive.
- Studio Pro preview without Mendix runtime → mock data renders visual chart.
- `dataFormat` mismatch (Elastic JSON with Flat format) → adapter returns empty or parse error state.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a PNPM monorepo with packages `chart-core`, `chart-ui`, `chart-echarts` and widgets `ax-barchart`, `ax-columnchart`, `ax-stackareachart`, `ax-reportchart`.
- **FR-002**: Each widget MUST be independently buildable and deployable via `@mendix/pluggable-widgets-tools`.
- **FR-003**: Widgets MUST NOT use Mendix Datasource properties; data input is `jsonData` (String Attribute) only.
- **FR-004**: System MUST support `DataFormat.Flat` and `DataFormat.Elastic` via `FlatDataAdapter` and `ElasticAggregationAdapter`.
- **FR-005**: Widgets MUST consume only `ChartRecord[]` after adapter transformation.
- **FR-006**: System MUST provide a framework-independent Event Bus with `emit`, `on`, `off`, `once` and defined `ChartEvents`.
- **FR-007**: System MUST provide `ChartStore` (MobX, `makeAutoObservable`, no decorators) with records, selection, loading, and computed `categories`/`seriesData`.
- **FR-008**: System MUST preserve `metadata` throughout adapter, store, selection, and event payloads without shape assumptions.
- **FR-009**: All widgets MUST implement the standard selection lifecycle (click → store → Mendix attributes → event → action).
- **FR-010**: ECharts configuration MUST live exclusively in `chart-echarts` builders; widgets contain no raw ECharts config.
- **FR-011**: System MUST provide `ThemeProvider` wrapping Ant Design `ConfigProvider` for future Mendix theme/dark mode integration.
- **FR-012**: System MUST prepare `ChartContextState` for future dashboard filters without full dashboard implementation.
- **FR-013**: Each widget MUST support Studio Pro preview with mock data and no runtime dependencies.
- **FR-014**: `ax-reportchart` MUST prepare architecture for drilldown, filtering, and KPI widgets; export is out of scope.
- **FR-015**: System MUST use TypeScript strict mode, React functional components, hooks, and MobX; MUST NOT use Redux, class components, or third-party event bus libraries.

### Key Entities

- **ChartRecord**: Normalized chart data point (`id`, `parent?`, `name`, `period`, `pm`, `metadata?`).
- **DataAdapter**: Transforms raw JSON string to `ChartRecord[]`.
- **ChartStore**: MobX store holding records, selection, loading, computed chart data.
- **ChartEventPayload**: Event bus message with `widgetId`, `type`, optional `data`.
- **ChartContextState**: Future dashboard context (`globalFilter?`, `globalTimeRange?`).
- **Widget Props**: Mendix XML-defined properties for data, display, selection, and events.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All four widgets build successfully with `pluggable-widgets-tools` on Mendix Studio Pro 10.24.9.
- **SC-002**: Shared packages eliminate duplicated adapter, store, event bus, and ECharts logic across widgets (zero copy-paste of core logic).
- **SC-003**: Charts render correctly with 100, 500, 1,000, and 5,000+ record datasets without visible UI freeze on initial render.
- **SC-004**: Selection lifecycle produces identical Mendix attribute updates across all four widget types.
- **SC-005**: Studio Pro preview displays representative charts for each widget without Mendix runtime.
- **SC-006**: Adding a new data adapter (e.g., GraphQL) requires no changes to widget rendering components.

## Assumptions

- Mendix pages provide `jsonData` via microflow, nanoflow, or REST consumption; widget does not fetch data directly in v1.
- `pm` field represents the primary numeric measure across all chart types in v1.
- Mendix 11.x forward compatibility is achieved via pinned dependency versions and pluggable widget API stability.
- Unit/integration testing uses Jest via `@mendix/pluggable-widgets-tools` defaults.
- Ant Design 6.x theming is sufficient for initial UI; full Mendix design system token mapping is deferred.
- Report chart aggregations in v1 cover sum/count by period and name groupings; advanced statistical aggregations are future work.
