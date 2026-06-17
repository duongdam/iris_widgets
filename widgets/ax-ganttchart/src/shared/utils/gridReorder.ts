import type { GanttStatic } from "dhtmlx-gantt";
import type { GanttStore } from "../../stores/GanttStore";
import type { GanttTask } from "../../main/eventbus/eventTypes";
import type { WidgetEventBridge } from "../../main/services/WidgetEventBridge";
import { TIMELINE_EVENT_MIN_ZERO_LEVEL } from "./mtoDate";

type TaskWithLevel = { id?: string | number; $level?: number; parent?: string | number };

/** Child rows (Level 3+) can be reordered across parents in grid reorder mode. */
export function canDragGridRow(task: TaskWithLevel): boolean {
    return (task.$level ?? 0) >= TIMELINE_EVENT_MIN_ZERO_LEVEL;
}

export function isValidGridReorderTarget(
    gantt: GanttStatic,
    task: TaskWithLevel,
    targetParentId: string | number
): boolean {
    if (!canDragGridRow(task)) {
        return false;
    }

    const parentId = targetParentId != null ? String(targetParentId) : "";
    if (!parentId || parentId === "0") {
        return false;
    }

    if (!gantt.isTaskExists(parentId)) {
        return false;
    }

    const targetParent = gantt.getTask(parentId) as TaskWithLevel;
    const taskLevel = task.$level ?? 0;
    const expectedParentLevel = taskLevel - 1;

    return (targetParent.$level ?? 0) === expectedParentLevel;
}

export function syncTaskParentFromGantt(
    taskId: string,
    store: GanttStore,
    gantt: GanttStatic,
    bridge?: WidgetEventBridge
): void {
    if (!gantt.isTaskExists(taskId)) {
        return;
    }

    const ganttTask = gantt.getTask(taskId) as GanttTask;
    const parentRaw = ganttTask.parent;
    const newParentId = parentRaw != null ? String(parentRaw) : "0";
    const parent = newParentId !== "0" && newParentId !== "" ? newParentId : undefined;
    const existing = store.taskById.get(taskId);

    if (!existing || existing.parent === parent) {
        return;
    }

    store.updateTaskParent(taskId, parent);

    const newOrderNo = gantt.getTaskIndex(taskId) + 1;
    bridge?.handleTaskReordered({ ...existing, parent }, newParentId, newOrderNo);
}

type GanttWithDom = GanttStatic & { $task_data?: HTMLElement; $grid_data?: HTMLElement };
type GanttWithLayout = GanttStatic & { resetLayout?: () => void };

/** DHTMLX requires resetLayout (not render) when toggling order_branch after init. */
function refreshGanttLayout(target: GanttStatic): void {
    const ganttWithLayout = target as GanttWithLayout;
    if (typeof ganttWithLayout.resetLayout === "function") {
        ganttWithLayout.resetLayout();
        return;
    }

    target.render();
}

function setGridReorderModeClass(enabled: boolean, target: GanttStatic): void {
    (target as GanttWithDom).$grid_data?.classList.toggle("gantt-reorder-mode", enabled);
}

export interface GridReorderOptions {
    readOnly?: boolean;
}

export function applyGridReorderConfig(
    enabled: boolean,
    store: GanttStore,
    bridge: WidgetEventBridge | undefined,
    target: GanttStatic,
    options: GridReorderOptions = {}
): () => void {
    const active = enabled && !options.readOnly;
    const config = target.config as typeof target.config & {
        order_branch?: boolean | string;
        order_branch_free?: boolean;
    };

    config.order_branch = active ? "marker" : false;
    config.order_branch_free = active;
    setGridReorderModeClass(active, target);

    const eventIds: string[] = [];

    if (active) {
        eventIds.push(
            target.attachEvent("onBeforeRowDragMove", (id, parent) => {
                if (!target.isTaskExists(id)) {
                    return false;
                }

                const task = target.getTask(id) as TaskWithLevel;
                return isValidGridReorderTarget(target, task, parent);
            })
        );

        eventIds.push(
            target.attachEvent("onBeforeRowDragEnd", (id, parent) => {
                if (!target.isTaskExists(id)) {
                    return false;
                }

                const task = target.getTask(id) as TaskWithLevel;
                return isValidGridReorderTarget(target, task, parent);
            })
        );

        eventIds.push(
            target.attachEvent("onRowDragEnd", id => {
                syncTaskParentFromGantt(String(id), store, target, bridge);
            })
        );
    }

    refreshGanttLayout(target);

    return () => {
        for (const eventId of eventIds) {
            target.detachEvent(eventId);
        }

        config.order_branch = false;
        config.order_branch_free = false;
        setGridReorderModeClass(false, target);
        refreshGanttLayout(target);
    };
}
