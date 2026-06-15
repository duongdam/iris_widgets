import { TimelineViewMode } from "../../main/eventbus/eventTypes";
import { createGanttStore } from "../GanttStore";
import { sampleTask } from "../../__tests__/testUtils";

describe("GanttStore", () => {
    it("indexes tasks by id", () => {
        const store = createGanttStore();
        store.setTasks([
            sampleTask,
            { ...sampleTask, id: "task-2", text: "Phase B", parent: "task-1" },
        ]);

        expect(store.taskById.get("task-1")).toEqual(sampleTask);
        expect(store.taskById.get("task-2")?.text).toBe("Phase B");
        expect(store.hasTasks).toBe(true);
    });

    it("tracks selected task", () => {
        const store = createGanttStore();
        store.selectTask(sampleTask);

        expect(store.selectedTask).toEqual(sampleTask);
    });

    it("setTasksIfChanged avoids unnecessary updates", () => {
        const store = createGanttStore();
        store.setTasks([sampleTask]);

        store.setTasksIfChanged([sampleTask]);
        expect(store.tasks).toHaveLength(1);

        store.setTasksIfChanged([{ ...sampleTask, text: "Updated" }]);
        expect(store.tasks[0].text).toBe("Updated");
    });

    it("filters root tasks without parent", () => {
        const store = createGanttStore();
        store.setTasks([
            { id: "root", text: "Program", start_date: "2026-01-01" },
            { id: "child", text: "Phase", start_date: "2026-02-01", parent: "root" },
        ]);

        expect(store.rootTasks).toHaveLength(1);
        expect(store.rootTasks[0].id).toBe("root");
    });

    it("updates view mode and fullscreen flags", () => {
        const store = createGanttStore(TimelineViewMode.DAY);

        expect(store.viewMode).toBe(TimelineViewMode.DAY);

        store.setViewMode(TimelineViewMode.MONTH);
        store.setFullscreen(true);
        store.toggleExpandHeight();

        expect(store.viewMode).toBe(TimelineViewMode.MONTH);
        expect(store.fullscreen).toBe(true);
        expect(store.expandHeight).toBe(true);
    });
});
