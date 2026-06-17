import { GanttIncomingEvents } from "../../main/eventbus/eventTypes";

/** Strongly typed Mendix → Gantt command names. */
export enum GanttCommand {
    FIT_TIMELINE = "FIT_TIMELINE",
    ZOOM_DAY = "ZOOM_DAY",
    ZOOM_WEEK = "ZOOM_WEEK",
    ZOOM_MONTH = "ZOOM_MONTH",
    EXPAND_ALL = "EXPAND_ALL",
    COLLAPSE_ALL = "COLLAPSE_ALL",
    SCROLL_TO_TASK = "SCROLL_TO_TASK",
    SET_START_DATE = "SET_START_DATE",
    SET_END_DATE = "SET_END_DATE",
    REFRESH = "REFRESH",
    /** @deprecated Use REFRESH */
    LOAD_DATA = "LOAD_DATA",
    SCROLL_TO_TODAY = "SCROLL_TO_TODAY",
    ENTER_FULLSCREEN = "ENTER_FULLSCREEN",
    EXIT_FULLSCREEN = "EXIT_FULLSCREEN",
    ENTER_EXPAND_HEIGHT = "ENTER_EXPAND_HEIGHT",
    EXIT_EXPAND_HEIGHT = "EXIT_EXPAND_HEIGHT",
    TOGGLE_EXPAND_HEIGHT = "TOGGLE_EXPAND_HEIGHT",
    EXPORT_PDF = "EXPORT_PDF",
    EXPORT_PNG = "EXPORT_PNG",
    EXPORT_EXCEL = "EXPORT_EXCEL",
    SHOW_GRID = "SHOW_GRID",
    HIDE_GRID = "HIDE_GRID",
    SHOW_TIMELINE = "SHOW_TIMELINE",
    HIDE_TIMELINE = "HIDE_TIMELINE"
}

const COMMAND_TO_EVENT: Record<GanttCommand, GanttIncomingEvents> = {
    [GanttCommand.FIT_TIMELINE]: GanttIncomingEvents.FIT_TIMELINE,
    [GanttCommand.ZOOM_DAY]: GanttIncomingEvents.ZOOM_DAY,
    [GanttCommand.ZOOM_WEEK]: GanttIncomingEvents.ZOOM_WEEK,
    [GanttCommand.ZOOM_MONTH]: GanttIncomingEvents.ZOOM_MONTH,
    [GanttCommand.EXPAND_ALL]: GanttIncomingEvents.EXPAND_ALL,
    [GanttCommand.COLLAPSE_ALL]: GanttIncomingEvents.COLLAPSE_ALL,
    [GanttCommand.SCROLL_TO_TASK]: GanttIncomingEvents.SCROLL_TO_TASK,
    [GanttCommand.SET_START_DATE]: GanttIncomingEvents.SET_START_DATE,
    [GanttCommand.SET_END_DATE]: GanttIncomingEvents.SET_END_DATE,
    [GanttCommand.REFRESH]: GanttIncomingEvents.REFRESH,
    [GanttCommand.LOAD_DATA]: GanttIncomingEvents.LOAD_DATA,
    [GanttCommand.SCROLL_TO_TODAY]: GanttIncomingEvents.SCROLL_TO_TODAY,
    [GanttCommand.ENTER_FULLSCREEN]: GanttIncomingEvents.ENTER_FULLSCREEN,
    [GanttCommand.EXIT_FULLSCREEN]: GanttIncomingEvents.EXIT_FULLSCREEN,
    [GanttCommand.ENTER_EXPAND_HEIGHT]: GanttIncomingEvents.ENTER_EXPAND_HEIGHT,
    [GanttCommand.EXIT_EXPAND_HEIGHT]: GanttIncomingEvents.EXIT_EXPAND_HEIGHT,
    [GanttCommand.TOGGLE_EXPAND_HEIGHT]: GanttIncomingEvents.TOGGLE_EXPAND_HEIGHT,
    [GanttCommand.EXPORT_PDF]: GanttIncomingEvents.EXPORT_PDF,
    [GanttCommand.EXPORT_PNG]: GanttIncomingEvents.EXPORT_PNG,
    [GanttCommand.EXPORT_EXCEL]: GanttIncomingEvents.EXPORT_EXCEL,
    [GanttCommand.SHOW_GRID]: GanttIncomingEvents.SHOW_GRID,
    [GanttCommand.HIDE_GRID]: GanttIncomingEvents.HIDE_GRID,
    [GanttCommand.SHOW_TIMELINE]: GanttIncomingEvents.SHOW_TIMELINE,
    [GanttCommand.HIDE_TIMELINE]: GanttIncomingEvents.HIDE_TIMELINE
};

const COMMAND_LOOKUP = Object.fromEntries(Object.values(GanttCommand).map(command => [command, command])) as Record<
    string,
    GanttCommand
>;

function normalizeCommandName(value: string): string {
    return value
        .trim()
        .replace(/[\s-]+/g, "_")
        .toUpperCase();
}

/** Parse a Mendix command string into a typed {@link GanttCommand}, or undefined if unsupported. */
export function parseGanttCommandEnum(value: string): GanttCommand | undefined {
    const normalized = normalizeCommandName(value);
    return COMMAND_LOOKUP[normalized];
}

/** Map a typed command to the internal event bus event type. */
export function ganttCommandToEvent(command: GanttCommand): GanttIncomingEvents {
    return COMMAND_TO_EVENT[command];
}

export const GANTT_COMMAND_NAMES = Object.values(GanttCommand);

export function warnUnsupportedCommand(rawCommand: string): void {
    console.warn(`[AxGanttChart] Unsupported command: "${rawCommand}". Supported: ${GANTT_COMMAND_NAMES.join(", ")}`);
}
