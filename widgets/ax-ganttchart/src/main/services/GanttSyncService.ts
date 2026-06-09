import { gantt } from "../components/GanttConfiguration";
import type { GanttTask } from "../eventbus/eventTypes";

function tasksEqual(a: GanttTask, b: GanttTask): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function syncTasks(currentTasks: GanttTask[], nextTasks: GanttTask[]): void {
    if (nextTasks.length === 0) {
        gantt.clearAll();
        gantt.render();
        return;
    }

    const currentIds = new Set(currentTasks.map(task => task.id));
    const nextIds = new Set(nextTasks.map(task => task.id));
    const isBulkChange =
        currentTasks.length === 0 ||
        nextTasks.length / Math.max(currentTasks.length, 1) > 0.5 ||
        [...nextIds].filter(id => !currentIds.has(id)).length > nextTasks.length * 0.3;

    if (isBulkChange) {
        gantt.silent(() => {
            gantt.clearAll();
            gantt.parse({ data: nextTasks as never, links: [] });
        });
        gantt.render();
        return;
    }

    gantt.batchUpdate(() => {
        for (const id of currentIds) {
            if (!nextIds.has(id)) {
                gantt.deleteTask(id);
            }
        }

        for (const task of nextTasks) {
            if (!currentIds.has(task.id)) {
                gantt.addTask(task as never);
                continue;
            }

            const existing = currentTasks.find(item => item.id === task.id);
            if (existing && !tasksEqual(existing, task)) {
                gantt.updateTask(task.id, task as never);
            }
        }
    });
}
