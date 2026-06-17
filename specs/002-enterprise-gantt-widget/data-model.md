# Data Model: Gantt Refactor — Unified Event Bridge

**Date**: 2026-06-18 | **Plan**: [plan.md](./plan.md)

---

## Widget Props Changes

### Props thêm mới

```typescript
// AxGanttChartProps.ts (thêm vào interface AxGanttChartProps)
eventType?: EditableValue<string>;      // Widget writes event name here
eventPayload?: EditableValue<string>;   // Widget writes JSON payload here
```

### Props xóa

```typescript
// Xóa khỏi AxGanttChartProps.ts
showCriticalPath: boolean;   // ← XÓA
showBaseline: boolean;       // ← XÓA
exportServerUrl?: string;    // ← XÓA (không có trong XML, dead code)
```

---

## Outgoing Events (Updated Enum)

```typescript
// eventTypes.ts — GanttOutgoingEvents enum
export enum GanttOutgoingEvents {
    // Interactions — user clicks/double-clicks task row or bar
    TASK_CLICKED = "TASK_CLICKED",
    TASK_DOUBLE_CLICKED = "TASK_DOUBLE_CLICKED",

    // Add task — user clicks (+) button on level-2 row
    ADD_TASK_REQUESTED = "ADD_TASK_REQUESTED",   // was: TASK_REQUEST_ADD

    // Data mutations — require Mendix commit
    TASK_UPDATED = "TASK_UPDATED",     // NEW: drag/resize bar → new dates
    TASK_REORDERED = "TASK_REORDERED", // NEW: grid DnD → new parent/order

    // CRUD (less common)
    TASK_CREATED = "TASK_CREATED",
    TASK_DELETED = "TASK_DELETED",

    // State changes (Phase C)
    VIEW_CHANGED = "VIEW_CHANGED",
    FULLSCREEN_CHANGED = "FULLSCREEN_CHANGED",
}
```

---

## Event Payload Shapes (TypeScript)

Tất cả payloads tuân theo `GanttEventPayload` wrapper:

```typescript
interface GanttEventPayload {
    widgetId: string;       // Mendix widget name (e.g., "ganttChart1")
    type: GanttOutgoingEvents;
    data: TaskEventData | AddTaskRequestedData | TaskReorderedData | ViewChangedData | FullscreenChangedData;
}
```

### TASK_CLICKED / TASK_DOUBLE_CLICKED

```typescript
interface TaskEventData {
    task: GanttTask;  // Full task object at time of click
}

// JSON example:
// {
//   "widgetId": "ganttChart1",
//   "type": "TASK_CLICKED",
//   "data": {
//     "task": {
//       "id": "123",
//       "text": "Phase A",
//       "start_date": "2026-07-01",
//       "end_date": "2026-07-31",
//       "parent": "100",
//       "metadata": { "mendixGuid": "abc123..." }
//     }
//   }
// }
```

### ADD_TASK_REQUESTED

```typescript
interface AddTaskRequestedData {
    task: GanttTask;      // Parent task that was clicked
    level: number;        // Always 1 (0-indexed second tier)
    childCount: number;   // Current number of descendants
}

// JSON example:
// {
//   "widgetId": "ganttChart1",
//   "type": "ADD_TASK_REQUESTED",
//   "data": {
//     "task": { "id": "456", "text": "Phase B", "parent": "100", ... },
//     "level": 1,
//     "childCount": 3
//   }
// }
```

### TASK_UPDATED (NEW — drag/resize)

```typescript
interface TaskUpdatedData {
    task: GanttTask;              // Task with updated dates
    changeType: "move" | "resize" | "progress";
}

// JSON example (drag):
// {
//   "widgetId": "ganttChart1",
//   "type": "TASK_UPDATED",
//   "data": {
//     "task": {
//       "id": "789",
//       "text": "Work Package 1",
//       "start_date": "2026-07-15",
//       "end_date": "2026-07-28",
//       "duration": 13,
//       "parent": "456",
//       "metadata": { "mendixGuid": "xyz789..." }
//     },
//     "changeType": "move"
//   }
// }
```

### TASK_REORDERED (NEW — grid drag-and-drop)

```typescript
interface TaskReorderedData {
    task: GanttTask;      // Task that was moved (with updated parent)
    newParentId: string;  // New parent task ID ("0" nếu root)
    newOrderNo: number;   // New sibling position (1-indexed)
}

// JSON example:
// {
//   "widgetId": "ganttChart1",
//   "type": "TASK_REORDERED",
//   "data": {
//     "task": { "id": "789", "text": "Work Package 1", "parent": "789_new_parent", ... },
//     "newParentId": "999",
//     "newOrderNo": 2
//   }
// }
```

### VIEW_CHANGED

```typescript
interface ViewChangedData {
    viewMode: "day" | "week" | "month";
}
```

### FULLSCREEN_CHANGED

```typescript
interface FullscreenChangedData {
    fullscreen: boolean;
}
```

---

## GanttTask Model (unchanged)

```typescript
interface GanttTask {
    id: string;
    text: string;
    start_date: string | Date;
    end_date?: string | Date;
    duration?: number;
    progress?: number;
    parent?: string;
    open?: boolean;
    type?: string;
    color?: string;
    tags?: string[];
    mto_date?: string | Date;
    orderNo?: number;
    metadata?: Record<string, unknown>;  // Mendix GUID stored here
}
```

---

## WidgetEventBridge Interface (updated)

```typescript
interface WidgetEventBridgeOptions {
    widgetId: string;
    eventBus: GanttEventBus;
    onEvent?: ActionValue;
    eventType?: EditableValue<string>;    // NEW
    eventPayload?: EditableValue<string>; // NEW
}

interface WidgetEventBridge {
    handleTaskClick: (task: GanttTask) => void;
    handleTaskDoubleClick: (task: GanttTask) => void;
    handleTaskCreated: (task: GanttTask) => void;
    handleTaskUpdated: (task: GanttTask, changeType: "move" | "resize" | "progress") => void; // NEW
    handleTaskDeleted: (taskId: string) => void;
    handleAddTaskRequested: (task: GanttTask, childCount: number) => void;
    handleTaskReordered: (task: GanttTask, newParentId: string, newOrderNo: number) => void;  // NEW
    handleViewChanged: (viewMode: string) => void;          // NEW
    handleFullscreenChanged: (fullscreen: boolean) => void; // NEW
}
```

---

## Mendix Non-Persistent Entity Schema

```
Entity: GanttEventContext (non-persistent, 1 instance per page session)
  Attributes:
    EventType    : String(200)    ← widget writes event name
    EventPayload : String(unlimited) ← widget writes JSON string

  Generalization: System.Session (optional, không bắt buộc)
```

Không cần persist, không cần association — chỉ cần tồn tại đủ lâu cho nanoflow đọc.
