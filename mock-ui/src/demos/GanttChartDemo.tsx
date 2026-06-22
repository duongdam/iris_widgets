import { JSX, useMemo, useRef } from "react";
import { AxGanttInner } from "../../../widgets/ax-ganttchart/src/AxGanttInner";
import { AxGanttChartView } from "../../../widgets/ax-ganttchart/src/main/AxGanttChartView";
import type { AxGanttTask } from "../../../widgets/ax-ganttchart/src/shared/types/axGanttTask";
import type { GanttConfigPropertyKey } from "../../../widgets/ax-ganttchart/src/shared/constants/ganttConfig";
import type { AxGanttChartProps } from "../../../widgets/ax-ganttchart/src/typings/AxGanttChartProps";
import { GanttEventMonitor, type GanttBusEventLogEntry } from "../components/GanttEventMonitor";
import { GanttLifecycleMonitor } from "../components/GanttLifecycleMonitor";
import {
    createMockDynamicBoolean,
    createMockDynamicHeight,
    createMockDynamicString,
    type useMockGanttActions
} from "../mocks/ganttActionMocks";
import { createMockGanttDatasource } from "../mocks/ganttListValue";
import "../../../widgets/ax-ganttchart/src/styles/gantt.scss";

export type GanttViewMode = "day" | "week" | "month";

export interface GanttChartDemoProps {
    tasks: AxGanttTask[];
    height: number;
    defaultViewMode: GanttViewMode;
    showToolbar: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    allowDrag: boolean;
    allowResize: boolean;
    allowGridReorder: boolean;
    readOnly: boolean;
    actionProps: ReturnType<typeof useMockGanttActions>["actionProps"];
    onBusEvent?: (entry: GanttBusEventLogEntry) => void;
    /** Override any DHTMLX gantt.config property — merged after Ax defaults. */
    customGanttConfig?: Partial<Record<GanttConfigPropertyKey, unknown>>;
    /** Use DHTMLX built-in tooltip instead of the React overlay. */
    useDhtmlxTooltip?: boolean;
    actionPropsVersion?: number;
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
    allowDrag,
    allowResize,
    allowGridReorder,
    readOnly,
    actionProps,
    onBusEvent,
    customGanttConfig,
    useDhtmlxTooltip,
    actionPropsVersion = 0
}: GanttChartDemoProps): JSX.Element {
    const rootRef = useRef<HTMLDivElement>(null);
    const parentRenderCountRef = useRef(0);
    parentRenderCountRef.current += 1;
    const datasourceProps = useMemo(() => createMockGanttDatasource(tasks), [tasks]);

    const widgetProps = useMemo<AxGanttChartProps>(
        () => ({
            name: "mock-ganttchart",
            class: "mock-gantt",
            height: createMockDynamicHeight(height),
            defaultViewMode: createMockDynamicString(defaultViewMode),
            showToolbar,
            showGrid,
            showTimeline,
            showProgress,
            showTodayMarker,
            allowDrag: createMockDynamicBoolean(allowDrag),
            allowResize: createMockDynamicBoolean(allowResize),
            allowGridReorder: createMockDynamicBoolean(allowGridReorder),
            readOnly: createMockDynamicBoolean(readOnly),
            ...datasourceProps,
            ...actionProps
        }),
        [
            height,
            defaultViewMode,
            showToolbar,
            showGrid,
            showTimeline,
            showProgress,
            showTodayMarker,
            allowDrag,
            allowResize,
            allowGridReorder,
            readOnly,
            datasourceProps,
            actionProps
        ]
    );

    return (
        <AxGanttInner
            widgetProps={widgetProps}
            containerRef={rootRef}
            customGanttConfig={customGanttConfig}
            useDhtmlxTooltip={useDhtmlxTooltip}
        >
            <GanttEventMonitor widgetId={widgetProps.name} onBusEvent={onBusEvent} />
            <div className="mock-ui-gantt-chart-wrap">
                <GanttLifecycleMonitor
                    parentRenderCount={parentRenderCountRef.current}
                    actionPropsVersion={actionPropsVersion}
                />
                <AxGanttChartView widgetProps={widgetProps} rootRef={rootRef} />
            </div>
        </AxGanttInner>
    );
}
