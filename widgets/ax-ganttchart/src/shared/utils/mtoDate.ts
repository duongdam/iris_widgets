import type { GanttTask } from "../../main/eventbus/eventTypes";

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

export function isEventLeafTask(task: GanttTask, tasks: GanttTask[]): boolean {
    if (task.type === "project" || task.type === "milestone") {
        return false;
    }

    return !tasks.some(candidate => candidate.parent === task.id);
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

/** Format datasource mto_date only — never derive start/end or mto from other fields. */
export function normalizeMtoDateField(task: GanttTask): GanttTask {
    if (!task.mto_date) {
        return task;
    }

    const parsed = parseGanttDate(task.mto_date);
    if (!parsed) {
        return task;
    }

    return { ...task, mto_date: formatGanttDateTime(parsed) };
}
