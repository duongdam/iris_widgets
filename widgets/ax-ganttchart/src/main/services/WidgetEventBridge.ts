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
}

export interface WidgetEventBridge {
    handleTaskClick: (task: GanttTask) => void;
    handleTaskDoubleClick: (task: GanttTask) => void;
    handleTaskCreated: (task: GanttTask) => void;
    handleTaskUpdated: (task: GanttTask) => void;
    handleTaskDeleted: (taskId: string) => void;
    handleAddTaskRequested: (task: GanttTask, childCount: number) => void;
}

function executeAction(action?: MendixActionValue): void {
    if (action?.canExecute && !action.isExecuting) {
        action.execute?.();
    }
}

export function createWidgetEventBridge(options: WidgetEventBridgeOptions): WidgetEventBridge {
    const { widgetId, eventBus, onEvent } = options;

    function emitOutgoing(type: GanttOutgoingEvents, data?: unknown): void {
        const payload: GanttEventPayload = { widgetId, type, data };
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

        handleTaskCreated(task: GanttTask): void {
            emitOutgoing(GanttOutgoingEvents.TASK_CREATED, { task });
        },

        handleTaskUpdated(task: GanttTask): void {
            emitOutgoing(GanttOutgoingEvents.TASK_UPDATED, { task });
        },

        handleTaskDeleted(taskId: string): void {
            emitOutgoing(GanttOutgoingEvents.TASK_DELETED, { taskId });
        },

        handleAddTaskRequested(task: GanttTask, childCount: number): void {
            emitOutgoing(GanttOutgoingEvents.TASK_REQUEST_ADD, { task, level: 1, childCount });
        }
    };
}
