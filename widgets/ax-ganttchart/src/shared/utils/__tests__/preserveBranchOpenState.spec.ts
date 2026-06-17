import type { GanttTask } from "../../../main/eventbus/eventTypes";
import { mergeGanttOpenState, preserveBranchOpenState } from "../preserveBranchOpenState";

describe("preserveBranchOpenState", () => {
    const current: GanttTask[] = [
        { id: "1", text: "Program", open: true, start_date: "2026-01-01" },
        { id: "2", text: "Phase", parent: "1", start_date: "2026-02-01" }
    ];

    it("keeps datasource open=true", () => {
        const incoming: GanttTask[] = [
            { id: "1", text: "Program", open: true, start_date: "2026-01-01" },
            { id: "2", text: "Phase", parent: "1", start_date: "2026-02-01" }
        ];

        expect(preserveBranchOpenState(current, incoming)[0].open).toBe(true);
    });

    it("preserves previous open when datasource omits open", () => {
        const incoming: GanttTask[] = [
            { id: "1", text: "Program", start_date: "2026-01-01" },
            { id: "2", text: "Phase", parent: "1", start_date: "2026-02-01" }
        ];

        expect(preserveBranchOpenState(current, incoming)[0].open).toBe(true);
    });

    it("respects datasource open=false", () => {
        const incoming: GanttTask[] = [
            { id: "1", text: "Program", open: false, start_date: "2026-01-01" },
            { id: "2", text: "Phase", parent: "1", start_date: "2026-02-01" }
        ];

        expect(preserveBranchOpenState(current, incoming)[0].open).toBe(false);
    });
});

describe("mergeGanttOpenState", () => {
    it("uses live gantt open state when datasource omits open", () => {
        const previous: GanttTask[] = [{ id: "1", text: "Program", start_date: "2026-01-01" }];
        const next: GanttTask[] = [
            { id: "1", text: "Program", start_date: "2026-01-01" },
            { id: "2", text: "Phase", parent: "1", start_date: "2026-02-01" }
        ];

        const gantt = {
            isTaskExists: (id: string) => id === "1",
            hasChild: (id: string) => id === "1",
            getTask: () => ({ $open: true })
        };

        expect(mergeGanttOpenState(previous, next, gantt)[0].open).toBe(true);
    });

    it("prefers live gantt open state over stale datasource open=false", () => {
        const previous: GanttTask[] = [{ id: "1", text: "Program", open: true, start_date: "2026-01-01" }];
        const next: GanttTask[] = [
            { id: "1", text: "Program", open: false, start_date: "2026-01-01" },
            { id: "2", text: "Phase", parent: "1", start_date: "2026-02-01" }
        ];

        const gantt = {
            isTaskExists: (id: string) => id === "1",
            hasChild: (id: string) => id === "1",
            getTask: () => ({ $open: true })
        };

        expect(mergeGanttOpenState(previous, next, gantt)[0].open).toBe(true);
    });
});
