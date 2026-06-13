import type { GanttStatic } from "dhtmlx-gantt";

interface GanttBranchTask {
    id: string | number;
    $level?: number;
}

/** Deepest expand step: each click reveals one more branch level. */
export function getMaxExpandableLevel(gantt: GanttStatic): number {
    let max = 0;

    gantt.eachTask((task: GanttBranchTask) => {
        if (gantt.hasChild(task.id)) {
            max = Math.max(max, (task.$level ?? 0) + 1);
        }
    });

    return max;
}

export function collapseAllBranches(gantt: GanttStatic): void {
    gantt.eachTask((task: GanttBranchTask) => {
        if (gantt.hasChild(task.id)) {
            gantt.close(task.id);
        }
    });
}

/** Open branches up to `level` deep (0 = fully collapsed). */
export function expandToLevel(gantt: GanttStatic, level: number): void {
    gantt.eachTask((task: GanttBranchTask) => {
        if (!gantt.hasChild(task.id)) {
            return;
        }

        const taskLevel = task.$level ?? 0;

        if (taskLevel < level) {
            gantt.open(task.id);
        } else {
            gantt.close(task.id);
        }
    });
}

export function expandNextLevel(gantt: GanttStatic, currentLevel: number): number {
    const maxLevel = getMaxExpandableLevel(gantt);
    const nextLevel = Math.min(currentLevel + 1, maxLevel);

    if (nextLevel > currentLevel) {
        expandToLevel(gantt, nextLevel);
    }

    return nextLevel;
}
