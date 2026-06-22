import type { GanttTask } from "../events/ganttEvents";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface GanttTooltipDisplay {
    text: string;
    type?: string;
    status?: string;
    assignee?: string;
    startFormatted: string;
    endFormatted: string;
    duration: string;
    progress?: number;
    progressPercent: number;
}

function toDateSafe(value: string | Date | undefined): Date | null {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    const normalized = value.length === 10 ? `${value}T00:00:00` : value.replace(" ", "T");
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTooltipDate(value: string | Date | undefined): string {
    const date = toDateSafe(value);
    if (!date) {
        return "—";
    }

    return `${MONTH_ABBR[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function calcTooltipDuration(task: GanttTask): string {
    if (task.duration != null && task.duration > 0) {
        return `${task.duration} day${task.duration !== 1 ? "s" : ""}`;
    }

    const start = toDateSafe(task.start_date);
    const end = toDateSafe(task.end_date);
    if (start && end) {
        const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} day${days !== 1 ? "s" : ""}` : "—";
    }

    return "—";
}

export function progressPercent(progress: number | undefined): number {
    if (progress == null) {
        return 0;
    }

    return Math.round(progress > 1 ? progress : progress * 100);
}

export function buildTooltipDisplay(task: GanttTask): GanttTooltipDisplay {
    return {
        text: task.text,
        type: task.type,
        status: task.metadata?.status as string | undefined,
        assignee: task.metadata?.assignee as string | undefined,
        startFormatted: formatTooltipDate(task.start_date),
        endFormatted: formatTooltipDate(task.end_date),
        duration: calcTooltipDuration(task),
        progress: task.progress,
        progressPercent: progressPercent(task.progress)
    };
}

/** HTML for DHTMLX `tooltip_text` template. */
export function buildTooltipHtml(task: GanttTask): string {
    const display = buildTooltipDisplay(task);
    const { text, type, status, assignee, startFormatted, endFormatted, duration, progress, progressPercent: pct } =
        display;

    const typeChip =
        type && type !== "task"
            ? `<span style="background:${type === "milestone" ? "#722ed1" : "#0958d9"};border-radius:3px;padding:1px 6px;font-size:12px;font-weight:500;text-transform:capitalize;">${type}</span>`
            : "";
    const statusChip = status
        ? `<span style="background:rgba(255,255,255,0.15);border-radius:3px;padding:1px 6px;font-size:12px;">${status}</span>`
        : "";
    const chips =
        typeChip || statusChip
            ? `<div style="margin-bottom:6px;display:flex;gap:5px;flex-wrap:wrap;">${typeChip}${statusChip}</div>`
            : "";
    const progressBar =
        progress != null
            ? `<div style="margin-top:6px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                    <span style="color:rgba(255,255,255,0.65);">Progress</span>
                    <span style="font-weight:500;">${pct}%</span>
                </div>
                <div style="height:4px;background:rgba(255,255,255,0.15);border-radius:99px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:${pct >= 100 ? "#52c41a" : "#4096ff"};border-radius:99px;"></div>
                </div>
            </div>`
            : "";
    const assigneeRow = assignee
        ? `<div style="margin-top:6px;color:rgba(255,255,255,0.65);">Assignee: <span style="color:#fff;">${assignee}</span></div>`
        : "";

    return `<div style="min-width:180px;max-width:260px;font-size:13px;line-height:1.6;">
        <div style="font-weight:600;margin-bottom:6px;">${text}</div>
        ${chips}
        <div style="color:rgba(255,255,255,0.65);margin-bottom:4px;">
            <span>${startFormatted}</span>
            <span style="margin:0 5px;">→</span>
            <span>${endFormatted}</span>
        </div>
        <div style="color:rgba(255,255,255,0.65);margin-bottom:4px;">
            Duration: <span style="color:#fff;">${duration}</span>
        </div>
        ${progressBar}
        ${assigneeRow}
    </div>`;
}
