import { createGanttEventBus } from "../GanttEventBus";
import { GanttIncomingEvents, GanttOutgoingEvents } from "../eventTypes";

describe("GanttEventBus", () => {
    it("delivers emitted events to subscribers", () => {
        const bus = createGanttEventBus();
        const handler = jest.fn();
        bus.on(GanttOutgoingEvents.TASK_CLICKED, handler);

        bus.emit({
            widgetId: "gantt-1",
            type: GanttOutgoingEvents.TASK_CLICKED,
            data: { task: { id: "1", text: "A", start_date: "2026-01-01" } },
        });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].widgetId).toBe("gantt-1");
    });

    it("unsubscribes with returned cleanup function", () => {
        const bus = createGanttEventBus();
        const handler = jest.fn();
        const unsubscribe = bus.on(GanttIncomingEvents.REFRESH, handler);

        unsubscribe();
        bus.emit({ widgetId: "gantt-1", type: GanttIncomingEvents.REFRESH });

        expect(handler).not.toHaveBeenCalled();
    });

    it("runs once handlers only one time", () => {
        const bus = createGanttEventBus();
        const handler = jest.fn();
        bus.once(GanttIncomingEvents.ENTER_FULLSCREEN, handler);

        bus.emit({ widgetId: "gantt-1", type: GanttIncomingEvents.ENTER_FULLSCREEN });
        bus.emit({ widgetId: "gantt-1", type: GanttIncomingEvents.ENTER_FULLSCREEN });

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("clear removes all handlers", () => {
        const bus = createGanttEventBus();
        const handler = jest.fn();
        bus.on(GanttIncomingEvents.EXIT_FULLSCREEN, handler);

        bus.clear();
        bus.emit({ widgetId: "gantt-1", type: GanttIncomingEvents.EXIT_FULLSCREEN });

        expect(handler).not.toHaveBeenCalled();
    });
});
