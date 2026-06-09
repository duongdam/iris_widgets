import type { GanttStatic } from "dhtmlx-gantt";

type GanttDateValue = string | Date | undefined;

function toDate(value: GanttDateValue): Date | null {
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

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Jun 10" — readable, compact, saves column width vs ISO format */
function formatShortDate(value: GanttDateValue): string {
    const date = toDate(value);
    if (!date) {
        return "";
    }

    return `${MONTH_ABBR[date.getMonth()]} ${date.getDate()}`;
}

function resolveTaskEndDate(task: {
    start_date?: GanttDateValue;
    end_date?: GanttDateValue;
    duration?: number;
}): string {
    if (task.end_date) {
        return formatShortDate(task.end_date);
    }

    const start = toDate(task.start_date);
    if (!start) {
        return "";
    }

    const end = new Date(start);
    end.setDate(end.getDate() + (task.duration ?? 1));
    return formatShortDate(end);
}

function resolveTaskDuration(task: {
    start_date?: GanttDateValue;
    end_date?: GanttDateValue;
    duration?: number;
}): string {
    if (task.duration != null && task.duration > 0) {
        return `${task.duration}d`;
    }

    const start = toDate(task.start_date);
    const end = toDate(task.end_date);
    if (!start || !end) {
        return "";
    }

    const diffMs = end.getTime() - start.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : "";
}

export interface GanttColumnConfig {
    name: string;
    label: string;
    width: number;
    align?: "left" | "center" | "right";
    tree?: boolean;
}

export function getDefaultColumns(): GanttColumnConfig[] {
    return [
        { name: "text", label: "Projects", width: 200, tree: true },
        { name: "start_date", label: "Start", width: 82, align: "center" },
        { name: "end_date", label: "End", width: 82, align: "center" }
    ];
}

type TaskLike = {
    text?: string;
    start_date?: GanttDateValue;
    end_date?: GanttDateValue;
    duration?: number;
};

export function applyColumns(gantt: GanttStatic, columns: GanttColumnConfig[]): void {
    gantt.config.columns = columns.map(col => {
        if (col.name === "text") {
            return {
                name: col.name,
                label: col.label,
                width: col.width,
                align: col.align ?? "left",
                tree: col.tree,
                template: (task: TaskLike) => {
                    const text = task.text ?? "";
                    return `<span title="${text.replace(/"/g, "&quot;")}">${text}</span>`;
                }
            };
        }

        if (col.name === "end_date") {
            return {
                name: col.name,
                label: col.label,
                width: col.width,
                align: col.align ?? "center",
                template: (task: TaskLike) => resolveTaskEndDate(task)
            };
        }

        if (col.name === "start_date") {
            return {
                name: col.name,
                label: col.label,
                width: col.width,
                align: col.align ?? "center",
                template: (task: TaskLike) => formatShortDate(task.start_date)
            };
        }

        if (col.name === "duration") {
            return {
                name: col.name,
                label: col.label,
                width: col.width,
                align: col.align ?? "right",
                template: (task: TaskLike) => resolveTaskDuration(task)
            };
        }

        return {
            name: col.name,
            label: col.label,
            width: col.width,
            align: col.align ?? "left",
            tree: col.tree
        };
    }) as typeof gantt.config.columns;
}
