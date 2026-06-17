/**
 * Contract: Gantt Widget — Unified Event Bridge
 *
 * Tất cả tương tác từ widget ra ngoài được thể hiện qua 1 onEvent action.
 * Nanoflow đọc eventType + eventPayload attributes trực tiếp — không cần JavaScript global.
 *
 * Flow:
 *   User interaction
 *     → Widget emits internally
 *     → eventType.setValue(type)
 *     → eventPayload.setValue(JSON.stringify(payload))
 *     → executeAction(onEvent)
 *     → Nanoflow: ExclusiveSplit on $eventType
 */

import type { GanttTask } from "./gantt-record";

// ─── Outgoing Events (widget → Mendix) ─────────────────────────────────────

export enum GanttOutgoingEvents {
    /** User clicked a task row or bar */
    TASK_CLICKED = "TASK_CLICKED",
    /** User double-clicked a task row or bar */
    TASK_DOUBLE_CLICKED = "TASK_DOUBLE_CLICKED",

    /** User clicked (+) add button on a level-2 row */
    ADD_TASK_REQUESTED = "ADD_TASK_REQUESTED",

    /** User finished dragging or resizing a task bar — commit new dates */
    TASK_UPDATED = "TASK_UPDATED",
    /** User reordered a row to a new parent via grid drag-and-drop — commit parent + orderNo */
    TASK_REORDERED = "TASK_REORDERED",

    /** Task was created in-Gantt (if enabled) */
    TASK_CREATED = "TASK_CREATED",
    /** Task was deleted in-Gantt (if enabled) */
    TASK_DELETED = "TASK_DELETED",

    /** Timeline view mode changed */
    VIEW_CHANGED = "VIEW_CHANGED",
    /** Fullscreen state changed */
    FULLSCREEN_CHANGED = "FULLSCREEN_CHANGED",
}

// ─── Incoming Commands (Mendix → widget via `command` attribute) ────────────

export enum GanttIncomingCommands {
    REFRESH = "REFRESH",
    LOAD_DATA = "LOAD_DATA",

    EXPAND_ALL = "EXPAND_ALL",
    COLLAPSE_ALL = "COLLAPSE_ALL",

    ENTER_FULLSCREEN = "ENTER_FULLSCREEN",
    EXIT_FULLSCREEN = "EXIT_FULLSCREEN",
    ENTER_EXPAND_HEIGHT = "ENTER_EXPAND_HEIGHT",
    EXIT_EXPAND_HEIGHT = "EXIT_EXPAND_HEIGHT",
    TOGGLE_EXPAND_HEIGHT = "TOGGLE_EXPAND_HEIGHT",

    ZOOM_DAY = "ZOOM_DAY",
    ZOOM_WEEK = "ZOOM_WEEK",
    ZOOM_MONTH = "ZOOM_MONTH",

    SET_START_DATE = "SET_START_DATE",   // commandPayload: { "date": "ISO" }
    SET_END_DATE = "SET_END_DATE",       // commandPayload: { "date": "ISO" }

    SCROLL_TO_TODAY = "SCROLL_TO_TODAY",
    SCROLL_TO_TASK = "SCROLL_TO_TASK",  // commandPayload: { "taskId": "..." }

    FIT_TIMELINE = "FIT_TIMELINE",

    SHOW_GRID = "SHOW_GRID",
    HIDE_GRID = "HIDE_GRID",
    SHOW_TIMELINE = "SHOW_TIMELINE",
    HIDE_TIMELINE = "HIDE_TIMELINE",

    EXPORT_PDF = "EXPORT_PDF",
    EXPORT_PNG = "EXPORT_PNG",
    EXPORT_EXCEL = "EXPORT_EXCEL",
}

// ─── Event Payload Shapes ───────────────────────────────────────────────────

export interface GanttEventPayload {
    widgetId: string;
    type: GanttOutgoingEvents;
    data: EventData;
}

export type EventData =
    | TaskEventData
    | AddTaskRequestedData
    | TaskUpdatedData
    | TaskReorderedData
    | TaskDeletedData
    | ViewChangedData
    | FullscreenChangedData;

export interface TaskEventData {
    task: GanttTask;
}

export interface AddTaskRequestedData {
    /** Parent row that was clicked — use task.id to pre-fill Parent when creating new task */
    task: GanttTask;
    /** Always 1 — second hierarchy tier (0-indexed) */
    level: number;
    /** Current number of child/descendant tasks */
    childCount: number;
}

export interface TaskUpdatedData {
    /** Task with updated dates after drag/resize */
    task: GanttTask;
    /** How the task was changed */
    changeType: "move" | "resize" | "progress";
}

export interface TaskReorderedData {
    /** Task with updated parent reference */
    task: GanttTask;
    /** New parent task ID. "0" means moved to root level. */
    newParentId: string;
    /** New 1-indexed sibling position within the new parent */
    newOrderNo: number;
}

export interface TaskDeletedData {
    taskId: string;
}

export interface ViewChangedData {
    viewMode: "day" | "week" | "month";
}

export interface FullscreenChangedData {
    fullscreen: boolean;
}

// ─── Mendix Widget Bridge Interface ────────────────────────────────────────

export interface WidgetEventBridgeOptions {
    widgetId: string;
    eventBus: GanttEventBusLike;
    onEvent?: MendixActionValue;
    /** Write-back: widget sets this to the outgoing event type name */
    eventType?: MendixEditableValue;
    /** Write-back: widget sets this to JSON.stringify(GanttEventPayload) */
    eventPayload?: MendixEditableValue;
}

export interface WidgetEventBridge {
    handleTaskClick(task: GanttTask): void;
    handleTaskDoubleClick(task: GanttTask): void;
    handleAddTaskRequested(task: GanttTask, childCount: number): void;
    handleTaskUpdated(task: GanttTask, changeType: "move" | "resize" | "progress"): void;
    handleTaskReordered(task: GanttTask, newParentId: string, newOrderNo: number): void;
    handleTaskCreated(task: GanttTask): void;
    handleTaskDeleted(taskId: string): void;
    handleViewChanged(viewMode: string): void;
    handleFullscreenChanged(fullscreen: boolean): void;
}

// ─── Minimal Mendix API types (for internal reference) ─────────────────────

interface MendixEditableValue {
    setValue(value: string): void;
}

interface MendixActionValue {
    canExecute?: boolean;
    isExecuting?: boolean;
    execute?(): void;
}

interface GanttEventBusLike {
    emit(payload: GanttEventPayload): void;
    on(type: string, handler: (payload: GanttEventPayload) => void): () => void;
    clear(): void;
}
