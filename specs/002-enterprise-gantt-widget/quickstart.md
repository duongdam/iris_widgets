# Ax Gantt Chart — Mendix Integration Quickstart

> **Version**: Post-refactor 2026-06-23 — Typed Mendix actions (no JSON payload)

---

## Overview

The widget exposes **five Mendix actions** with scalar write-back attributes:

| Action | Write-back attributes | When |
|--------|----------------------|------|
| `onClicked` | `outItemId`, `outType` | Click row/bar |
| `onDoubleClicked` | `outItemId`, `outType` | Double-click |
| `onChanged` | `outItemId`, `outType`, `outChangedNum` | Timeline drag/resize |
| `onAdded` | `outItemId`, `outType` | (+) button |
| `onDropped` | `outItemId`, `outType` | Grid reorder |

**No `JSON.parse` required.** Read attributes directly in nanoflow.

---

## Step 1 — Domain Model

Create non-persistent entity `GanttActionContext`:

```
Attributes:
  OutItemId     : String
  OutType       : String      // TASK | SUB_TASK | CUSTOM_GROUP | DISTRICT_GROUP
  OutChangedNum : Integer     // only populated for onChanged
```

---

## Step 2 — Page Setup

```
Page
└── DataView (nanoflow DS_GetGanttContext → GanttActionContext)
    └── AxGanttChart
          ├── Data source          → [roadmapItems list]
          ├── Out item id (out)    → GanttActionContext/OutItemId
          ├── Out type (out)       → GanttActionContext/OutType
          ├── Out changed num (out)→ GanttActionContext/OutChangedNum
          ├── On clicked           → ACT_Gantt_Clicked
          ├── On double clicked    → ACT_Gantt_DblClick
          ├── On changed           → ACT_Gantt_Changed
          ├── On added             → ACT_Gantt_Added
          └── On dropped           → ACT_Gantt_Dropped
```

---

## Step 3 — Nanoflow Examples

### ACT_Gantt_Clicked

```
Parameter: $Context : GanttActionContext

// Widget already wrote values before calling this action
Show message: $Context/OutItemId + " (" + $Context/OutType + ")"
```

### ACT_Gantt_Changed (commit drag)

```
Parameter: $Context : GanttActionContext

// Month delta: -2 = moved back 2 months, +2 = forward 2 months
Change object: [find task by OutItemId]
  StndMileMonth = addMonths([StndMileMonth], $Context/OutChangedNum)

Commit
Refresh roadmapItems datasource
```

---

## Task Types

| Type | Level | Has dates | Timeline bar |
|------|-------|-----------|--------------|
| `DISTRICT_GROUP` | 1 | No | Hidden (grid only) |
| `CUSTOM_GROUP` | 2 | No | Hidden |
| `TASK` | 3+ | Yes | Yes |
| `SUB_TASK` | child | Yes | Yes |

Groups load as DHTMLX **unscheduled** tasks — no start/end required in datasource.

---

## Incoming Commands (Optional)

Bind `command` attribute to control widget from Mendix:

```
command = "ZOOM_MONTH"   → widget zooms to month view
command = "REFRESH"      → reload datasource
command = ""             → clear after execute (allows re-trigger)
```

`AxGanttInner` listens on global event bus (`AX_EVENT_BUS`).

---

## Preview / Mock Data

Studio Pro preview uses [`gantt-test.json`](../../gantt-test.json) normalized at build time:

- `AREA` → `DISTRICT_GROUP`
- `BIZ_LINE` → `CUSTOM_GROUP`
- `TASK` / `SUB_TASK` → scheduled events with MTO/K/O

---

## DHTMLX Unscheduled Config

```javascript
gantt.config.show_unscheduled = false;  // display unscheduled rows in timeline
// Group tasks: { unscheduled: true } — no start_date/end_date required
```

Reference: [DHTMLX unscheduled tasks sample](https://docs.dhtmlx.com/gantt/samples/?sample=%2701_initialization/19_tasks_without_dates.html%27)

---

## Expression Properties

These accept Mendix expressions (not just literals):

| Property | Type | Example expression |
|----------|------|-------------------|
| height | Integer | `600` |
| defaultViewMode | String | `'month'` |
| allowDrag | Boolean | `$currentUser/CanEdit` |
| allowResize | Boolean | `false` |
| allowGridReorder | Boolean | `true` |
| readOnly | Boolean | `not $currentUser/IsAdmin` |

---

## Build & Deploy

```bash
pnpm --filter ax-ganttchart build
# Deploy .mpk to Mendix app
```
