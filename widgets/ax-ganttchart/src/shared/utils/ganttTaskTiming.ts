import type { GanttTask } from "../../main/eventbus/eventTypes";
import { formatGanttDateTime, parseGanttDate } from "./mtoDate";

export function hasValidGanttStartDate(value: string | Date | undefined): boolean {
    return parseGanttDate(value) != null;
}

/** Ensure DHTMLX receives valid start/end/duration before parse, add, or update. */
export function ensureTaskTimingForGantt(task: GanttTask): GanttTask | null {
    if (!hasValidGanttStartDate(task.start_date)) {
        return null;
    }

    const next: GanttTask = { ...task };

    if (next.type === "milestone" || next.duration === 0) {
        if (!next.end_date) {
            const start = parseGanttDate(next.start_date);
            if (!start) {
                return null;
            }
            next.end_date = formatGanttDateTime(start);
        }
        next.duration = 0;
        return next;
    }

    if (next.end_date && hasValidGanttStartDate(next.end_date)) {
        return next;
    }

    if (next.duration != null && next.duration > 0) {
        return next;
    }

    return null;
}

export function prepareTasksForGanttSync(tasks: GanttTask[]): GanttTask[] {
    const prepared: GanttTask[] = [];

    for (const task of tasks) {
        const normalized = ensureTaskTimingForGantt(task);
        if (normalized) {
            prepared.push(normalized);
        }
    }

    return prepared;
}
