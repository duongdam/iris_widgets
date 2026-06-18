import type { GanttTask } from "../../../main/eventbus/eventTypes";
import { ensureTaskTimingForGantt, prepareTasksForGanttSync } from "../ganttTaskTiming";

describe("ensureTaskTimingForGantt", () => {
    it("rejects tasks with invalid start_date", () => {
        expect(ensureTaskTimingForGantt({ id: "1", text: "Bad", start_date: "" })).toBeNull();
    });

    it("fills milestone end_date when duration is zero", () => {
        const task: GanttTask = {
            id: "m1",
            text: "Milestone",
            type: "milestone",
            start_date: "2026-06-30 00:00",
            duration: 0
        };

        expect(ensureTaskTimingForGantt(task)).toEqual({
            ...task,
            end_date: "2026-06-30 00:00",
            duration: 0
        });
    });

    it("keeps tasks with duration", () => {
        const task: GanttTask = {
            id: "1",
            text: "Task",
            start_date: "2026-01-01 00:00",
            duration: 5
        };

        expect(ensureTaskTimingForGantt(task)).toEqual(task);
    });
});

describe("prepareTasksForGanttSync", () => {
    it("filters invalid tasks", () => {
        const tasks: GanttTask[] = [
            { id: "1", text: "Good", start_date: "2026-01-01 00:00", end_date: "2026-01-05 00:00" },
            { id: "2", text: "Bad", start_date: "" }
        ];

        expect(prepareTasksForGanttSync(tasks)).toHaveLength(1);
        expect(prepareTasksForGanttSync(tasks)[0].id).toBe("1");
    });
});
