import type { GanttTask } from "../../../main/eventbus/eventTypes";
import { sortTasksByOrderNo } from "../sortTasksByOrderNo";

function task(id: string, parent?: string, orderNo?: number): GanttTask {
    return { id, text: id, start_date: "2026-01-01", parent, orderNo };
}

describe("sortTasksByOrderNo", () => {
    it("returns input unchanged when no orderNo values exist", () => {
        const tasks = [task("1"), task("2", "1"), task("3", "1")];
        expect(sortTasksByOrderNo(tasks)).toBe(tasks);
    });

    it("sorts siblings by orderNo while preserving parent-child DFS order", () => {
        const tasks = [
            task("program"),
            task("phase-a", "program"),
            task("task-c", "phase-a", 30),
            task("task-a", "phase-a", 10),
            task("task-b", "phase-a", 20),
            task("phase-b", "program"),
            task("task-z", "phase-b", 5)
        ];

        expect(sortTasksByOrderNo(tasks).map(item => item.id)).toEqual([
            "program",
            "phase-a",
            "task-a",
            "task-b",
            "task-c",
            "phase-b",
            "task-z"
        ]);
    });

    it("keeps datasource order for siblings without orderNo", () => {
        const tasks = [task("1"), task("a", "1", 1), task("b", "1"), task("c", "1", 2)];

        expect(sortTasksByOrderNo(tasks).map(item => item.id)).toEqual(["1", "a", "c", "b"]);
    });
});
