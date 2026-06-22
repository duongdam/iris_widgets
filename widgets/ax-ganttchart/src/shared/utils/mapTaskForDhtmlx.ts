import { isGroupType, normalizeTaskType, type AxGanttTask } from "../types/axGanttTask";

export function mapTaskForDhtmlx(task: AxGanttTask): Record<string, unknown> {
    const type = normalizeTaskType(task.type);
    const unscheduled = task.unscheduled ?? isGroupType(type);

    const mapped: Record<string, unknown> = {
        ...task,
        type,
        unscheduled
    };

    if (unscheduled) {
        delete mapped.start_date;
        delete mapped.end_date;
        delete mapped.duration;
    }

    return mapped;
}

export function mapTasksForDhtmlx(tasks: AxGanttTask[]): Record<string, unknown>[] {
    return tasks.map(mapTaskForDhtmlx);
}
