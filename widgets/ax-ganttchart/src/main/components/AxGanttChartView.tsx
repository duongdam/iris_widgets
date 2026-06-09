import { Empty } from "antd";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useCallback, useRef, useState } from "react";
import type { AxGanttChartProps } from "../../typings/AxGanttChartProps";
import { GanttSkeleton } from "./GanttSkeleton";
import { GanttToolbar } from "./GanttToolbar";
import { GanttTooltip } from "./GanttTooltip";
import { useDatasourceSync } from "../hooks/useDatasourceSync";
import { useEventBusBridge } from "../hooks/useEventBusBridge";
import { useGanttInstance } from "../hooks/useGanttInstance";
import { useSelectionSync } from "../hooks/useSelectionSync";
import { useGanttContext } from "../providers/GanttProvider";
import { isDatasourceAvailable, mapMendixDatasourceToGanttTasks } from "../services/MendixTaskAdapter";

export interface AxGanttChartViewProps {
    widgetProps: AxGanttChartProps;
}

interface TooltipPos {
    x: number;
    y: number;
}

export const AxGanttChartView = observer(function AxGanttChartView({
    widgetProps
}: AxGanttChartViewProps): JSX.Element {
    const { store, eventBus, bridge, widgetId, isPreview } = useGanttContext();
    const containerRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);

    const [tooltipPos, setTooltipPos] = useState<TooltipPos>({ x: 0, y: 0 });

    useDatasourceSync(store, widgetProps, !isPreview);
    useSelectionSync(store, widgetProps.selectedTaskId, widgetProps.selectedPayload, bridge);

    useGanttInstance({
        store,
        containerRef,
        showGrid: widgetProps.showGrid,
        showTimeline: widgetProps.showTimeline,
        showProgress: widgetProps.showProgress,
        showTodayMarker: widgetProps.showTodayMarker,
        bridge
    });

    const handleRefresh = useCallback(() => {
        if (isPreview || !isDatasourceAvailable(widgetProps.tasksDatasource)) {
            return;
        }
        const mapped = mapMendixDatasourceToGanttTasks(widgetProps);
        store.setTasksIfChanged(mapped.tasks);
    }, [isPreview, store, widgetProps]);

    useEventBusBridge({
        store,
        eventBus,
        widgetId,
        bridge,
        containerRef: rootRef,
        exportServerUrl: widgetProps.exportServerUrl,
        onRefresh: handleRefresh
    });

    const hoveredTask = store.hoveredTaskId ? store.taskById.get(store.hoveredTaskId) : undefined;
    const showEmpty = !store.loading && !store.hasTasks;
    const height = widgetProps.height;

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>): void {
        setTooltipPos({ x: e.clientX, y: e.clientY });
    }

    function handleMouseLeave(): void {
        store.setHoveredTaskId(undefined);
    }

    return (
        <div
            ref={rootRef}
            className={classNames("ax-ganttchart", widgetProps.class, {
                "ax-ganttchart--fullscreen": store.fullscreen
            })}
            style={{ height }}
        >
            {/* Toolbar */}
            {widgetProps.showToolbar && <GanttToolbar />}

            <div
                className="ax-ganttchart__body"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Shimmer skeleton while loading */}
                {store.loading && <GanttSkeleton />}

                {/* Empty state */}
                {showEmpty && (
                    <div className="ax-ganttchart__empty">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No tasks to display"
                        />
                    </div>
                )}

                {/* DHTMLX Gantt container */}
                <div
                    ref={containerRef}
                    className="ax-ganttchart__gantt"
                    style={{ display: showEmpty && !store.loading ? "none" : "block" }}
                />

                {/* Rich hover tooltip */}
                {hoveredTask && (
                    <GanttTooltip
                        task={hoveredTask}
                        pos={tooltipPos}
                        containerRef={rootRef}
                    />
                )}
            </div>
        </div>
    );
});
