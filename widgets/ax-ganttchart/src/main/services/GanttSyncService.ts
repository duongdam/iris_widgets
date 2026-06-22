import { gantt } from "../components/GanttConfiguration";
import type { GanttTask } from "../../events/eventTypes";
import { parseGanttDate } from "../../shared/utils/mtoDate";
import { prepareTasksForGanttSync } from "../../shared/utils/ganttTaskTiming";
import { mapTaskForDhtmlx } from "../../shared/utils/mapTaskForDhtmlx";

function cloneTaskFields(task: GanttTask): GanttTask {
    return {
        ...task,
        metadata: task.metadata ? { ...task.metadata } : undefined
    };
}

function toDhtmlxPayload(task: GanttTask, includeOpen: boolean): Record<string, unknown> | null {
    if (task.unscheduled) {
        const payload = mapTaskForDhtmlx(task);
        if (includeOpen && task.open != null) {
            payload.open = task.open;
        }
        return payload;
    }

    const start = parseGanttDate(task.start_date);
    if (!start) {
        return mapTaskForDhtmlx({ ...task, unscheduled: true });
    }

    const { open, start_date: _start, end_date: _end, ...rest } = task;
    const payload: Record<string, unknown> = {
        ...rest,
        start_date: start
    };

    if (task.end_date != null) {
        const end = parseGanttDate(task.end_date);
        if (!end) {
            return null;
        }
        payload.end_date = end;
    }

    if (includeOpen && open != null) {
        payload.open = open;
    }

    return payload;
}

function branchDescendantsHaveInvalidTiming(taskId: string): boolean {
    let invalid = false;

    gantt.eachTask((task: GanttTask) => {
        if (!task.unscheduled && !parseGanttDate(task.start_date)) {
            invalid = true;
        }
    }, taskId);

    return invalid;
}

function applyBranchOpenState(tasks: GanttTask[]): void {
    gantt.silent(() => {
        for (const task of tasks) {
            if (task.open == null || !gantt.isTaskExists(task.id) || !gantt.hasChild(task.id)) {
                continue;
            }

            if (task.open && branchDescendantsHaveInvalidTiming(task.id)) {
                continue;
            }

            const live = gantt.getTask(task.id) as { $open?: boolean };

            if (task.open && !live.$open) {
                gantt.open(task.id);
            } else if (task.open === false && live.$open) {
                gantt.close(task.id);
            }
        }
    });
}

export function syncTasks(currentTasks: GanttTask[], nextTasks: GanttTask[]): GanttTask[] {
    const preparedNextTasks = prepareTasksForGanttSync(nextTasks);

    if (preparedNextTasks.length === 0) {
        gantt.clearAll();
        gantt.render();
        return [];
    }

    const currentIds = new Set(currentTasks.map(task => task.id));
    const nextIds = new Set(preparedNextTasks.map(task => task.id));

    const sameIdSet =
        currentIds.size === nextIds.size && [...currentIds].every(id => nextIds.has(id));
    const structuralChangeCount = [...nextIds].filter(id => !currentIds.has(id)).length;

    const isBulkChange =
        currentTasks.length === 0 ||
        (!sameIdSet && structuralChangeCount > preparedNextTasks.length * 0.3);

    if (isBulkChange) {
        const payloads = preparedNextTasks
            .map(task => toDhtmlxPayload(task, true))
            .filter((task): task is Record<string, unknown> => task != null);

        gantt.silent(() => {
            gantt.clearAll();
            gantt.parse({ data: payloads as never, links: [] });
        });
        gantt.render();
        return preparedNextTasks.map(cloneTaskFields);
    }

    gantt.silent(() => {
        gantt.batchUpdate(() => {
            for (const id of currentIds) {
                if (!nextIds.has(id)) {
                    gantt.deleteTask(id);
                }
            }

            for (const task of preparedNextTasks) {
                const payload = toDhtmlxPayload(task, false);
                if (!payload) {
                    continue;
                }

                if (!currentIds.has(task.id)) {
                    gantt.addTask(payload as never);
                    continue;
                }

                const existing = currentTasks.find(item => item.id === task.id);
                if (!existing) {
                    continue;
                }

                const { open: _openA, ...restA } = existing;
                const { open: _openB, ...restB } = task;
                if (JSON.stringify(restA) !== JSON.stringify(restB)) {
                    gantt.updateTask(task.id, payload as never);
                }
            }
        });

        applyBranchOpenState(preparedNextTasks);
    });

    return preparedNextTasks.map(cloneTaskFields);
}
