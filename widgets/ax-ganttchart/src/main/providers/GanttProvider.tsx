import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createGanttEventBus } from "../eventbus/GanttEventBus";
import type { GanttEventBus } from "../eventbus/eventTypes";
import { TimelineViewMode } from "../eventbus/eventTypes";
import { createWidgetEventBridge, type WidgetEventBridge } from "../services/WidgetEventBridge";
import { createGanttStore, type GanttStore } from "../../stores/GanttStore";
import type { AxGanttChartProps } from "../../typings/AxGanttChartProps";
import { parseViewMode } from "../components/TimelineManager";
import type { GanttTask } from "../eventbus/eventTypes";

export interface GanttContextValue {
    store: GanttStore;
    eventBus: GanttEventBus;
    bridge: WidgetEventBridge;
    widgetId: string;
    isPreview: boolean;
}

const GanttContext = createContext<GanttContextValue | null>(null);

export interface GanttProviderProps {
    children: ReactNode;
    widgetProps: AxGanttChartProps;
    previewTasks?: GanttTask[];
}

export function GanttProvider({ children, widgetProps, previewTasks }: GanttProviderProps): JSX.Element {
    const value = useMemo<GanttContextValue>(() => {
        const viewMode = parseViewMode(widgetProps.defaultViewMode) as TimelineViewMode;
        const store = createGanttStore(viewMode);
        const eventBus = createGanttEventBus();
        const widgetId = widgetProps.name;
        const isPreview = previewTasks != null;

        if (previewTasks) {
            store.setTasks(previewTasks);
        }

        const bridge = createWidgetEventBridge({
            widgetId,
            eventBus,
            onTaskClick: widgetProps.onTaskClick,
            onTaskDoubleClick: widgetProps.onTaskDoubleClick,
            onTaskCreated: widgetProps.onTaskCreated,
            onTaskUpdated: widgetProps.onTaskUpdated,
            onTaskDeleted: widgetProps.onTaskDeleted,
            onSelectionChanged: widgetProps.onSelectionChanged,
            onAddTask: widgetProps.onAddTask
        });

        return { store, eventBus, bridge, widgetId, isPreview };
    }, [
        widgetProps.name,
        widgetProps.defaultViewMode,
        widgetProps.onTaskClick,
        widgetProps.onTaskDoubleClick,
        widgetProps.onTaskCreated,
        widgetProps.onTaskUpdated,
        widgetProps.onTaskDeleted,
        widgetProps.onSelectionChanged,
        widgetProps.onAddTask,
        previewTasks
    ]);

    return <GanttContext.Provider value={value}>{children}</GanttContext.Provider>;
}

export function useGanttContext(): GanttContextValue {
    const context = useContext(GanttContext);
    if (!context) {
        throw new Error("useGanttContext must be used within GanttProvider");
    }
    return context;
}
