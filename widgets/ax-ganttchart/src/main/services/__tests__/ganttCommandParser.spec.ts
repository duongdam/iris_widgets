import { GanttCommand } from "../../../shared/commands/GanttCommand";
import { GanttIncomingEvents } from "../../eventbus/eventTypes";
import { parseGanttCommand, parseGanttCommandType } from "../ganttCommandParser";

describe("ganttCommandParser", () => {
    it("parses simple commands without payload", () => {
        const parsed = parseGanttCommand("ENTER_FULLSCREEN");

        expect(parsed).toEqual({
            type: GanttIncomingEvents.ENTER_FULLSCREEN,
            command: GanttCommand.ENTER_FULLSCREEN,
            data: undefined,
        });
    });

    it("parses SCROLL_TO_TASK with JSON payload", () => {
        const parsed = parseGanttCommand("SCROLL_TO_TASK", JSON.stringify({ taskId: "task-42" }));

        expect(parsed).toEqual({
            type: GanttIncomingEvents.SCROLL_TO_TASK,
            command: GanttCommand.SCROLL_TO_TASK,
            data: { taskId: "task-42" },
        });
    });

    it("parses SCROLL_TO_TASK with plain string payload", () => {
        const parsed = parseGanttCommand("SCROLL_TO_TASK", "task-99");

        expect(parsed?.data).toEqual({ taskId: "task-99" });
    });

    it("parses SET_START_DATE with ISO date payload", () => {
        const parsed = parseGanttCommand("SET_START_DATE", JSON.stringify({ date: "2026-06-01" }));

        expect(parsed?.type).toBe(GanttIncomingEvents.SET_START_DATE);
        expect(parsed?.data).toEqual({ date: "2026-06-01" });
    });

    it("returns undefined and warns for unsupported commands", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

        expect(parseGanttCommand("UNKNOWN")).toBeUndefined();
        expect(warnSpy).toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it("parseGanttCommandType returns event type only", () => {
        expect(parseGanttCommandType("exit_fullscreen")).toBe(GanttIncomingEvents.EXIT_FULLSCREEN);
        expect(parseGanttCommandType("bad")).toBeUndefined();
    });
});
