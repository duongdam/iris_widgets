import { gantt, type GanttStatic } from "dhtmlx-gantt";
import { applyColumns, getDefaultColumns } from "./ColumnManager";
import { applyTimelineRange, getScales } from "./TimelineManager";
import { installTodayMarkerSync } from "./TodayMarker";
import { installMtoMarkerSync } from "./MtoMarker";
import { TimelineViewMode, type GanttTask } from "../eventbus/eventTypes";
import type { GanttEditingConfig } from "../../shared/types/editingConfig";
import { shouldShowTimelineEventBar, getEventTypeTag } from "../../shared/utils/mtoDate";
import { canDragGridRow } from "../../shared/utils/gridReorder";
import { applyGanttLayoutConfig } from "../../shared/constants/ganttLayout";

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
    onAddButtonClick?: (taskId: string, event: Event) => void;
}

const HOVER_DEBOUNCE_MS = 16;
let pluginsEnabled = false;
let linkBlockingEnabled = false;

/** Toolbar row height (padding + border) subtracted from widget height for the gantt container. */
export const GANTT_TOOLBAR_HEIGHT = 41;
export const GANTT_MIN_CONTAINER_HEIGHT = 120;

export function resolveGanttShellHeight(height: number, expandHeight: boolean): number | string {
    return expandHeight ? "100vh" : `${height}px`;
}

export function resolveGanttContainerHeight(
    height: number,
    expandHeight: boolean,
    showToolbar: boolean
): number | string {
    const toolbarOffset = showToolbar ? GANTT_TOOLBAR_HEIGHT : 0;

    if (expandHeight) {
        return `calc(100vh - ${toolbarOffset}px)`;
    }

    return Math.max(height - toolbarOffset, GANTT_MIN_CONTAINER_HEIGHT);
}

export function scheduleGanttLayoutRefresh(target: GanttStatic = gantt): void {
    requestAnimationFrame(() => {
        target.render();
    });
}

export function installGanttLayoutSync(container: HTMLElement, target: GanttStatic = gantt): () => void {
    const refresh = (): void => {
        scheduleGanttLayoutRefresh(target);
    };

    refresh();

    if (typeof ResizeObserver === "undefined") {
        return () => undefined;
    }

    const observer = new ResizeObserver(refresh);
    observer.observe(container);
    return () => observer.disconnect();
}

export function initGantt(container: HTMLElement, display: GanttDisplayConfig): void {
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.smart_rendering = true;
    gantt.config.autosize = false;
    applyGanttLayoutConfig(gantt);
    gantt.config.show_progress = display.showProgress;
    gantt.config.show_grid = display.showGrid;
    gantt.config.show_chart = display.showTimeline;
    gantt.config.fit_tasks = false;
    gantt.config.start_on_monday = true;
    gantt.config.xml_date = "%Y-%m-%d %H:%i";
    gantt.config.show_links = false;
    gantt.config.drag_links = false;

    if ((display.taskCount ?? 0) > 500) {
        gantt.config.show_task_cells = false;
    }

    applyTemplates(gantt);
    applyColumns(gantt, getDefaultColumns());
    gantt.config.scales = getScales(display.viewMode) as typeof gantt.config.scales;
    applyTimelineRange(gantt, display.viewMode, display.timelineStart, display.timelineEnd);

    gantt.init(container);
    blockTaskLinking(gantt);
}

/** Prevent dependency links between tasks (display + drag-create + programmatic add/delete). */
function blockTaskLinking(target: GanttStatic): void {
    if (linkBlockingEnabled) {
        return;
    }

    target.attachEvent("onBeforeLinkAdd", () => false);
    target.attachEvent("onBeforeLinkDelete", () => false);
    linkBlockingEnabled = true;
}

/** Apply Mendix editing flags to DHTMLX Gantt. Returns detach function for event handlers. */
export function applyEditingConfig(config: GanttEditingConfig, target: GanttStatic = gantt): () => void {
    const editable = !config.readOnly;

    target.config.readonly = config.readOnly;
    target.config.drag_move = config.allowDrag && editable;
    target.config.drag_resize = config.allowResize && editable;
    target.config.drag_progress = config.allowUpdate && editable;
    target.config.details_on_create = config.allowCreate && editable;
    // Mendix nanoflow handles edit via TASK_DOUBLE_CLICKED — keep DHTMLX lightbox off.
    target.config.details_on_dblclick = false;

    const eventIds: string[] = [];

    eventIds.push(
        target.attachEvent("onBeforeTaskAdd", () => {
            return config.allowCreate && editable;
        })
    );

    eventIds.push(
        target.attachEvent("onBeforeTaskDelete", () => {
            return config.allowDelete && editable;
        })
    );

    eventIds.push(
        target.attachEvent("onBeforeTaskChanged", (_id, mode, task) => {
            const typedTask = task as GanttTask;

            if (mode === "resize" || mode === "progress") {
                if (getEventTypeTag(typedTask.tags)) {
                    return false;
                }

                if (mode === "resize") {
                    return config.allowResize && editable;
                }

                return config.allowUpdate && editable;
            }

            if (mode === "move") {
                return config.allowDrag && editable;
            }

            return config.allowUpdate && editable;
        })
    );

    return () => {
        for (const eventId of eventIds) {
            target.detachEvent(eventId);
        }
    };
}

function applyTemplates(target: GanttStatic): void {
    // Weekend cell background — only active when the bottom scale is "day"
    (target.templates as Record<string, unknown>).timeline_cell_class = (_task: unknown, date: Date): string => {
        const scales = target.config.scales as Array<{ unit: string }> | undefined;
        const bottomUnit = scales?.[scales.length - 1]?.unit;
        if (bottomUnit !== "day") {
            return "";
        }

        const day = date.getDay();
        return day === 0 || day === 6 ? "gantt-weekend" : "";
    };

    // Semantic CSS class per task type + hide timeline bars on hierarchy Level 1–2
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

        if (getEventTypeTag((task as GanttTask).tags)) {
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

    // Grid row class for summary rows (bold text) + reorder affordance
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

export interface TaskInteractionHandlers {
    onTaskClick?: (taskId: string, event: Event) => void;
    onTaskDblClick?: (taskId: string, event: Event) => void;
}

const TASK_CLICK_DELAY_MS = 250;

function resolveTaskIdFromDom(target: EventTarget | null): string | undefined {
    if (!(target instanceof Element)) {
        return undefined;
    }

    if (target.closest(".gantt-add-btn")) {
        return undefined;
    }

    const row = target.closest(".gantt_row, .gantt_task_row");
    if (!row) {
        return undefined;
    }

    const taskId = row.getAttribute("task_id");
    if (!taskId || taskId === "0") {
        return undefined;
    }

    return taskId;
}

/**
 * Delegated click/dblclick on grid rows and timeline rows.
 * Required because custom HTML column templates do not reliably trigger DHTMLX onTaskClick.
 */
export function attachTaskInteractionDelegation(container: HTMLElement, handlers: TaskInteractionHandlers): () => void {
    let clickTimer: ReturnType<typeof setTimeout> | undefined;

    const onClick = (event: Event): void => {
        const taskId = resolveTaskIdFromDom(event.target);
        if (!taskId || !handlers.onTaskClick) {
            return;
        }

        if (clickTimer) {
            clearTimeout(clickTimer);
        }

        clickTimer = setTimeout(() => {
            clickTimer = undefined;
            handlers.onTaskClick?.(taskId, event);
        }, TASK_CLICK_DELAY_MS);
    };

    const onDblClick = (event: Event): void => {
        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = undefined;
        }

        const taskId = resolveTaskIdFromDom(event.target);
        if (!taskId || !handlers.onTaskDblClick) {
            return;
        }

        event.preventDefault();
        handlers.onTaskDblClick(taskId, event);
    };

    container.addEventListener("click", onClick);
    container.addEventListener("dblclick", onDblClick);

    return () => {
        container.removeEventListener("click", onClick);
        container.removeEventListener("dblclick", onDblClick);
        if (clickTimer) {
            clearTimeout(clickTimer);
        }
    };
}

/** Delegated click handler for level-2 (+) buttons rendered in grid column templates. */
export function attachAddButtonDelegation(
    container: HTMLElement,
    onAddButtonClick: (taskId: string, event: Event) => void
): () => void {
    const listener = (event: Event): void => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const button = target.closest(".gantt-add-btn");
        if (!button) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        const taskId = button.getAttribute("data-task-id");
        if (taskId) {
            onAddButtonClick(taskId, event);
        }
    };

    container.addEventListener("click", listener, true);
    return () => container.removeEventListener("click", listener, true);
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

export function setupMtoMarkerSync(target: GanttStatic = gantt): () => void {
    return installMtoMarkerSync(target);
}

export { gantt };
