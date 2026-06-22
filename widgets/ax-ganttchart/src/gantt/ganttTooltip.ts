import type { GanttStatic } from "dhtmlx-gantt";
import type { GanttTask } from "../events/ganttEvents";
import { buildTooltipHtml } from "./tooltipContent";
import { gantt } from "./ganttInstance";

let pluginsRegistered = false;

type TooltipExtension = {
    detach: (selector: string) => void;
    tooltipFor: (config: {
        selector: string;
        html: (event: Event) => string | null | undefined;
        global?: boolean;
    }) => void;
};

function getTooltipExtension(target: GanttStatic): TooltipExtension | undefined {
    return (target as GanttStatic & { ext?: { tooltips?: TooltipExtension } }).ext?.tooltips;
}

export function enablePlugins(target: GanttStatic = gantt): void {
    if (pluginsRegistered) {
        return;
    }

    target.plugins({
        export_api: true,
        tooltip: true
    });
    pluginsRegistered = true;
}

function detachAllDhtmlxTooltips(target: GanttStatic = gantt): void {
    const tooltips = getTooltipExtension(target);
    if (!tooltips) {
        return;
    }

    const attr = target.config.task_attribute;
    tooltips.detach(`[${attr}]:not(.gantt_task_row)`);
    tooltips.detach(`.gantt_grid_data .gantt_row[${attr}]`);
    tooltips.detach(`.gantt_task_row[${attr}]`);
    tooltips.detach(`.gantt_task_line[${attr}]`);
}

function setupDhtmlxTooltips(target: GanttStatic = gantt): void {
    const tooltips = getTooltipExtension(target);
    if (!tooltips) {
        return;
    }

    detachAllDhtmlxTooltips(target);

    const attr = target.config.task_attribute;
    const renderHtml = (event: Event): string | null => {
        if (target.config.touch && !target.config.touch_tooltip) {
            return null;
        }

        const taskId = target.locate(event);
        if (!taskId || !target.isTaskExists(taskId)) {
            return null;
        }

        return buildTooltipHtml(target.getTask(taskId) as GanttTask);
    };

    tooltips.tooltipFor({
        selector: `.gantt_grid_data .gantt_row[${attr}]`,
        html: renderHtml,
        global: false
    });

    tooltips.tooltipFor({
        selector: `.gantt_task_row[${attr}]`,
        html: renderHtml,
        global: false
    });

    tooltips.tooltipFor({
        selector: `.gantt_task_line[${attr}]`,
        html: renderHtml,
        global: false
    });
}

function configureDhtmlxTooltip(target: GanttStatic = gantt): void {
    target.config.tooltip_timeout = 300;
    target.config.tooltip_offset_x = 14;
    target.config.tooltip_offset_y = 0;
    target.config.tooltip_hide_timeout = 100;
}

function applyDhtmlxTooltipTemplate(target: GanttStatic = gantt): void {
    (target.templates as Record<string, unknown>).tooltip_text = (
        _start: Date,
        _end: Date,
        task: GanttTask
    ): string => buildTooltipHtml(task);
}

/**
 * Enable or disable DHTMLX tooltips. Returns teardown for React remounts.
 * Must be called before gantt.init().
 */
export function syncDhtmlxTooltip(enabled: boolean, target: GanttStatic = gantt): () => void {
    let readyHandlerId: string | null = null;

    const applyState = (): void => {
        if (enabled) {
            configureDhtmlxTooltip(target);
            applyDhtmlxTooltipTemplate(target);
            setupDhtmlxTooltips(target);
            return;
        }

        detachAllDhtmlxTooltips(target);
    };

    readyHandlerId = target.attachEvent("onGanttReady", applyState);

    return () => {
        if (readyHandlerId) {
            target.detachEvent(readyHandlerId);
            readyHandlerId = null;
        }
        detachAllDhtmlxTooltips(target);
    };
}
