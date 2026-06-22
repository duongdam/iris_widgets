# Data Model: AxGanttChart Refactor

**Date**: 2026-06-23 | **Plan**: [plan.md](./plan.md)

---

## Widget Props (AxGanttChart.xml → AxGanttChartProps)

### Display (expression / boolean)

| Key | XML type | TS type | Required | Default | Notes |
|-----|----------|---------|----------|---------|-------|
| `height` | expression → Integer | `EditableValue<Big>` | yes | 600 | Widget height px |
| `defaultViewMode` | expression → String | `EditableValue<string>` | yes | "month" | day \| week \| month |
| `showToolbar` | boolean | `boolean` | yes | true | |
| `showGrid` | boolean | `boolean` | yes | true | |
| `showTimeline` | boolean | `boolean` | yes | true | |
| `showProgress` | boolean | `boolean` | yes | false | |
| `showTodayMarker` | boolean | `boolean` | yes | true | |

### Options (expression)

| Key | TS type | Default | Notes |
|-----|---------|---------|-------|
| `optStartDateAttribute` | `EditableValue<string>` | — | Optional timeline range override |
| `optEndDateAttribute` | `EditableValue<string>` | — | Optional timeline range override |
| `allowDrag` | `EditableValue<boolean>` | true | Timeline drag |
| `allowResize` | `EditableValue<boolean>` | false | Bar resize; MTO/K/O move-only |
| `allowGridReorder` | `EditableValue<boolean>` | true | Grid DnD reorder |
| `readOnly` | `EditableValue<boolean>` | false | Disable all editing |

### Data Source

| Key | TS type | Required | Maps to |
|-----|---------|----------|---------|
| `roadmapItems` | `ListValue` | yes | Mendix datasource |
| `aidAttribute` | `ListAttributeValue<string\|Big>` | yes | Internal AID |
| `itemIdAttribute` | `ListAttributeValue<string\|Big>` | yes | Gantt task id |
| `parentIdAttribute` | `ListAttributeValue<string>` | yes | Tree parent id |
| `groupAttribute` | `ListAttributeValue<string>` | yes | Business group key |
| `typeAttribute` | `ListAttributeValue<string>` | yes | Task type enum |
| `nameAttribute` | `ListAttributeValue<string>` | yes | Display name |
| `textAttribute` | `ListAttributeValue<string>` | yes | Grid/timeline text |
| `countAttribute` | `ListAttributeValue<Big>` | yes | Child count display |
| `orderAttribute` | `ListAttributeValue<Big>` | yes | Sort order |
| `customOrderAttribute` | `ListAttributeValue<string\|Big>` | yes | Custom sort |
| `startDateAttribute` | `ListAttributeValue<Date>` | **no** | Required only for TASK/SUB_TASK bars |
| `endDateAttribute` | `ListAttributeValue<Date>` | no | Optional if duration implied |
| `milestoneAttribute` | `ListAttributeValue<string>` | yes | MTO/K/O tag |
| `stndMileMonthAttribute` | `ListAttributeValue<Date>` | yes | Standard milestone month |
| `hasTuningAttribute` | `ListAttributeValue<boolean>` | yes | Flag |
| `hasManualAttribute` | `ListAttributeValue<boolean>` | yes | Flag |
| `hasCertAttribute` | `ListAttributeValue<boolean>` | yes | Flag |
| `hasRFAttribute` | `ListAttributeValue<boolean>` | yes | Flag |
| `canEditAttribute` | `ListAttributeValue<boolean>` | no | Per-row edit override |
| `metadata1Attribute`…`metadata5Attribute` | various | no | Stored in `metadata.*` |

**XML fix**: Change all `dataSource="tasksDatasource"` → `dataSource="roadmapItems"`. Remove duplicate `hasTuningAttribute` block.

### Events — REMOVED

```typescript
// DELETE from AxGanttChartProps
onEvent?: ActionValue;
eventType?: EditableValue<string>;    // was outgoing event name
eventPayload?: EditableValue<string>; // was JSON blob
```

### Events — NEW

| Key | TS type | Write-back | Description |
|-----|---------|------------|-------------|
| `onClicked` | `ActionValue` | → `outItemId`, `outType` | Task click |
| `onDoubleClicked` | `ActionValue` | → `outItemId`, `outType` | Task double-click |
| `onChanged` | `ActionValue` | → `outItemId`, `outType`, `outChangedNum` | Timeline drag/resize |
| `onAdded` | `ActionValue` | → `outItemId`, `outType` | (+) button |
| `onDropped` | `ActionValue` | → `outItemId`, `outType` | Grid row reorder |
| `outItemId` | `EditableValue<string>` | widget → Mendix | Clicked/changed item id |
| `outType` | `EditableValue<string>` | widget → Mendix | Task type (TASK, SUB_TASK, …) |
| `outChangedNum` | `EditableValue<Big>` | widget → Mendix | Month delta (onChanged only) |

### Incoming commands (retained via AxGanttInner)

| Key | TS type | Notes |
|-----|---------|-------|
| `command` | `EditableValue<string>` | e.g. REFRESH, ZOOM_MONTH |
| `commandPayload` | `EditableValue<string>` | Optional JSON |

---

## AxGanttTask (Internal Model)

```typescript
export type AxTaskType =
    | "DISTRICT_GROUP"   // L1 — no dates
    | "CUSTOM_GROUP"     // L2 — no dates
    | "TASK"
    | "SUB_TASK";

export interface AxGanttTask {
    id: string;           // itemId
    aid?: string;
    text: string;
    name?: string;
    type?: AxTaskType | string;
    parent?: string;
    group?: string;

    // Dates — optional for groups
    start_date?: string | Date;
    end_date?: string | Date;
    duration?: number;

    // DHTMLX flags
    unscheduled?: boolean;
    open?: boolean;

    // Business fields
    milestone?: string;           // MTO | K/O
    stndMileMonth?: string | Date;
    order?: number;
    customOrder?: string | number;
    count?: number;

    hasTuning?: boolean;
    hasManual?: boolean;
    hasCert?: boolean;
    hasRF?: boolean;
    canEdit?: boolean;

    progress?: number;
    metadata?: {
        metadata1?: unknown;
        metadata2?: unknown;
        metadata3?: unknown;
        metadata4?: unknown;
        metadata5?: unknown;
    };
}
```

### Type → behavior matrix

| type | unscheduled | Timeline bar | Drag | onChanged |
|------|-------------|--------------|------|-----------|
| DISTRICT_GROUP | true | hidden (CSS) | no | no |
| CUSTOM_GROUP | true | hidden | no | no |
| TASK | false* | yes | yes | yes |
| SUB_TASK | false* | yes | yes | yes |

\*If no start_date, set `unscheduled: true` and hide bar.

### Legacy type normalization (gantt-test.json)

| JSON type | Normalized |
|-----------|------------|
| AREA | DISTRICT_GROUP |
| BIZ_LINE | CUSTOM_GROUP |
| TASK | TASK |
| SUB_TASK | SUB_TASK |

---

## AxGanttStore (MobX)

Single store — replaces `GanttStore` + `RootStore`.

```typescript
export interface AxGanttStore {
    // Data
    tasks: AxGanttTask[];
    taskById: Map<string, AxGanttTask>;
    loading: boolean;

    // UI state
    viewMode: "day" | "week" | "month";
    selectedItemId?: string;
    hoveredItemId?: string;
    fullscreen: boolean;
    expandHeight: boolean;

    // Drag snapshot (for changedNum)
    dragStartDates: Map<string, Date>;

    // Actions
    setTasks(tasks: AxGanttTask[]): void;
    setTasksIfChanged(tasks: AxGanttTask[]): void;
    setViewMode(mode: "day" | "week" | "month"): void;
    selectItem(id: string | undefined): void;
    setLoading(loading: boolean): void;
    snapshotDragStart(id: string, date: Date): void;
    clearDragSnapshot(id: string): void;

    // Computed
    get hasTasks(): boolean;
}
```

---

## AxEvent (Event Bus)

```typescript
export interface AxEvent {
    widgetId: string;
    payload?: Record<string, unknown>;
}

// Topics (incoming — Mendix → widget)
export const AX_TOPICS = {
    REFRESH: "REFRESH",
    ZOOM_DAY: "ZOOM_DAY",
    ZOOM_WEEK: "ZOOM_WEEK",
    ZOOM_MONTH: "ZOOM_MONTH",
    ENTER_FULLSCREEN: "ENTER_FULLSCREEN",
    EXIT_FULLSCREEN: "EXIT_FULLSCREEN",
    SCROLL_TO_TASK: "SCROLL_TO_TASK",
    // ... extend as needed
} as const;
```

---

## Validation Rules (Updated)

```typescript
// Required for ALL rows
required: [aidAttribute, itemIdAttribute, typeAttribute, textAttribute, parentIdAttribute]

// NOT globally required anymore
removed: startDateAttribute required check

// Per-row validation in adapter
if (isScheduledType(type) && !startDate && !unscheduled) {
    warn(`Task ${id} missing start date — skipped or marked unscheduled`);
}
```

---

## Component Tree

```
AxGanttChart
└── ThemeProvider (antd ConfigProvider)
    └── AxGanttInner                    // subscribes getEventBus() for command attribute
        └── AxGanttChartView            // gantt container, toolbar, datasource sync
```
