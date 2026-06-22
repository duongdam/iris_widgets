import type { GanttTask } from "../../events/eventTypes";

function normalizeParentId(parent: string | undefined): string | undefined {
    if (!parent || parent === "0") {
        return undefined;
    }

    return parent;
}

function compareSiblingOrder(a: GanttTask, b: GanttTask, originalIndex: Map<string, number>): number {
    const orderA = a.orderNo;
    const orderB = b.orderNo;

    if (orderA != null && orderB != null && orderA !== orderB) {
        return orderA - orderB;
    }

    if (orderA != null && orderB == null) {
        return -1;
    }

    if (orderA == null && orderB != null) {
        return 1;
    }

    return (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0);
}

/**
 * Order tasks for DHTMLX parse: siblings under the same parent are sorted by `orderNo`.
 * Tasks without `orderNo` keep their datasource order relative to each other.
 */
export function sortTasksByOrderNo(tasks: GanttTask[]): GanttTask[] {
    if (tasks.length <= 1) {
        return tasks;
    }

    if (!tasks.some(task => task.orderNo != null)) {
        return tasks;
    }

    const originalIndex = new Map(tasks.map((task, index) => [task.id, index]));
    const childrenByParent = new Map<string | undefined, GanttTask[]>();

    for (const task of tasks) {
        const parent = normalizeParentId(task.parent);
        const siblings = childrenByParent.get(parent) ?? [];
        siblings.push(task);
        childrenByParent.set(parent, siblings);
    }

    for (const siblings of childrenByParent.values()) {
        siblings.sort((left, right) => compareSiblingOrder(left, right, originalIndex));
    }

    const ordered: GanttTask[] = [];

    const visit = (parent: string | undefined): void => {
        const siblings = childrenByParent.get(parent) ?? [];
        for (const task of siblings) {
            ordered.push(task);
            visit(task.id);
        }
    };

    visit(undefined);

    return ordered.length === tasks.length ? ordered : tasks;
}
