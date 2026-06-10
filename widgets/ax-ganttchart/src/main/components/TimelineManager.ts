import type { GanttStatic } from "dhtmlx-gantt";
import { TimelineViewMode } from "../eventbus/eventTypes";

export interface GanttScaleConfig {
    unit: string;
    step: number;
    format?: string | ((date: Date) => string);
    css?: string;
}

/**
 * Default timeline window: current year Jan 1 → current year Dec 31.
 * One full year is shown by default; use SET_START_DATE / SET_END_DATE to extend.
 */
export function getDefaultTimelineStart(): Date {
    return new Date(new Date().getFullYear(), 0, 1);
}

export function getDefaultTimelineEnd(): Date {
    return new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);
}

/** @deprecated Use getDefaultTimelineStart / getDefaultTimelineEnd */
export const MOCK_TIMELINE_START = getDefaultTimelineStart();
/** @deprecated Use getDefaultTimelineStart / getDefaultTimelineEnd */
export const MOCK_TIMELINE_END = getDefaultTimelineEnd();

function parseGanttDateMs(value: string): number {
    const normalized = value.length === 10 ? `${value}T00:00:00` : value.replace(" ", "T");
    return new Date(normalized).getTime();
}

function toDateMs(value: string | Date | undefined): number {
    if (value == null) {
        return Number.NaN;
    }

    if (value instanceof Date) {
        return value.getTime();
    }

    return parseGanttDateMs(value);
}

function getTaskEndMs(task: { start_date?: string | Date; end_date?: string | Date; duration?: number }): number {
    if (task.end_date) {
        return toDateMs(task.end_date);
    }

    const startMs = toDateMs(task.start_date);
    const durationDays = task.duration ?? 1;
    return startMs + durationDays * 24 * 60 * 60 * 1000;
}

/** ISO week number (1–53). */
function getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

const SCALE_PRESETS: Record<TimelineViewMode, GanttScaleConfig[]> = {
    /** Top: year (2026, 2027…)  |  Bottom: day abbreviation (Mon, Tue… Sun) */
    [TimelineViewMode.DAY]: [
        { unit: "year", step: 1, format: "%Y" },
        { unit: "day", step: 1, format: "%D" }
    ],
    /** Top: year  |  Bottom: ISO week number zero-padded (01 → 52/53) */
    [TimelineViewMode.WEEK]: [
        { unit: "year", step: 1, format: "%Y" },
        { unit: "week", step: 1, format: (d: Date) => String(getISOWeek(d)).padStart(2, "0") }
    ],
    /** Top: year  |  Bottom: month number zero-padded (01 → 12) */
    [TimelineViewMode.MONTH]: [
        { unit: "year", step: 1, format: "%Y" },
        { unit: "month", step: 1, format: (d: Date) => String(d.getMonth() + 1).padStart(2, "0") }
    ],
    /** Quarter kept in enum for API compatibility; not exposed in toolbar UI */
    [TimelineViewMode.QUARTER]: [
        { unit: "year", step: 1, format: "%Y" },
        { unit: "month", step: 3, format: (d: Date) => `Q${Math.floor(d.getMonth() / 3) + 1}` }
    ]
};

export function getScales(mode: TimelineViewMode): GanttScaleConfig[] {
    return SCALE_PRESETS[mode];
}

/**
 * Move date forward to the next Monday (inclusive).
 * Prevents week-scale columns from bleeding into the previous year.
 */
function snapToWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun, 1=Mon … 6=Sat
    if (day !== 1) {
        d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day));
    }
    return d;
}

/**
 * Move date back to the previous Sunday (inclusive).
 * Prevents week-scale columns from bleeding into the next year.
 */
function snapToWeekEnd(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    const day = d.getDay();
    if (day !== 0) {
        d.setDate(d.getDate() - day);
    }
    return d;
}

/**
 * Apply the timeline visible range to DHTMLX.
 *
 * @param startDate - Desired range start (defaults to current-year Jan 1)
 * @param endDate   - Desired range end   (defaults to next-year Dec 31)
 * @param mode      - Current view mode; used to snap week boundaries
 */
export function applyTimelineRange(
    gantt: GanttStatic,
    mode: TimelineViewMode,
    startDate?: Date,
    endDate?: Date
): void {
    let start = startDate ? new Date(startDate) : getDefaultTimelineStart();
    let end = endDate ? new Date(endDate) : getDefaultTimelineEnd();

    // Week mode: snap to Monday/Sunday so the year header never bleeds
    // into the previous or next year.
    if (mode === TimelineViewMode.WEEK) {
        start = snapToWeekStart(start);
        end = snapToWeekEnd(end);
    }

    gantt.config.start_date = start;
    gantt.config.end_date = end;
}

export function applyMode(
    gantt: GanttStatic,
    mode: TimelineViewMode,
    startDate?: Date,
    endDate?: Date
): void {
    gantt.config.scales = getScales(mode) as typeof gantt.config.scales;
    applyTimelineRange(gantt, mode, startDate, endDate);
    // Re-apply after scale change to prevent DHTMLX from reverting to its default 70px
    gantt.config.min_column_width = 1;
    gantt.config.column_width = 32;
    gantt.render();
}

export function fitTimeline(gantt: GanttStatic): void {
    if (gantt.getTaskCount() === 0) {
        return;
    }

    let minTime = Number.POSITIVE_INFINITY;
    let maxTime = Number.NEGATIVE_INFINITY;

    gantt.eachTask(task => {
        if (!task || task.start_date == null) {
            return;
        }

        minTime = Math.min(minTime, toDateMs(task.start_date));
        maxTime = Math.max(maxTime, getTaskEndMs(task));
    });

    if (!Number.isFinite(minTime) || !Number.isFinite(maxTime)) {
        return;
    }

    const mid = new Date((minTime + maxTime) / 2);
    gantt.showDate(mid);
}

export function scrollToToday(gantt: GanttStatic): void {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    gantt.showDate(today);
}

export function scrollToDate(gantt: GanttStatic, date: Date): void {
    gantt.showDate(date);
}

export function scrollToTask(gantt: GanttStatic, taskId: string): void {
    if (gantt.isTaskExists(taskId)) {
        gantt.showTask(taskId);
    }
}

export function setStartDate(gantt: GanttStatic, date: Date): void {
    gantt.config.start_date = date;
    gantt.render();
}

export function setEndDate(gantt: GanttStatic, date: Date): void {
    gantt.config.end_date = date;
    gantt.render();
}

export function incomingEventToViewMode(event: string): TimelineViewMode | undefined {
    switch (event) {
        case "ZOOM_DAY":
            return TimelineViewMode.DAY;
        case "ZOOM_WEEK":
            return TimelineViewMode.WEEK;
        case "ZOOM_MONTH":
            return TimelineViewMode.MONTH;
        case "ZOOM_QUARTER":
            return TimelineViewMode.QUARTER;
        default:
            return undefined;
    }
}

export function parseViewMode(value: string): TimelineViewMode {
    switch (value) {
        case TimelineViewMode.DAY:
        case TimelineViewMode.WEEK:
        case TimelineViewMode.MONTH:
        case TimelineViewMode.QUARTER:
            return value;
        default:
            return TimelineViewMode.WEEK;
    }
}
