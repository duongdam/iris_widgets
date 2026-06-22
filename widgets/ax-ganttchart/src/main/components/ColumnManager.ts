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

function escapeHtml(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type TaskLike = {
    id?: string | number;
    text?: string;
    hasManual?: boolean;
    hasTuning?: boolean;
    $level?: number;
    start_date?: GanttDateValue;
    end_date?: GanttDateValue;
    duration?: number;
};

const CHIP_CLASS_MAP: Record<string, string> = {
    Manual: "gantt-chip--manual",
    Tuning: "gantt-chip--tuning"
};

function renderChip(label: string): string {
    const chipClass = CHIP_CLASS_MAP[label] ?? "gantt-chip--default";
    return `<span class="gantt-chip ${chipClass}">${escapeHtml(label)}</span>`;
}

function renderTaskChips(task: TaskLike): string {
    const chips: string[] = [];

    if (task.hasTuning) {
        chips.push(renderChip("Tuning"));
    }

    if (task.hasManual) {
        chips.push(renderChip("Manual"));
    }

    return chips.join("");
}

/** 0-indexed second hierarchy tier (e.g. Phase in Program → Phase → …). */
export const GANTT_ADD_BUTTON_LEVEL = 1;

function countDescendants(taskId: string, target: GanttStatic): number {
    if (!target.isTaskExists(taskId)) {
        return 0;
    }

    let count = 0;
    target.eachTask(() => {
        count += 1;
    }, taskId);
    return count;
}

function renderAddButton(taskId: string | number | undefined): string {
    if (taskId == null) {
        return "";
    }

    const safeId = escapeHtml(String(taskId));
    return (
        `<button type="button" class="gantt-add-btn" data-task-id="${safeId}" ` +
        `aria-label="Add task" title="Add task">+</button>`
    );
}

function renderTextCell(task: TaskLike, target: GanttStatic): string {
    const text = task.text ?? "";
    const safeText = escapeHtml(text);
    const childCount = countDescendants(String(task.id), target);
    const chips = renderTaskChips(task);
    const countHtml = childCount > 0 ? `<span class="gantt-text-cell__count">(${childCount})</span>` : "";
    const level = task.$level ?? 0;
    const addButtonHtml = level === GANTT_ADD_BUTTON_LEVEL ? renderAddButton(task.id) : "";

    return (
        `<div class="gantt-text-cell">` +
        `<span class="gantt-text-cell__label" title="${safeText}">${safeText}</span>` +
        `<span class="gantt-text-cell__meta">` +
        (chips ? `<span class="gantt-text-cell__chips">${chips}</span>` : "") +
        countHtml +
        addButtonHtml +
        `</span>` +
        `</div>`
    );
}

export interface GanttColumnConfig {
    name: string;
    label: string;
    width: number;
    align?: "left" | "center" | "right";
    tree?: boolean;
}

export function getDefaultColumns(): GanttColumnConfig[] {
    return [{ name: "text", label: "Projects", width: 300, tree: true }];
}

export function applyColumns(ganttInstance: GanttStatic, columns: GanttColumnConfig[]): void {
    ganttInstance.config.columns = columns.map(col => {
        if (col.name === "text") {
            return {
                name: col.name,
                label: col.label,
                width: col.width,
                align: col.align ?? "left",
                tree: col.tree,
                template: (task: TaskLike) => renderTextCell(task, ganttInstance)
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
    }) as typeof ganttInstance.config.columns;
}
