import { GanttCommand, ganttCommandToEvent, parseGanttCommandEnum } from "../GanttCommand";
import { GanttIncomingEvents } from "../../../main/eventbus/eventTypes";

describe("GanttCommand", () => {
    it("parses command names case-insensitively with spaces and dashes", () => {
        expect(parseGanttCommandEnum("enter_fullscreen")).toBe(GanttCommand.ENTER_FULLSCREEN);
        expect(parseGanttCommandEnum("  exit-fullscreen  ")).toBe(GanttCommand.EXIT_FULLSCREEN);
        expect(parseGanttCommandEnum("zoom week")).toBe(GanttCommand.ZOOM_WEEK);
    });

    it("returns undefined for unsupported commands", () => {
        expect(parseGanttCommandEnum("NOT_A_COMMAND")).toBeUndefined();
        expect(parseGanttCommandEnum("")).toBeUndefined();
    });

    it("maps commands to incoming event bus types", () => {
        expect(ganttCommandToEvent(GanttCommand.ENTER_FULLSCREEN)).toBe(GanttIncomingEvents.ENTER_FULLSCREEN);
        expect(ganttCommandToEvent(GanttCommand.REFRESH)).toBe(GanttIncomingEvents.REFRESH);
        expect(ganttCommandToEvent(GanttCommand.SCROLL_TO_TASK)).toBe(GanttIncomingEvents.SCROLL_TO_TASK);
    });
});
