export type { AxGanttTask as GanttTask } from "../shared/types/axGanttTask";
export { TimelineViewMode } from "../shared/types/timelineViewMode";

/** Single source of truth for Mendix commands and internal event-bus topics. */
export enum GanttEvent {
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

/** @deprecated Use {@link GanttEvent} */
export { GanttEvent as GanttIncomingEvents };
/** @deprecated Use {@link GanttEvent} */
export { GanttEvent as GanttCommand };

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

export interface ParsedGanttCommand {
    type: GanttEvent;
    command: GanttEvent;
    data?: unknown;
}

const COMMAND_LOOKUP = Object.fromEntries(Object.values(GanttEvent).map(command => [command, command])) as Record<
    string,
    GanttEvent
>;

function normalizeCommandName(value: string): string {
    return value
        .trim()
        .replace(/[\s-]+/g, "_")
        .toUpperCase();
}

function parsePayload(payloadJson?: string): unknown {
    if (payloadJson == null || payloadJson.trim() === "") {
        return undefined;
    }

    try {
        return JSON.parse(payloadJson) as unknown;
    } catch {
        return payloadJson;
    }
}

/** Parse a Mendix command string, or undefined if unsupported. */
export function parseGanttCommandEnum(value: string): GanttEvent | undefined {
    const normalized = normalizeCommandName(value);
    return COMMAND_LOOKUP[normalized];
}

export const GANTT_COMMAND_NAMES = Object.values(GanttEvent);

export function warnUnsupportedCommand(rawCommand: string): void {
    console.warn(`[AxGanttChart] Unsupported command: "${rawCommand}". Supported: ${GANTT_COMMAND_NAMES.join(", ")}`);
}

export function parseGanttCommand(command: string, payloadJson?: string): ParsedGanttCommand | undefined {
    const typedCommand = parseGanttCommandEnum(command);
    if (!typedCommand) {
        warnUnsupportedCommand(command);
        return undefined;
    }

    const rawData = parsePayload(payloadJson);

    if (typedCommand === GanttEvent.SET_START_DATE || typedCommand === GanttEvent.SET_END_DATE) {
        if (rawData && typeof rawData === "object" && "date" in rawData) {
            return { type: typedCommand, command: typedCommand, data: rawData as SetDateData };
        }

        if (typeof rawData === "string" && rawData) {
            return { type: typedCommand, command: typedCommand, data: { date: rawData } satisfies SetDateData };
        }

        return { type: typedCommand, command: typedCommand };
    }

    if (typedCommand === GanttEvent.SCROLL_TO_TASK) {
        if (rawData && typeof rawData === "object" && "taskId" in rawData) {
            return { type: typedCommand, command: typedCommand, data: rawData as ScrollToTaskData };
        }

        if (typeof rawData === "string" && rawData) {
            return { type: typedCommand, command: typedCommand, data: { taskId: rawData } satisfies ScrollToTaskData };
        }

        return { type: typedCommand, command: typedCommand };
    }

    return { type: typedCommand, command: typedCommand, data: rawData };
}
