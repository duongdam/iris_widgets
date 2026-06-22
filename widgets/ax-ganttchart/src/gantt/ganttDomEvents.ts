import type { GanttStatic } from "dhtmlx-gantt";
import type { GanttTask } from "../events/ganttEvents";
import { gantt } from "./ganttInstance";

const HOVER_DEBOUNCE_MS = 16;
const TASK_CLICK_DELAY_MS = 250;

export interface GanttNativeEventHandlers {
    onTaskClick?: (id: string, event: Event) => boolean | void;
    onTaskDblClick?: (id: string, event: Event) => boolean | void;
    onAfterTaskUpdate?: (id: string, task: GanttTask) => void;
    onAfterTaskAdd?: (id: string, task: GanttTask) => void;
    onAfterTaskDelete?: (id: string) => void;
    onMouseMove?: (id: string, event: Event) => void;
    onAddButtonClick?: (taskId: string, event: Event) => void;
}

export interface TaskInteractionHandlers {
    onTaskClick?: (taskId: string, event: Event) => void;
    onTaskDblClick?: (taskId: string, event: Event) => void;
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

/** Delegated click/dblclick — custom column templates do not reliably trigger DHTMLX onTaskClick. */
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
