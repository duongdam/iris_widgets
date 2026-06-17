export interface GanttTask {
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
    /** Optional labels rendered as chips in the grid text column (e.g. Manual, Process, MTO, K/O). */
    tags?: string[];
    /** MTO / K/O milestone date — midpoint for MTO, start for K/O. */
    mto_date?: string | Date;
    /** Sibling sort index within the same parent branch. */
    orderNo?: number;
    metadata?: Record<string, unknown>;
}

export enum TimelineViewMode {
    DAY = "day",
    WEEK = "week",
    MONTH = "month"
}

export enum GanttIncomingEvents {
    LOAD_DATA = "LOAD_DATA",
    REFRESH = "REFRESH",
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
    SET_START_DATE = "SET_START_DATE",
    SET_END_DATE = "SET_END_DATE",
    SCROLL_TO_TODAY = "SCROLL_TO_TODAY",
    SCROLL_TO_TASK = "SCROLL_TO_TASK",
    EXPORT_PDF = "EXPORT_PDF",
    EXPORT_PNG = "EXPORT_PNG",
    EXPORT_EXCEL = "EXPORT_EXCEL",
    FIT_TIMELINE = "FIT_TIMELINE",
    SHOW_GRID = "SHOW_GRID",
    HIDE_GRID = "HIDE_GRID",
    SHOW_TIMELINE = "SHOW_TIMELINE",
    HIDE_TIMELINE = "HIDE_TIMELINE"
}

export enum GanttOutgoingEvents {
    TASK_CLICKED = "TASK_CLICKED",
    TASK_DOUBLE_CLICKED = "TASK_DOUBLE_CLICKED",
    ADD_TASK_REQUESTED = "ADD_TASK_REQUESTED",
    /** Emitted after drag/resize on timeline bar. Use to commit new dates to Mendix. */
    TASK_UPDATED = "TASK_UPDATED",
    /** Emitted after grid row is reordered to a new parent. Use to commit parent/orderNo to Mendix. */
    TASK_REORDERED = "TASK_REORDERED",
    TASK_CREATED = "TASK_CREATED",
    TASK_DELETED = "TASK_DELETED",
    /** Emitted when the timeline zoom/view mode changes. */
    VIEW_CHANGED = "VIEW_CHANGED",
    /** Emitted when fullscreen state changes. */
    FULLSCREEN_CHANGED = "FULLSCREEN_CHANGED"
}

export type GanttEventType = GanttIncomingEvents | GanttOutgoingEvents;

export interface GanttEventPayload {
    widgetId: string;
    type: GanttEventType;
    data?: unknown;
}

export type GanttEventHandler = (payload: GanttEventPayload) => void;

export interface GanttEventBus {
    emit(payload: GanttEventPayload): void;
    on(type: GanttEventType, handler: GanttEventHandler): () => void;
    off(type: GanttEventType, handler: GanttEventHandler): void;
    once(type: GanttEventType, handler: GanttEventHandler): void;
    clear(): void;
}

export interface TaskEventData {
    task: GanttTask;
}

export interface AddTaskRequestedData {
    /** Parent row that was clicked — use task.id to pre-fill parent when creating a new task. */
    task: GanttTask;
    /** Always 1 — 0-indexed second hierarchy tier. */
    level: number;
    /** Current number of descendant tasks under this parent. */
    childCount: number;
}

export interface TaskUpdatedData {
    /** Task with updated dates after drag/resize. */
    task: GanttTask;
    /** How the task was changed on the timeline. */
    changeType?: "move" | "resize" | "progress";
}

export interface TaskReorderedData {
    /** Task with updated parent reference after grid drag-and-drop. */
    task: GanttTask;
    /** New parent task ID. "0" means moved to root level. */
    newParentId: string;
    /** New 1-indexed sibling position within the new parent. */
    newOrderNo: number;
}

export interface ViewChangedData {
    viewMode: "day" | "week" | "month";
}

export interface FullscreenChangedData {
    fullscreen: boolean;
}

export interface ScrollToTaskData {
    taskId: string;
}

export interface SetDateData {
    date: string;
}

export interface ExportResultData {
    url?: string;
    error?: string;
    format: "pdf" | "png" | "jpeg" | "excel";
}
