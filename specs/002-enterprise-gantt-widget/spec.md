# Feature Specification: Mendix Enterprise Gantt Widget (ax-ganttchart)

**Feature Branch**: `002-enterprise-gantt-widget`

**Created**: 2026-06-10

**Status**: Draft

**Input**: Design and implement a production-ready Mendix Pluggable Widget `ax-ganttchart` built on DHTMLX Gantt, integrated into the existing iris-widgets PNPM monorepo with architecture consistent with chart widgets.

## User Scenarios & Testing

### User Story 1 - Render Gantt from Mendix Datasource (Priority: P1)

As a Mendix developer, I bind a datasource (microflow, nanoflow, database, REST integration) to the Gantt widget so that task objects render on a timeline without the widget calling external APIs directly.

**Why this priority**: Datasource ingestion is the foundation; all other features depend on mapped task data.

**Independent Test**: Deploy `ax-ganttchart` with a database datasource of 50+ tasks; verify grid, timeline, and hierarchy render in runtime and Studio Pro preview.

**Acceptance Scenarios**:

1. **Given** a Mendix list datasource with task entities, **When** the widget loads, **Then** tasks are mapped via configurable attributes to `GanttTask[]` and displayed.
2. **Given** datasource status is `Loading`, **When** the widget renders, **Then** a loading overlay appears without crash.
3. **Given** an empty datasource, **When** the widget loads, **Then** an empty state displays without runtime error.

---

### User Story 2 - Task Selection and Mendix Actions (Priority: P1)

As an end user, I click a task row or bar so that selection is written to Mendix attributes and configured actions fire.

**Why this priority**: Selection drives dashboard drilldown and workflow integration.

**Independent Test**: Click a task; verify `selectedTaskId`, `selectedPayload`, event bus `TASK_SELECTED`, and `onSelectionChanged` action.

**Acceptance Scenarios**:

1. **Given** a rendered Gantt with tasks, **When** the user clicks a task, **Then** `selectedTaskId` and `selectedPayload` (full task JSON) update.
2. **Given** a selection exists, **When** `onSelectionChanged` is configured, **Then** the Mendix action executes.
3. **Given** a task with opaque `metadata`, **When** selected, **Then** metadata is preserved verbatim in `selectedPayload` and event payloads.

---

### User Story 3 - Timeline View Modes (Priority: P2)

As a project manager, I switch between Day, Week, Month, and Quarter views so that I can plan at different granularities without the chart reinitializing.

**Why this priority**: View mode is core scheduling UX; smooth scale updates are a performance differentiator.

**Independent Test**: Switch `defaultViewMode` and event bus `ZOOM_*` commands; verify scale changes without full Gantt remount.

**Acceptance Scenarios**:

1. **Given** a rendered Gantt, **When** view mode changes to `Week`, **Then** timeline scales update smoothly and `VIEW_CHANGED` / `TIMELINE_CHANGED` events emit.
2. **Given** event bus `ZOOM_MONTH` received, **When** processed, **Then** `GanttStore.viewMode` updates and scales reconfigure without `gantt.destructor()`.

---

### User Story 4 - Event Bus Programmatic Control (Priority: P2)

As a dashboard integrator, I send commands via the event bus (refresh, expand/collapse, scroll, fullscreen, export) so that external toolbars and widgets control the Gantt without tight coupling.

**Why this priority**: Event-driven architecture enables enterprise dashboard composition.

**Independent Test**: Wire mock-ui event publisher; verify each incoming command produces expected Gantt behavior and outgoing events.

**Acceptance Scenarios**:

1. **Given** `REFRESH` command, **When** datasource reloads, **Then** tasks update incrementally and `GanttStore.loading` reflects state.
2. **Given** `ENTER_FULLSCREEN`, **When** Browser Fullscreen API succeeds, **Then** `FULLSCREEN_CHANGED` emits and MobX tracks `fullscreen=true`.
3. **Given** `SCROLL_TO_TASK` with task id, **When** task exists, **Then** Gantt scrolls task into view.

---

### User Story 5 - Enterprise Visual Design (Priority: P2)

As an end user, I interact with a modern Gantt that provides spreadsheet-like cross-highlight on hover, a subtle today marker, and polished grid styling.

**Why this priority**: Visual quality differentiates enterprise widgets; hover feedback aids task-location in large datasets.

**Independent Test**: Hover task rows and timeline cells; verify row (`#fff8cc`) and column (`#fffbe6`) highlights and red today marker.

**Acceptance Scenarios**:

1. **Given** a task row hover, **When** the pointer moves across grid and timeline, **Then** both row and column highlight simultaneously.
2. **Given** `showTodayMarker=true`, **When** today falls in visible range, **Then** a thin red vertical line renders and remains visible while scrolling.

---

### User Story 6 - Large Dataset Performance (Priority: P3)

As an operations user, I work with 1,000–5,000+ tasks so that scrolling and interaction remain smooth.

**Why this priority**: Enterprise projects routinely exceed hundreds of tasks; performance validates DHTMLX choice.

**Independent Test**: Load mock datasets of 100, 500, 1000, 5000 tasks; measure scroll FPS and initial parse time.

**Acceptance Scenarios**:

1. **Given** 5,000 tasks, **When** smart rendering is enabled, **Then** scroll remains responsive (< 16ms frame budget target).
2. **Given** datasource incremental update, **When** a single task changes, **Then** only affected task is updated via `gantt.updateTask`, not full re-parse.

---

### User Story 7 - Export Architecture (Priority: P3)

As a project manager, I trigger PDF, PNG, JPEG, or Excel export via event bus so that reports can be generated without export logic embedded in UI components.

**Why this priority**: Export is a common enterprise requirement; service-layer decoupling enables future server-side swap.

**Independent Test**: Fire `EXPORT_PDF` via event bus; verify `ExportService` delegates to DHTMLX export API with callback.

**Acceptance Scenarios**:

1. **Given** `EXPORT_PNG` command, **When** export_api plugin is enabled, **Then** export service invokes `gantt.exportToPNG` and returns result via callback/event.
2. **Given** export failure (network), **When** online service unavailable, **Then** error surfaces without widget crash.

---

### User Story 8 - Studio Pro Preview (Priority: P3)

As a Mendix developer, I see a representative Gantt in Studio Pro preview using mock tasks without datasource dependency.

**Independent Test**: Open widget in Studio Pro; verify preview renders mock hierarchy with toolbar, grid, and timeline.

**Acceptance Scenarios**:

1. **Given** Studio Pro design mode, **When** preview loads, **Then** mock tasks display with no Mendix datasource bound.
2. **Given** preview configuration changes (height, view mode), **When** properties update, **Then** preview reflects changes.

---

## Functional Requirements

- **FR-001**: Widget MUST consume Mendix list datasource; MUST NOT call REST/APIs directly.
- **FR-002**: Widget MUST map datasource attributes via configurable property keys (`idAttribute`, `textAttribute`, `startDateAttribute`, etc.).
- **FR-003**: Widget MUST maintain internal `GanttTask` model decoupled from Mendix entity shape.
- **FR-004**: Widget MUST use MobX `makeAutoObservable()` (no decorators) for `GanttStore`.
- **FR-005**: Widget MUST implement typed event bus with documented incoming/outgoing events.
- **FR-006**: Widget MUST support timeline modes: Day, Week, Month, Quarter via scale reconfiguration only.
- **FR-007**: Widget MUST support Browser Fullscreen API with MobX-tracked state.
- **FR-008**: Widget MUST implement cross-highlight hover (row `#fff8cc`, column `#fffbe6`).
- **FR-009**: Widget MUST render configurable today marker (thin red line).
- **FR-010**: Widget MUST provide Studio Pro preview with mock data.
- **FR-011**: Widget MUST use DHTMLX smart rendering and incremental updates for performance.
- **FR-012**: Export MUST be implemented via service layer, not UI components.
- **FR-013**: Widget MUST wrap children in antd `ConfigProvider` via `ThemeProvider`.
- **FR-014**: Widget MUST follow chart widget monorepo conventions (folder structure, build tooling, TypeScript strict).

## Non-Functional Requirements

- **NFR-001**: TypeScript strict mode; functional React components with hooks only.
- **NFR-002**: Target Mendix Studio Pro 10.24.9; forward-compatible with Mendix 11.x.
- **NFR-003**: Smooth scrolling at 1,000+ tasks; acceptable performance at 5,000+ with smart rendering.
- **NFR-004**: No global mutable state; per-widget-instance store and event bus.
- **NFR-005**: SOLID, DRY, KISS — business logic in services/stores, not UI.

## Key Entities

- `GanttTask` — normalized task model
- `GanttStore` — MobX observable state
- `GanttEventBus` — pub/sub for dashboard integration
- `TimelineViewMode` — Day | Week | Month | Quarter
- `GanttDatasourceAdapter` — Mendix ListValue → GanttTask[]
- `ExportService` — PDF/PNG/JPEG/Excel delegation

## Success Criteria

- Widget builds and deploys as `.mpk` from `widgets/ax-ganttchart`
- Datasource mapping works with generic Mendix entities
- All 22 incoming and 9 outgoing event bus events are contract-defined
- Preview renders without datasource in Studio Pro
- Performance targets met at 1,000 tasks with documented approach for 5,000+
