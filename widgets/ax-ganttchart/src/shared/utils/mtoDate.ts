import type { GanttTask } from "../../events/eventTypes";

export type GanttEventTypeTag = "MTO" | "K/O";

/** Level 1–2 (DHTMLX $level 0–1) show grid only — no timeline event bars. */
export const TIMELINE_EVENT_MIN_ZERO_LEVEL = 2;

export function shouldShowTimelineEventBar(level: number | undefined): boolean {
    return (level ?? 0) >= TIMELINE_EVENT_MIN_ZERO_LEVEL;
}

function pad2(value: number): string {
    return String(value).padStart(2, "0");
}

export function formatGanttDateTime(date: Date): string {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} 00:00`;
}

/** Strip time-of-day so drag math matches DHTMLX day-based timeline columns. */
export function toLocalCalendarDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function calendarDayDiff(from: Date, to: Date): number {
    const fromDay = toLocalCalendarDay(from).getTime();
    const toDay = toLocalCalendarDay(to).getTime();
    return Math.round((toDay - fromDay) / 86_400_000);
}

export function addCalendarDays(date: Date, days: number): Date {
    const next = toLocalCalendarDay(date);
    next.setDate(next.getDate() + days);
    return next;
}

const eventDragBaselines = new Map<string, GanttTask>();

export function beginEventMtoDrag(taskId: string | number, task: GanttTask): void {
    if (!getEventTypeTag(task.milestone)) {
        return;
    }

    eventDragBaselines.set(String(taskId), normalizeGanttTaskDates({ ...task }));
}

export function endEventMtoDrag(taskId: string | number): void {
    eventDragBaselines.delete(String(taskId));
}

export function resolveEventDragBaseline(taskId: string | number, fallback: GanttTask): GanttTask {
    return eventDragBaselines.get(String(taskId)) ?? fallback;
}

export function parseGanttDate(value: string | Date | undefined): Date | null {
    if (value == null) {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    const normalized = value.length === 10 ? `${value}T00:00:00` : value.replace(" ", "T");
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeEventTypeTag(value: string | undefined): GanttEventTypeTag | undefined {
    if (!value) {
        return undefined;
    }

    const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
    if (normalized === "MTO") {
        return "MTO";
    }

    if (normalized === "K/O" || normalized === "KO") {
        return "K/O";
    }

    return undefined;
}

export function getEventTypeTag(milestone?: string): GanttEventTypeTag | undefined {
    return normalizeEventTypeTag(milestone);
}

export function isEventLeafTask(task: GanttTask, tasks: GanttTask[]): boolean {
    if (task.type === "project" || task.type === "milestone") {
        return false;
    }

    return !tasks.some(candidate => candidate.parent === task.id);
}

export function isGanttEventTask(task: GanttTask, tasks?: GanttTask[]): boolean {
    if (!getEventTypeTag(task.milestone)) {
        return false;
    }

    if (tasks) {
        return isEventLeafTask(task, tasks);
    }

    return true;
}

/** Format datasource stndMileMonth only — never derive start/end from other fields. */
export function normalizeMtoDateField(task: GanttTask): GanttTask {
    if (!task.stndMileMonth) {
        return task;
    }

    const parsed = parseGanttDate(task.stndMileMonth);
    if (!parsed) {
        return task;
    }

    return { ...task, stndMileMonth: formatGanttDateTime(parsed) };
}

/** Keep MTO/K/O milestone aligned when the user drags a task bar horizontally. */
export function syncEventMtoDateWithDrag(
    task: GanttTask,
    original: GanttTask,
    mode: string
): string | undefined {
    if (mode !== "move") {
        return undefined;
    }

    const eventType = getEventTypeTag(task.milestone);
    if (!eventType) {
        return undefined;
    }

    const origStart = parseGanttDate(original.start_date);
    const newStart = parseGanttDate(task.start_date);
    if (!origStart || !newStart) {
        return undefined;
    }

    if (eventType === "K/O") {
        return formatGanttDateTime(toLocalCalendarDay(newStart));
    }

    const origMto = parseGanttDate(original.stndMileMonth);
    if (!origMto) {
        return undefined;
    }

    const mtoOffsetDays = calendarDayDiff(origStart, origMto);
    return formatGanttDateTime(addCalendarDays(newStart, mtoOffsetDays));
}

export function normalizeGanttTaskDates(task: GanttTask): GanttTask {
    const start = parseGanttDate(task.start_date);
    const end = parseGanttDate(task.end_date);
    const mto = parseGanttDate(task.stndMileMonth);

    return {
        ...task,
        start_date: start ? formatGanttDateTime(start) : task.start_date,
        end_date: end ? formatGanttDateTime(end) : task.end_date,
        stndMileMonth: mto ? formatGanttDateTime(mto) : task.stndMileMonth
    };
}
