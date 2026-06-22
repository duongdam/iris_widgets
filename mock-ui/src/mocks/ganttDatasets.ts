import type { AxGanttTask } from "../../../widgets/ax-ganttchart/src/shared/types/axGanttTask";
import { GANTT_TEST_TASKS } from "../../../widgets/ax-ganttchart/src/shared/mock/ganttTestData";

export interface GanttDataset {
    id: string;
    label: string;
    description: string;
    tasks: AxGanttTask[];
}

function generateLargeMockTasks(count: number): AxGanttTask[] {
    if (count <= GANTT_TEST_TASKS.length) {
        return GANTT_TEST_TASKS.slice(0, count);
    }

    const tasks: AxGanttTask[] = [...GANTT_TEST_TASKS];
    const scheduledParents = GANTT_TEST_TASKS.filter(task => task.type === "TASK" || task.type === "SUB_TASK");

    for (let index = tasks.length; index < count; index += 1) {
        const parent = scheduledParents[index % Math.max(scheduledParents.length, 1)]?.parent;
        tasks.push({
            id: `GEN-${index}`,
            text: `Generated task ${index}`,
            type: "TASK",
            parent,
            start_date: "2026-01-01",
            end_date: "2026-06-30",
            order: index,
            customOrder: index
        });
    }

    return tasks;
}

export const GANTT_DATASETS: GanttDataset[] = [
    {
        id: "default",
        label: "gantt-test.json (198 items)",
        description: "Normalized roadmap hierarchy with DISTRICT_GROUP, CUSTOM_GROUP, TASK, SUB_TASK.",
        tasks: GANTT_TEST_TASKS
    },
    {
        id: "medium",
        label: "Medium load (100 tasks)",
        description: "Performance smoke test for scrolling and smart rendering.",
        tasks: generateLargeMockTasks(100)
    },
    {
        id: "large",
        label: "Large load (500 tasks)",
        description: "Stress test for silent parse and viewport rendering.",
        tasks: generateLargeMockTasks(500)
    }
];

export function getGanttDataset(id: string): GanttDataset {
    return GANTT_DATASETS.find(dataset => dataset.id === id) ?? GANTT_DATASETS[0];
}
