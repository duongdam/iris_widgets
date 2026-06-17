import type { GanttTask } from "../../main/eventbus/eventTypes";

export type GanttEventTypeTag = "MTO" | "K/O";

const EVENT_TYPE_TAGS: GanttEventTypeTag[] = ["MTO", "K/O"];

/** MTO events span this many months before the milestone. */
export const DEFAULT_MTO_MONTHS_BEFORE = 10;
/** MTO events span this many months after the milestone. */
export const DEFAULT_MTO_MONTHS_AFTER = 10;
/** K/O events extend this many months after the milestone (start). */
export const DEFAULT_KO_MONTHS_AFTER = 20;

export interface EventSpanConfig {
    mtoMonthsBefore: number;
    mtoMonthsAfter: number;
    koMonthsAfter: number;
}

export const DEFAULT_EVENT_SPAN_CONFIG: EventSpanConfig = {
    mtoMonthsBefore: DEFAULT_MTO_MONTHS_BEFORE,
    mtoMonthsAfter: DEFAULT_MTO_MONTHS_AFTER,
    koMonthsAfter: DEFAULT_KO_MONTHS_AFTER
};

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

export function addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

export function addMonths(date: Date, months: number): Date {
    const next = new Date(date);
    next.setMonth(next.getMonth() + months);
    return next;
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

export function getEventTypeTag(tags?: string[]): GanttEventTypeTag | undefined {
    if (!tags?.length) {
        return undefined;
    }

    for (const tag of tags) {
        const normalized = normalizeEventTypeTag(tag);
        if (normalized) {
            return normalized;
        }
    }

    return undefined;
}

export function isGanttEventTask(task: GanttTask, tasks?: GanttTask[]): boolean {
    if (!getEventTypeTag(task.tags)) {
        return false;
    }

    if (tasks) {
        return isEventLeafTask(task, tasks);
    }

    return true;
}

export function computeEventDatesFromMilestone(
    milestone: Date,
    eventType: GanttEventTypeTag,
    config: EventSpanConfig = DEFAULT_EVENT_SPAN_CONFIG
): Pick<GanttTask, "start_date" | "end_date" | "mto_date"> {
    if (eventType === "K/O") {
        const end = addMonths(milestone, config.koMonthsAfter);
        const mto = formatGanttDateTime(milestone);
        return {
            start_date: mto,
            end_date: formatGanttDateTime(end),
            mto_date: mto
        };
    }

    const start = addMonths(milestone, -config.mtoMonthsBefore);
    const end = addMonths(milestone, config.mtoMonthsAfter);
    return {
        start_date: formatGanttDateTime(start),
        end_date: formatGanttDateTime(end),
        mto_date: formatGanttDateTime(milestone)
    };
}

export function computeMtoDate(task: Pick<GanttTask, "start_date" | "end_date" | "tags" | "mto_date">): string | undefined {
    if (task.mto_date) {
        const explicit = parseGanttDate(task.mto_date);
        return explicit ? formatGanttDateTime(explicit) : undefined;
    }

    const eventType = getEventTypeTag(task.tags);
    if (!eventType) {
        return undefined;
    }

    const start = parseGanttDate(task.start_date);
    if (!start) {
        return undefined;
    }

    if (eventType === "K/O") {
        return formatGanttDateTime(start);
    }

    const end = parseGanttDate(task.end_date);
    if (!end) {
        return undefined;
    }

    const midpoint = new Date((start.getTime() + end.getTime()) / 2);
    return formatGanttDateTime(midpoint);
}

export function withComputedMtoDate(task: GanttTask): GanttTask {
    const mtoDate = task.mto_date ?? computeMtoDate(task);
    if (!mtoDate) {
        return task;
    }

    return { ...task, mto_date: mtoDate };
}

export function isEventLeafTask(task: GanttTask, tasks: GanttTask[]): boolean {
    if (task.type === "project" || task.type === "milestone") {
        return false;
    }

    return !tasks.some(candidate => candidate.parent === task.id);
}

export function applyEventDefaults(
    task: GanttTask,
    tasks: GanttTask[],
    index: number,
    config: EventSpanConfig = DEFAULT_EVENT_SPAN_CONFIG
): GanttTask {
    if (!isEventLeafTask(task, tasks)) {
        return withComputedMtoDate(task);
    }

    const existingType = getEventTypeTag(task.tags);
    const eventType: GanttEventTypeTag = existingType ?? (index % 2 === 0 ? "MTO" : "K/O");
    const otherTags = (task.tags ?? []).filter(tag => !EVENT_TYPE_TAGS.includes(tag as GanttEventTypeTag));

    const milestone =
        parseGanttDate(task.mto_date) ?? parseGanttDate(task.start_date) ?? new Date();

    const span = computeEventDatesFromMilestone(milestone, eventType, config);

    const normalized: GanttTask = {
        ...task,
        ...span,
        tags: [...otherTags, eventType]
    };

    return withComputedMtoDate(normalized);
}

export function normalizeGanttTasks(
    tasks: GanttTask[],
    config: EventSpanConfig = DEFAULT_EVENT_SPAN_CONFIG
): GanttTask[] {
    return tasks.map((task, index) => applyEventDefaults(task, tasks, index, config));
}
