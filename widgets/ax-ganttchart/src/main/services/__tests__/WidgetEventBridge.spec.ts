import { createGanttEventBus } from "../../eventbus/GanttEventBus";
import { GanttOutgoingEvents } from "../../eventbus/eventTypes";
import { createWidgetEventBridge } from "../WidgetEventBridge";
import { sampleTask } from "../../../__tests__/testUtils";

describe("createWidgetEventBridge", () => {
    const widgetId = "gantt-main";

    function createBridge(actionOverrides: Record<string, jest.Mock> = {}) {
        const eventBus = createGanttEventBus();
        const emitted: Array<{ type: string; data?: unknown }> = [];
        const unsubscribe = eventBus.on(GanttOutgoingEvents.TASK_CLICKED, payload => {
            emitted.push({ type: payload.type, data: payload.data });
        });
        eventBus.on(GanttOutgoingEvents.TASK_DOUBLE_CLICKED, payload => {
            emitted.push({ type: payload.type, data: payload.data });
        });
        eventBus.on(GanttOutgoingEvents.ADD_TASK_REQUESTED, payload => {
            emitted.push({ type: payload.type, data: payload.data });
        });
        eventBus.on(GanttOutgoingEvents.TASK_SELECTED, payload => {
            emitted.push({ type: payload.type, data: payload.data });
        });

        const bridge = createWidgetEventBridge({
            widgetId,
            eventBus,
            onTaskClick: { canExecute: true, isExecuting: false, execute: actionOverrides.onTaskClick },
            onTaskDoubleClick: { canExecute: true, isExecuting: false, execute: actionOverrides.onTaskDoubleClick },
            onAddTask: { canExecute: true, isExecuting: false, execute: actionOverrides.onAddTask },
            onSelectionChanged: { canExecute: true, isExecuting: false, execute: actionOverrides.onSelectionChanged },
        });

        return { bridge, emitted, cleanup: unsubscribe };
    }

    it("emits TASK_CLICKED and executes onTaskClick when allowed", () => {
        const onTaskClick = jest.fn();
        const { bridge, emitted } = createBridge({ onTaskClick });

        bridge.handleTaskClick(sampleTask);

        expect(emitted).toContainEqual({
            type: GanttOutgoingEvents.TASK_CLICKED,
            data: { task: sampleTask },
        });
        expect(onTaskClick).toHaveBeenCalledTimes(1);
    });

    it("emits TASK_DOUBLE_CLICKED and executes onTaskDoubleClick", () => {
        const onTaskDoubleClick = jest.fn();
        const { bridge, emitted } = createBridge({ onTaskDoubleClick });

        bridge.handleTaskDoubleClick(sampleTask);

        expect(emitted).toContainEqual({
            type: GanttOutgoingEvents.TASK_DOUBLE_CLICKED,
            data: { task: sampleTask },
        });
        expect(onTaskDoubleClick).toHaveBeenCalledTimes(1);
    });

    it("emits ADD_TASK_REQUESTED with child count and executes onAddTask", () => {
        const onAddTask = jest.fn();
        const { bridge, emitted } = createBridge({ onAddTask });

        bridge.handleAddTaskRequested(sampleTask, 3);

        expect(emitted).toContainEqual({
            type: GanttOutgoingEvents.ADD_TASK_REQUESTED,
            data: { task: sampleTask, level: 1, childCount: 3 },
        });
        expect(onAddTask).toHaveBeenCalledTimes(1);
    });

    it("does not execute action when canExecute is false", () => {
        const onTaskClick = jest.fn();
        const eventBus = createGanttEventBus();
        const bridge = createWidgetEventBridge({
            widgetId,
            eventBus,
            onTaskClick: { canExecute: false, isExecuting: false, execute: onTaskClick },
        });

        bridge.handleTaskClick(sampleTask);

        expect(onTaskClick).not.toHaveBeenCalled();
    });

    it("does not execute action when isExecuting is true", () => {
        const onTaskClick = jest.fn();
        const eventBus = createGanttEventBus();
        const bridge = createWidgetEventBridge({
            widgetId,
            eventBus,
            onTaskClick: { canExecute: true, isExecuting: true, execute: onTaskClick },
        });

        bridge.handleTaskClick(sampleTask);

        expect(onTaskClick).not.toHaveBeenCalled();
    });
});
