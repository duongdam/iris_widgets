import { gantt, type GanttStatic } from "dhtmlx-gantt";
import { applyColumns, getDefaultColumns } from "./ColumnManager";
import { applyTimelineRange, getScales } from "./TimelineManager";
import { installTodayMarkerSync } from "./todayMarker";
import { TimelineViewMode, type GanttTask } from "../eventbus/eventTypes";

export interface GanttDisplayConfig {
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    viewMode: TimelineViewMode;
    taskCount?: number;
    timelineStart?: Date;
    timelineEnd?: Date;
}

export interface GanttNativeEventHandlers {
    onTaskClick?: (id: string, event: Event) => boolean | void;
    onTaskDblClick?: (id: string, event: Event) => boolean | void;
    onAfterTaskUpdate?: (id: string, task: GanttTask) => void;
    onAfterTaskAdd?: (id: string, task: GanttTask) => void;
    onAfterTaskDelete?: (id: string) => void;
    onMouseMove?: (id: string, event: Event) => void;
}

const HOVER_DEBOUNCE_MS = 16;
let pluginsEnabled = false;

export function initGantt(container: HTMLElement, display: GanttDisplayConfig): void {
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.smart_rendering = true;
    gantt.config.autosize = false;
    gantt.config.row_height = 40;
    gantt.config.bar_height = 25;
    gantt.config.scale_height = 70;
    gantt.config.column_width = 28;
    gantt.config.show_progress = display.showProgress;
    gantt.config.show_grid = display.showGrid;
    gantt.config.show_chart = display.showTimeline;
    gantt.config.fit_tasks = false;
    gantt.config.start_on_monday = true;
    gantt.config.xml_date = "%Y-%m-%d %H:%i";

    if ((display.taskCount ?? 0) > 500) {
        gantt.config.show_task_cells = false;
    }

    applyTemplates(gantt);
    applyColumns(gantt, getDefaultColumns());
    gantt.config.scales = getScales(display.viewMode) as typeof gantt.config.scales;
    applyTimelineRange(gantt, display.viewMode, display.timelineStart, display.timelineEnd);

    gantt.init(container);
}

function applyTemplates(target: GanttStatic): void {
    // Weekend cell background — only active when the bottom scale is "day"
    (target.templates as Record<string, unknown>).timeline_cell_class = (
        _task: unknown,
        date: Date
    ): string => {
        const scales = target.config.scales as Array<{ unit: string }> | undefined;
        const bottomUnit = scales?.[scales.length - 1]?.unit;
        if (bottomUnit !== "day") {
            return "";
        }

        const day = date.getDay();
        return day === 0 || day === 6 ? "gantt-weekend" : "";
    };

    // Semantic CSS class per task type
    (target.templates as Record<string, unknown>).task_class = (
        _start: unknown,
        _end: unknown,
        task: { type?: string }
    ): string => {
        switch (task.type) {
            case "project":
                return "gantt-type-project";
            case "milestone":
                return "gantt-type-milestone";
            default:
                return "gantt-type-task";
        }
    };

    // Grid row class for summary rows (bold text)
    (target.templates as Record<string, unknown>).grid_row_class = (
        _start: unknown,
        _end: unknown,
        task: { type?: string }
    ): string => {
        if (task.type === "project") {
            return "gantt-row-project";
        }

        return "";
    };
}

export function enablePlugins(target: GanttStatic = gantt): void {
    if (pluginsEnabled) {
        return;
    }

    target.plugins({
        export_api: true
    });
    pluginsEnabled = true;
}

export function attachNativeEvents(handlers: GanttNativeEventHandlers, target: GanttStatic = gantt): () => void {
    const eventIds: string[] = [];
    let hoverTimer: ReturnType<typeof setTimeout> | undefined;
    let pendingHoverId: string | undefined;

    if (handlers.onTaskClick) {
        eventIds.push(
            target.attachEvent("onTaskClick", (id, event) => {
                handlers.onTaskClick?.(String(id), event as Event);
                return true;
            })
        );
    }

    if (handlers.onTaskDblClick) {
        eventIds.push(
            target.attachEvent("onTaskDblClick", (id, event) => {
                handlers.onTaskDblClick?.(String(id), event as Event);
                return false;
            })
        );
    }

    if (handlers.onAfterTaskUpdate) {
        eventIds.push(
            target.attachEvent("onAfterTaskUpdate", (id, task) => {
                handlers.onAfterTaskUpdate?.(String(id), task as unknown as GanttTask);
                return true;
            })
        );
    }

    if (handlers.onAfterTaskAdd) {
        eventIds.push(
            target.attachEvent("onAfterTaskAdd", (id, task) => {
                handlers.onAfterTaskAdd?.(String(id), task as unknown as GanttTask);
                return true;
            })
        );
    }

    if (handlers.onAfterTaskDelete) {
        eventIds.push(
            target.attachEvent("onAfterTaskDelete", id => {
                handlers.onAfterTaskDelete?.(String(id));
                return true;
            })
        );
    }

    if (handlers.onMouseMove) {
        eventIds.push(
            target.attachEvent("onMouseMove", (id, event) => {
                pendingHoverId = String(id);
                if (hoverTimer !== undefined) {
                    clearTimeout(hoverTimer);
                }
                hoverTimer = setTimeout(() => {
                    if (pendingHoverId) {
                        handlers.onMouseMove?.(pendingHoverId, event as Event);
                    }
                    hoverTimer = undefined;
                }, HOVER_DEBOUNCE_MS);
                return true;
            })
        );
    }

    return () => {
        for (const eventId of eventIds) {
            target.detachEvent(eventId);
        }
        if (hoverTimer !== undefined) {
            clearTimeout(hoverTimer);
        }
    };
}

export function updateLayout(
    display: Pick<GanttDisplayConfig, "showGrid" | "showTimeline">,
    target: GanttStatic = gantt
): void {
    target.config.show_grid = display.showGrid;
    target.config.show_chart = display.showTimeline;
    target.render();
}

/**
 * Soft-reset the gantt instance for React remounts.
 * Do NOT call destructor() on the module singleton — DHTMLX marks the instance
 * as $destroyed and a subsequent init() fails (tasksStore undefined).
 */
export function resetGantt(target: GanttStatic = gantt): void {
    if ((target as GanttStatic & { $destroyed?: boolean }).$destroyed) {
        return;
    }

    try {
        target.clearAll();
    } catch {
        // Instance may not be initialized yet.
    }

    if (target.$root) {
        target.$root.innerHTML = "";
    }
}

/** @deprecated Use resetGantt — destructor breaks singleton re-init in Strict Mode. */
export function destroyGantt(target: GanttStatic = gantt): void {
    resetGantt(target);
}

export function setupTodayMarkerSync(getEnabled: () => boolean, target: GanttStatic = gantt): () => void {
    return installTodayMarkerSync(target, getEnabled);
}

export { gantt };
