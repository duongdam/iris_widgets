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
    metadata?: Record<string, unknown>;
}

export enum TimelineViewMode {
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    QUARTER = "quarter"
}

export enum GanttIncomingEvents {
    LOAD_DATA = "LOAD_DATA",
    REFRESH = "REFRESH",
    EXPAND_ALL = "EXPAND_ALL",
    COLLAPSE_ALL = "COLLAPSE_ALL",
    ENTER_FULLSCREEN = "ENTER_FULLSCREEN",
    EXIT_FULLSCREEN = "EXIT_FULLSCREEN",
    ZOOM_DAY = "ZOOM_DAY",
    ZOOM_WEEK = "ZOOM_WEEK",
    ZOOM_MONTH = "ZOOM_MONTH",
    ZOOM_QUARTER = "ZOOM_QUARTER",
    SET_START_DATE = "SET_START_DATE",
    SET_END_DATE = "SET_END_DATE",
    SCROLL_TO_TODAY = "SCROLL_TO_TODAY",
    SCROLL_TO_TASK = "SCROLL_TO_TASK",
    EXPORT_PDF = "EXPORT_PDF",
    EXPORT_PNG = "EXPORT_PNG",
    EXPORT_JPEG = "EXPORT_JPEG",
    EXPORT_EXCEL = "EXPORT_EXCEL",
    FIT_TIMELINE = "FIT_TIMELINE",
    SHOW_GRID = "SHOW_GRID",
    HIDE_GRID = "HIDE_GRID",
    SHOW_TIMELINE = "SHOW_TIMELINE",
    HIDE_TIMELINE = "HIDE_TIMELINE"
}

export enum GanttOutgoingEvents {
    TASK_SELECTED = "TASK_SELECTED",
    TASK_CLICKED = "TASK_CLICKED",
    TASK_DOUBLE_CLICKED = "TASK_DOUBLE_CLICKED",
    TASK_CREATED = "TASK_CREATED",
    TASK_UPDATED = "TASK_UPDATED",
    TASK_DELETED = "TASK_DELETED",
    VIEW_CHANGED = "VIEW_CHANGED",
    FULLSCREEN_CHANGED = "FULLSCREEN_CHANGED",
    TIMELINE_CHANGED = "TIMELINE_CHANGED"
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

export interface ViewChangedData {
    viewMode: TimelineViewMode;
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
