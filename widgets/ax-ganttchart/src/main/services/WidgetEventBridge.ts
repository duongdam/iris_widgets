import type { EditableValue } from "mendix";
import {
    GanttOutgoingEvents,
    type GanttEventBus,
    type GanttEventPayload,
    type GanttTask
} from "../eventbus/eventTypes";
import { notifyGanttOutgoingEvent, recordGanttOutgoingEvent } from "./GanttCommandRegistry";

export interface MendixActionValue {
    canExecute?: boolean;
    isExecuting?: boolean;
    execute?: () => void;
}

export interface WidgetEventBridgeOptions {
    widgetId: string;
    eventBus: GanttEventBus;
    onEvent?: MendixActionValue;
    /** Widget writes the outgoing event name here before calling onEvent. */
    eventType?: EditableValue<string>;
    /** Widget writes JSON-serialised GanttEventPayload here before calling onEvent. */
    eventPayload?: EditableValue<string>;
}

export interface WidgetEventBridge {
    handleTaskClick: (task: GanttTask) => void;
    handleTaskDoubleClick: (task: GanttTask) => void;
    handleAddTaskRequested: (task: GanttTask, childCount: number) => void;
    handleTaskUpdated: (task: GanttTask, changeType?: "move" | "resize" | "progress") => void;
    handleTaskReordered: (task: GanttTask, newParentId: string, newOrderNo: number) => void;
    handleTaskCreated: (task: GanttTask) => void;
    handleTaskDeleted: (taskId: string) => void;
    handleViewChanged: (viewMode: string) => void;
    handleFullscreenChanged: (fullscreen: boolean) => void;
}

function executeAction(action?: MendixActionValue): void {
    if (action?.canExecute && !action.isExecuting) {
        action.execute?.();
    }
}

export function createWidgetEventBridge(options: WidgetEventBridgeOptions): WidgetEventBridge {
    const { widgetId, eventBus, onEvent, eventType: eventTypeAttr, eventPayload: eventPayloadAttr } = options;

    function emitOutgoing(type: GanttOutgoingEvents, data?: unknown): void {
        const payload: GanttEventPayload = { widgetId, type, data };

        // Write to Mendix attributes first so nanoflow can read them synchronously.
        eventTypeAttr?.setValue(type);
        eventPayloadAttr?.setValue(JSON.stringify(payload));

        recordGanttOutgoingEvent(payload);
        eventBus.emit(payload);
        notifyGanttOutgoingEvent(payload);
        executeAction(onEvent);
    }

    return {
        handleTaskClick(task: GanttTask): void {
            emitOutgoing(GanttOutgoingEvents.TASK_CLICKED, { task });
        },

        handleTaskDoubleClick(task: GanttTask): void {
            emitOutgoing(GanttOutgoingEvents.TASK_DOUBLE_CLICKED, { task });
        },

        handleAddTaskRequested(task: GanttTask, childCount: number): void {
            emitOutgoing(GanttOutgoingEvents.ADD_TASK_REQUESTED, { task, level: 1, childCount });
        },

        handleTaskUpdated(task: GanttTask, changeType?: "move" | "resize" | "progress"): void {
            emitOutgoing(GanttOutgoingEvents.TASK_UPDATED, { task, changeType });
        },

        handleTaskReordered(task: GanttTask, newParentId: string, newOrderNo: number): void {
            emitOutgoing(GanttOutgoingEvents.TASK_REORDERED, { task, newParentId, newOrderNo });
        },

        handleTaskCreated(task: GanttTask): void {
            emitOutgoing(GanttOutgoingEvents.TASK_CREATED, { task });
        },

        handleTaskDeleted(taskId: string): void {
            emitOutgoing(GanttOutgoingEvents.TASK_DELETED, { taskId });
        },

        handleViewChanged(viewMode: string): void {
            emitOutgoing(GanttOutgoingEvents.VIEW_CHANGED, { viewMode });
        },

        handleFullscreenChanged(fullscreen: boolean): void {
            emitOutgoing(GanttOutgoingEvents.FULLSCREEN_CHANGED, { fullscreen });
        }
    };
}
