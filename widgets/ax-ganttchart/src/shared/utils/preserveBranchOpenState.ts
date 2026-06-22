import type { GanttTask } from "../../events/eventTypes";

function taskHasChildren(taskId: string, tasks: GanttTask[]): boolean {
    return tasks.some(task => task.parent === taskId);
}

/**
 * Keep branch open state across datasource refreshes.
 * - Explicit `open: true` from datasource always wins.
 * - Explicit `open: false` from datasource always wins.
 * - When datasource omits `open`, preserve previous widget state.
 */
export function preserveBranchOpenState(currentTasks: GanttTask[], incomingTasks: GanttTask[]): GanttTask[] {
    if (incomingTasks.length === 0) {
        return incomingTasks;
    }

    const currentOpenById = new Map(currentTasks.map(task => [task.id, task.open]));

    return incomingTasks.map(task => {
        if (!taskHasChildren(task.id, incomingTasks)) {
            return task;
        }

        if (task.open === true || task.open === false) {
            return task;
        }

        if (currentOpenById.get(task.id) === true) {
            return { ...task, open: true };
        }

        return task;
    });
}

export interface GanttOpenStateReader {
    isTaskExists(id: string): boolean;
    hasChild(id: string): boolean | number | undefined;
    getTask(id: string): { $open?: boolean };
}

/**
 * Merge live DHTMLX branch state into tasks before re-syncing the chart.
 * Used when Mendix refresh arrives without `openAttribute` values.
 */
export function mergeGanttOpenState(
    previousTasks: GanttTask[],
    nextTasks: GanttTask[],
    gantt: GanttOpenStateReader
): GanttTask[] {
    const preserved = preserveBranchOpenState(previousTasks, nextTasks);

    return preserved.map(task => {
        if (!taskHasChildren(task.id, preserved)) {
            return task;
        }

        if (!gantt.isTaskExists(task.id) || !gantt.hasChild(task.id)) {
            return task;
        }

        const liveTask = gantt.getTask(task.id);

        // Live DHTMLX branch state wins over stale datasource `open` flags after refresh.
        if (liveTask.$open === true) {
            return { ...task, open: true };
        }

        if (liveTask.$open === false) {
            return { ...task, open: false };
        }

        return task;
    });
}
