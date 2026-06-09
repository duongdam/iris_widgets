# Data Model: Mendix Enterprise Gantt Widget (ax-ganttchart)

**Branch**: `002-enterprise-gantt-widget` | **Date**: 2026-06-10

## Entity Relationship Overview

```text
┌─────────────────────┐     map        ┌──────────────┐
│ Mendix ListValue    │ ─────────────► │ GanttTask[]  │
│ (datasource.items)  │  Adapter       └──────┬───────┘
└─────────────────────┘                       │
                                              ▼
                                       ┌──────────────┐
                                       │  GanttStore  │
                                       └──────┬───────┘
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
            ┌──────────────┐          ┌──────────────┐          ┌─────────────────┐
            │ taskById     │          │ viewMode     │          │ selectedTask    │
            │ (computed)   │          │ fullscreen   │          │ (optional)      │
            └──────────────┘          │ loading      │          └────────┬────────┘
                                      └──────────────┘                   │
                                                                         ▼
                                                              ┌──────────────────┐
                                                              │ Mendix Attributes │
                                                              │ selectedTaskId    │
                                                              │ selectedPayload   │
                                                              └──────────────────┘
```

---

## Core Entities

### GanttTask

Normalized task consumed by DHTMLX Gantt and MobX store.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | `string` | Yes | Non-empty, unique within dataset | Mapped from `idAttribute` |
| `text` | `string` | Yes | Non-empty | Task label |
| `start_date` | `string` | Yes | Parseable date | DHTMLX format `YYYY-MM-DD` or `YYYY-MM-DD HH:mm` |
| `end_date` | `string` | No | Parseable date | Mutually optional with `duration` |
| `duration` | `number` | No | Positive | Days; used when `end_date` absent |
| `progress` | `number` | No | 0–1 | Task completion fraction |
| `parent` | `string` | No | Must reference existing `id` or `0`/root | Hierarchy parent |
| `open` | `boolean` | No | — | Branch expanded state |
| `type` | `string` | No | DHTMLX task type | e.g. `task`, `project`, `milestone` |
| `color` | `string` | No | CSS color | Bar color override |
| `metadata` | `Record<string, unknown>` | No | Opaque | Pass-through; never inspected by widget logic |

**Invariants**:
- Adapter MUST produce valid DHTMLX task objects; invalid rows are skipped with console warn (dev only).
- `metadata` MUST survive adapter → store → selection → Mendix attribute → event payload unchanged.
- Circular parent references MUST be broken (child promoted to root).

---

### TimelineViewMode

| Value | Mendix XML enum key | Description |
|-------|---------------------|-------------|
| `DAY` | `day` | Hour + day scales |
| `WEEK` | `week` | Day + week scales |
| `MONTH` | `month` | Week + month scales |
| `QUARTER` | `quarter` | Month + quarter scales |

Mapped to Mendix XML `defaultViewMode` enumeration.

---

### GanttStore State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `tasks` | `GanttTask[]` | `[]` | Current task dataset |
| `selectedTask` | `GanttTask \| undefined` | `undefined` | Active selection |
| `viewMode` | `TimelineViewMode` | `WEEK` | Active timeline scale |
| `fullscreen` | `boolean` | `false` | Browser fullscreen state |
| `loading` | `boolean` | `false` | Datasource loading indicator |
| `showGrid` | `boolean` | `true` | Grid panel visibility |
| `showTimeline` | `boolean` | `true` | Timeline panel visibility |
| `hoveredTaskId` | `string \| undefined` | `undefined` | Cross-highlight target |

**Computed properties**:

| Property | Type | Derivation |
|----------|------|------------|
| `taskById` | `Map<string, GanttTask>` | Index of `tasks` by `id` |
| `hasTasks` | `boolean` | `tasks.length > 0` |
| `rootTasks` | `GanttTask[]` | Tasks with no `parent` or `parent === "0"` |

**Actions**:

| Action | Parameters | Effect |
|--------|------------|--------|
| `setTasks` | `GanttTask[]` | Replace task array |
| `selectTask` | `GanttTask \| undefined` | Update selection |
| `setViewMode` | `TimelineViewMode` | Update view mode |
| `setFullscreen` | `boolean` | Update fullscreen flag |
| `setLoading` | `boolean` | Update loading flag |
| `setShowGrid` | `boolean` | Toggle grid visibility |
| `setShowTimeline` | `boolean` | Toggle timeline visibility |
| `setHoveredTaskId` | `string \| undefined` | Cross-highlight state |

---

### GanttDatasourceMapping

Configuration derived from Mendix XML attribute property keys.

| Config Key | Maps To | Required |
|------------|---------|----------|
| `idAttribute` | `GanttTask.id` | Yes |
| `textAttribute` | `GanttTask.text` | Yes |
| `startDateAttribute` | `GanttTask.start_date` | Yes |
| `endDateAttribute` | `GanttTask.end_date` | No |
| `durationAttribute` | `GanttTask.duration` | No |
| `progressAttribute` | `GanttTask.progress` | No |
| `parentAttribute` | `GanttTask.parent` | No |
| `openAttribute` | `GanttTask.open` | No |
| `typeAttribute` | `GanttTask.type` | No |

Optional `colorAttribute` may be added in v1.1; v1 uses `color` only if mapped via metadata pass-through.

---

### GanttEventPayload

| Field | Type | Description |
|-------|------|-------------|
| `widgetId` | `string` | Mendix widget `name` prop |
| `type` | `GanttIncomingEvents \| GanttOutgoingEvents` | Event discriminator |
| `data` | `unknown` | Typed per event (see contracts/event-bus.ts) |

---

## State Transitions

### Selection Lifecycle

```text
[No selection] ──click task──► [selectedTask set]
[selectedTask set] ──click same──► [No selection] (toggle optional — default: reselect)
[selectedTask set] ──click other──► [selectedTask updated]
[selectedTask set] ──datasource refresh──► [selectedTask preserved if id exists, else cleared]
```

### View Mode Lifecycle

```text
[viewMode=WEEK] ──ZOOM_DAY / setViewMode(DAY)──► [scales updated, VIEW_CHANGED emitted]
```

### Fullscreen Lifecycle

```text
[fullscreen=false] ──ENTER_FULLSCREEN──► [requestFullscreen → fullscreen=true → FULLSCREEN_CHANGED]
[fullscreen=true] ──EXIT_FULLSCREEN / Esc──► [exitFullscreen → fullscreen=false → FULLSCREEN_CHANGED]
```

### Loading Lifecycle

```text
[datasource.status=Loading] ──► [loading=true]
[datasource.status=Available] ──adapter──► [setTasks, loading=false]
[datasource.status=Unavailable] ──► [tasks=[], loading=false, empty state]
```

---

## DHTMLX Sync Model

| Store change | DHTMLX operation |
|--------------|------------------|
| Full datasource replace | `gantt.clearAll()` + `silent(parse)` + `render()` |
| Single task update | `gantt.updateTask(id, task)` |
| Bulk insert | `gantt.batchUpdate(() => { … })` |
| View mode change | `config.scales = …` + `render()` |
| Grid/timeline toggle | `gantt.config.show_grid` / layout API + `render()` |

---

## Display Configuration Entity

Widget-level display flags from XML (not in MobX store unless toggled via event bus).

| Property | Type | Default | Store mirror |
|----------|------|---------|--------------|
| `height` | `integer` | `600` | N/A (CSS) |
| `showToolbar` | `boolean` | `true` | N/A |
| `showGrid` | `boolean` | `true` | `showGrid` when bus toggles |
| `showTimeline` | `boolean` | `true` | `showTimeline` when bus toggles |
| `showProgress` | `boolean` | `true` | DHTMLX config |
| `showTodayMarker` | `boolean` | `true` | DHTMLX config |

---

## Validation Rules

1. `id`, `text`, `start_date` MUST be present after mapping or row is excluded.
2. `progress` outside 0–1 is clamped.
3. `parent` referencing missing id is treated as root.
4. `end_date` before `start_date` — swap or drop `end_date` (adapter policy: drop + log warn).
5. `selectedPayload` JSON MUST include full `GanttTask` object including `metadata`.
