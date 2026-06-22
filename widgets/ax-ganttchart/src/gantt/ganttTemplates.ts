import type { GanttStatic } from "dhtmlx-gantt";
import type { GanttTask } from "../events/ganttEvents";
import { shouldShowTimelineEventBar, getEventTypeTag } from "../shared/utils/mtoDate";
import { canDragGridRow } from "../shared/utils/gridReorder";

export function applyGanttTemplates(target: GanttStatic): void {
    (target.templates as Record<string, unknown>).timeline_cell_class = (_task: unknown, date: Date): string => {
        const scales = target.config.scales as Array<{ unit: string }> | undefined;
        const bottomUnit = scales?.[scales.length - 1]?.unit;
        if (bottomUnit !== "day") {
            return "";
        }

        const day = date.getDay();
        return day === 0 || day === 6 ? "gantt-weekend" : "";
    };

    (target.templates as Record<string, unknown>).task_class = (
        _start: unknown,
        _end: unknown,
        task: { type?: string; $level?: number }
    ): string => {
        const classes: string[] = [];

        switch (task.type) {
            case "project":
                classes.push("gantt-type-project");
                break;
            case "milestone":
                classes.push("gantt-type-milestone");
                break;
            default:
                classes.push("gantt-type-task");
        }

        if (!shouldShowTimelineEventBar(task.$level)) {
            classes.push("gantt-timeline-no-event");
        }

        if (getEventTypeTag((task as GanttTask).milestone)) {
            classes.push("gantt-event-no-resize");
        }

        return classes.join(" ");
    };

    (target.templates as Record<string, unknown>).task_row_class = (
        _start: unknown,
        _end: unknown,
        task: { $level?: number }
    ): string => {
        return shouldShowTimelineEventBar(task.$level) ? "" : "gantt-timeline-no-event-row";
    };

    (target.templates as Record<string, unknown>).grid_row_class = (
        _start: unknown,
        _end: unknown,
        task: { type?: string; $level?: number }
    ): string => {
        const classes: string[] = [];

        if (task.type === "project") {
            classes.push("gantt-row-project");
        }

        if (canDragGridRow(task)) {
            classes.push("gantt-draggable-row");
        }

        return classes.join(" ");
    };
}
