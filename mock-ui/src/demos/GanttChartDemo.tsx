import { JSX, useEffect, useMemo } from "react";
import { AxGanttChartView } from "../../../widgets/ax-ganttchart/src/main/components/AxGanttChartView";
import type { GanttEventPayload } from "../../../widgets/ax-ganttchart/src/main/eventbus/eventTypes";
import {
    GanttProvider,
    useGanttContext,
    type GanttContextValue,
} from "../../../widgets/ax-ganttchart/src/main/providers/GanttProvider";
import { ThemeProvider } from "../../../widgets/ax-ganttchart/src/main/providers/ThemeProvider";
import type { AxGanttChartProps, TimelineViewModeEnum } from "../../../widgets/ax-ganttchart/src/typings/AxGanttChartProps";
import type { GanttTask } from "../../../widgets/ax-ganttchart/src/main/eventbus/eventTypes";
import { GanttEventMonitor } from "../components/GanttEventMonitor";
import { createMockGanttDatasource } from "../mocks/ganttListValue";
import "../../../widgets/ax-ganttchart/src/styles/gantt.scss";

export interface GanttChartDemoProps {
    tasks: GanttTask[];
    height: number;
    defaultViewMode: TimelineViewModeEnum;
    showToolbar: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    showCriticalPath: boolean;
    showBaseline: boolean;
    allowDrag: boolean;
    allowResize: boolean;
    allowGridReorder: boolean;
    readOnly: boolean;
    onGanttEvent?: (payload: GanttEventPayload) => void;
    onContextReady?: (context: GanttContextValue) => void;
}

function GanttContextExporter({
    onContextReady,
}: {
    onContextReady?: (context: GanttContextValue) => void;
}): JSX.Element | null {
    const context = useGanttContext();

    useEffect(() => {
        onContextReady?.(context);
    }, [context, onContextReady]);

    return null;
}

function GanttChartEventMonitor({
    onGanttEvent,
}: {
    onGanttEvent?: (payload: GanttEventPayload) => void;
}): JSX.Element | null {
    const { eventBus } = useGanttContext();
    return <GanttEventMonitor eventBus={eventBus} onGanttEvent={onGanttEvent} />;
}

export function GanttChartDemo({
    tasks,
    height,
    defaultViewMode,
    showToolbar,
    showGrid,
    showTimeline,
    showProgress,
    showTodayMarker,
    showCriticalPath,
    showBaseline,
    allowDrag,
    allowResize,
    allowGridReorder,
    readOnly,
    onGanttEvent,
    onContextReady,
}: GanttChartDemoProps): JSX.Element {
    const datasourceProps = useMemo(() => createMockGanttDatasource(tasks), [tasks]);

    const widgetProps = useMemo<AxGanttChartProps>(
        () => ({
            name: "mock-ganttchart",
            class: "mock-gantt",
            height,
            defaultViewMode,
            showToolbar,
            showGrid,
            showTimeline,
            showProgress,
            showTodayMarker,
            showCriticalPath,
            showBaseline,
            allowDrag,
            allowResize,
            allowGridReorder,
            readOnly,
            ...datasourceProps,
        }),
        [
            height,
            defaultViewMode,
            showToolbar,
            showGrid,
            showTimeline,
            showProgress,
            showTodayMarker,
            showCriticalPath,
            showBaseline,
            allowDrag,
            allowResize,
            allowGridReorder,
            readOnly,
            datasourceProps,
        ]
    );

    return (
        <ThemeProvider>
            <GanttProvider widgetProps={widgetProps}>
                <GanttContextExporter onContextReady={onContextReady} />
                <GanttChartEventMonitor onGanttEvent={onGanttEvent} />
                <AxGanttChartView widgetProps={widgetProps} />
            </GanttProvider>
        </ThemeProvider>
    );
}
