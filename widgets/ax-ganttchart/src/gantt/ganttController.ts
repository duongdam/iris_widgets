import type { AxGanttStore } from "../stores/AxGanttStore";
import type { MendixActionBridge } from "../shared/bridge/mendixActionBridge";
import { computeChangedNum } from "../shared/bridge/mendixActionBridge";
import type { GanttTask } from "../events/ganttEvents";
import type { GanttEditingConfig } from "../shared/types/editingConfig";
import { normalizeGanttTaskDates } from "../shared/utils/mtoDate";
import { syncTasks } from "../main/services/GanttSyncService";
import { scrollToTaskOrEvent, scrollToToday } from "../main/components/TimelineManager";
import { scheduleTodayMarkerRefresh } from "../main/components/TodayMarker";
import { scheduleMtoMarkerRefresh } from "../main/components/MtoMarker";
import { applyEditingConfig } from "./ganttEditing";
import {
    attachAddButtonDelegation,
    attachNativeEvents,
    attachTaskInteractionDelegation
} from "./ganttDomEvents";
import { initGantt, setupMtoMarkerSync, setupTodayMarkerSync, type GanttDisplayConfig } from "./ganttInit";
import { installGanttLayoutSync, resetGantt } from "./ganttLayout";
import { applyCrossHighlight, clearCrossHighlight } from "./ganttCrossHighlight";
import { gantt } from "./ganttInstance";

export interface GanttControllerOptions {
    store: AxGanttStore;
    container: HTMLElement;
    display: GanttDisplayConfig;
    editing: GanttEditingConfig;
    useDhtmlxTooltip?: boolean;
    actionBridge?: MendixActionBridge;
    onAddTaskClick?: (taskId: string) => void;
    onHoverTask?: (taskId: string | undefined) => void;
    getShowTodayMarker: () => boolean;
}

export interface GanttControllerHandle {
    state: { previousTasks: GanttTask[] };
    teardown: () => void;
}

function resolveTask(taskId: string, store: AxGanttStore): GanttTask | undefined {
    const fromStore = store.getTask(taskId);
    if (fromStore) {
        return fromStore;
    }

    if (gantt.isTaskExists(taskId)) {
        return gantt.getTask(taskId) as GanttTask;
    }

    return undefined;
}

function emitTaskClick(taskId: string, store: AxGanttStore, actionBridge?: MendixActionBridge): void {
    const task = resolveTask(taskId, store);
    if (!task) {
        return;
    }

    store.selectTask(task);
    scrollToTaskOrEvent(gantt, task);
    actionBridge?.fireClicked(task);
}

function emitTaskDoubleClick(taskId: string, store: AxGanttStore, actionBridge?: MendixActionBridge): void {
    const task = resolveTask(taskId, store);
    if (!task) {
        return;
    }

    store.selectTask(task);
    actionBridge?.fireDoubleClicked(task);
}

function scheduleFocusOnToday(showMarker: boolean): void {
    requestAnimationFrame(() => {
        scrollToToday(gantt);
        scheduleTodayMarkerRefresh(gantt, showMarker);
    });
}

/** Bind DHTMLX instance, native events, and Mendix action handlers. */
export function bindGanttController(options: GanttControllerOptions): GanttControllerHandle {
    const {
        store,
        container,
        display,
        editing,
        useDhtmlxTooltip,
        actionBridge,
        onAddTaskClick,
        onHoverTask,
        getShowTodayMarker
    } = options;

    initGantt(container, display);

    const teardownLayout = installGanttLayoutSync(container);
    const teardownTodayMarker = setupTodayMarkerSync(getShowTodayMarker);
    const teardownMtoMarker = setupMtoMarkerSync();
    const teardownEditing = applyEditingConfig(editing);

    const detachEvents = attachNativeEvents({
        onMouseMove: (id: string) => {
            if (!useDhtmlxTooltip) {
                store.setHoveredTaskId(id);
            }
            onHoverTask?.(id);
            applyCrossHighlight(id);
        }
    });

    const beforeDragEventId = gantt.attachEvent("onBeforeTaskDrag", (id: string | number) => {
        const task = gantt.getTask(id) as GanttTask;
        const start = task.start_date;
        if (start) {
            const startDate = start instanceof Date ? start : new Date(String(start).replace(" ", "T"));
            store.snapshotDragStart(String(id), startDate);
        }
        return true;
    });

    const teardownTaskInteraction = attachTaskInteractionDelegation(container, {
        onTaskClick: (taskId: string) => {
            emitTaskClick(taskId, store, actionBridge);
        },
        onTaskDblClick: (taskId: string) => {
            emitTaskDoubleClick(taskId, store, actionBridge);
        }
    });

    const state = { previousTasks: [] as GanttTask[] };

    const dragEventId = gantt.attachEvent("onAfterTaskDrag", (id: string | number) => {
        const liveTask = normalizeGanttTaskDates(gantt.getTask(id) as GanttTask);
        store.updateTaskFromTimeline(liveTask);
        state.previousTasks = state.previousTasks.map(task => (task.id === liveTask.id ? liveTask : task));

        const taskId = String(id);
        const previousStart = store.getDragStartDate(taskId);
        const currentStart = liveTask.start_date;
        if (previousStart && currentStart) {
            const currentDate =
                currentStart instanceof Date ? currentStart : new Date(String(currentStart).replace(" ", "T"));
            const changedNum = computeChangedNum(previousStart, currentDate);
            actionBridge?.fireChanged(liveTask, changedNum);
        }

        store.clearDragSnapshot(taskId);
        scheduleMtoMarkerRefresh(gantt);
        return true;
    });

    const teardownAddButton = attachAddButtonDelegation(container, (taskId, event) => {
        event.stopPropagation();
        onAddTaskClick?.(taskId);
    });

    if (store.tasks.length > 0) {
        state.previousTasks = syncTasks([], store.tasks);
    }

    scheduleFocusOnToday(getShowTodayMarker());

    return {
        state,
        teardown: () => {
            teardownTodayMarker();
            teardownMtoMarker();
            teardownEditing();
            teardownAddButton();
            teardownTaskInteraction();
            teardownLayout();
            gantt.detachEvent(beforeDragEventId);
            gantt.detachEvent(dragEventId);
            detachEvents();
            clearCrossHighlight();
            resetGantt();
        }
    };
}
