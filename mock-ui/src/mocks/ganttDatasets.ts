import type { GanttTask } from "../../../widgets/ax-ganttchart/src/main/eventbus/eventTypes";
import {
    generateLargeMockTasks,
    MOCK_GANTT_TASKS,
} from "../../../widgets/ax-ganttchart/src/preview/previewConfig";

export interface GanttDataset {
    id: string;
    label: string;
    description: string;
    tasks: GanttTask[];
}

export const GANTT_DATASETS: GanttDataset[] = [
    {
        id: "default",
        label: "Enterprise rollout (3-level, 21 tasks)",
        description: "Program → Phase → Task. MTO ±10 months from milestone; K/O +20 months.",
        tasks: MOCK_GANTT_TASKS,
    },
    {
        id: "medium",
        label: "Medium load (100 tasks)",
        description: "Performance smoke test for scrolling and smart rendering.",
        tasks: generateLargeMockTasks(100),
    },
    {
        id: "large",
        label: "Large load (500 tasks)",
        description: "Stress test for silent parse and viewport rendering.",
        tasks: generateLargeMockTasks(500),
    },
];

export function getGanttDataset(id: string): GanttDataset {
    return GANTT_DATASETS.find(dataset => dataset.id === id) ?? GANTT_DATASETS[0];
}
