import { GanttOutgoingEvents, TimelineViewMode, type GanttEventBus, type GanttTask } from "../eventbus/eventTypes";

export interface MendixActionValue {
    canExecute?: boolean;
    isExecuting?: boolean;
    execute?: () => void;
}

export interface WidgetEventBridgeOptions {
    widgetId: string;
    eventBus: GanttEventBus;
    onTaskClick?: MendixActionValue;
    onTaskDoubleClick?: MendixActionValue;
    onTaskCreated?: MendixActionValue;
    onTaskUpdated?: MendixActionValue;
    onTaskDeleted?: MendixActionValue;
    onSelectionChanged?: MendixActionValue;
}

export interface WidgetEventBridge {
    handleTaskClick: (task: GanttTask) => void;
    handleTaskDoubleClick: (task: GanttTask) => void;
    handleSelectionChanged: (task?: GanttTask) => void;
    handleTaskCreated: (task: GanttTask) => void;
    handleTaskUpdated: (task: GanttTask) => void;
    handleTaskDeleted: (taskId: string) => void;
    handleViewChanged: (viewMode: TimelineViewMode) => void;
    handleFullscreenChanged: (fullscreen: boolean) => void;
    handleTimelineChanged: () => void;
}

function executeAction(action?: MendixActionValue): void {
    if (action?.canExecute && !action.isExecuting) {
        action.execute?.();
    }
}

export function createWidgetEventBridge(options: WidgetEventBridgeOptions): WidgetEventBridge {
    const {
        widgetId,
        eventBus,
        onTaskClick,
        onTaskDoubleClick,
        onTaskCreated,
        onTaskUpdated,
        onTaskDeleted,
        onSelectionChanged
    } = options;

    return {
        handleTaskClick(task: GanttTask): void {
            eventBus.emit({
                widgetId,
                type: GanttOutgoingEvents.TASK_CLICKED,
                data: { task }
            });
            executeAction(onTaskClick);
        },

        handleTaskDoubleClick(task: GanttTask): void {
            eventBus.emit({
                widgetId,
                type: GanttOutgoingEvents.TASK_DOUBLE_CLICKED,
                data: { task }
            });
            executeAction(onTaskDoubleClick);
        },

        handleSelectionChanged(task?: GanttTask): void {
            eventBus.emit({
                widgetId,
                type: GanttOutgoingEvents.TASK_SELECTED,
                data: { task }
            });
            executeAction(onSelectionChanged);
        },

        handleTaskCreated(task: GanttTask): void {
            eventBus.emit({
                widgetId,
                type: GanttOutgoingEvents.TASK_CREATED,
                data: { task }
            });
            executeAction(onTaskCreated);
        },

        handleTaskUpdated(task: GanttTask): void {
            eventBus.emit({
                widgetId,
                type: GanttOutgoingEvents.TASK_UPDATED,
                data: { task }
            });
            executeAction(onTaskUpdated);
        },

        handleTaskDeleted(taskId: string): void {
            eventBus.emit({
                widgetId,
                type: GanttOutgoingEvents.TASK_DELETED,
                data: { taskId }
            });
            executeAction(onTaskDeleted);
        },

        handleViewChanged(viewMode: TimelineViewMode): void {
            eventBus.emit({
                widgetId,
                type: GanttOutgoingEvents.VIEW_CHANGED,
                data: { viewMode }
            });
            eventBus.emit({
                widgetId,
                type: GanttOutgoingEvents.TIMELINE_CHANGED
            });
        },

        handleFullscreenChanged(fullscreen: boolean): void {
            eventBus.emit({
                widgetId,
                type: GanttOutgoingEvents.FULLSCREEN_CHANGED,
                data: { fullscreen }
            });
        },

        handleTimelineChanged(): void {
            eventBus.emit({
                widgetId,
                type: GanttOutgoingEvents.TIMELINE_CHANGED
            });
        }
    };
}
