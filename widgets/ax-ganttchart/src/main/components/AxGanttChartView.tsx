import { Empty } from "antd";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useRef, useState } from "react";
import type { AxGanttChartProps } from "../../typings/AxGanttChartProps";
import { GanttSkeleton } from "./GanttSkeleton";
import { GanttToolbar } from "./GanttToolbar";
import { GanttTooltip } from "./GanttTooltip";
import { useDatasourceSync } from "../hooks/useDatasourceSync";
import { useCommandSync } from "../hooks/useCommandSync";
import { useEventBusBridge } from "../hooks/useEventBusBridge";
import { useGanttInstance } from "../hooks/useGanttInstance";
import { useSelectionBridge } from "../hooks/useSelectionBridge";
import { useGanttContext } from "../providers/GanttProvider";
import { isDatasourceAvailable, mapMendixDatasourceToGanttTasks } from "../services/MendixTaskAdapter";
import { createGanttEditingConfig } from "../../shared/types/editingConfig";
import {
    resolveGanttContainerHeight,
    resolveGanttShellHeight
} from "./GanttConfiguration";
import type { GanttTask } from "../eventbus/eventTypes";

function countDescendants(taskId: string, tasks: GanttTask[]): number {
    const children = tasks.filter(task => task.parent === taskId);
    return children.reduce((sum, child) => sum + 1 + countDescendants(child.id, tasks), 0);
}

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

    const mappingValid = useDatasourceSync(store, widgetProps, !isPreview);
    useSelectionBridge(store, bridge);

    const editingConfig = useMemo(
        () =>
            createGanttEditingConfig({
                allowDrag: widgetProps.allowDrag,
                allowResize: widgetProps.allowResize,
                readOnly: widgetProps.readOnly
            }),
        [widgetProps.allowDrag, widgetProps.allowResize, widgetProps.readOnly]
    );

    const handleAddTaskClick = useCallback(
        (taskId: string) => {
            const task = store.taskById.get(taskId);
            if (!task) {
                return;
            }

            store.selectTask(task);
            bridge.handleAddTaskRequested(task, countDescendants(taskId, store.tasks));
        },
        [bridge, store]
    );

    const handleRefresh = useCallback(() => {
        if (isPreview || !isDatasourceAvailable(widgetProps.tasksDatasource) || !mappingValid) {
            return;
        }
        const mapped = mapMendixDatasourceToGanttTasks(widgetProps);
        store.setTasksIfChanged(mapped.tasks);
    }, [isPreview, mappingValid, store, widgetProps]);

    useEventBusBridge({
        store,
        eventBus,
        widgetId,
        bridge,
        containerRef: rootRef,
        exportServerUrl: widgetProps.exportServerUrl,
        onRefresh: handleRefresh
    });

    useCommandSync({
        command: widgetProps.command,
        commandPayload: widgetProps.commandPayload,
        eventBus,
        widgetId,
        enabled: !isPreview
    });

    useGanttInstance({
        store,
        containerRef,
        showGrid: widgetProps.showGrid,
        showTimeline: widgetProps.showTimeline,
        showProgress: widgetProps.showProgress,
        showTodayMarker: widgetProps.showTodayMarker,
        showCriticalPath: widgetProps.showCriticalPath,
        showBaseline: widgetProps.showBaseline,
        editing: editingConfig,
        allowGridReorder: widgetProps.allowGridReorder,
        bridge,
        onAddTaskClick: handleAddTaskClick
    });

    const hoveredTask = store.hoveredTaskId ? store.taskById.get(store.hoveredTaskId) : undefined;
    const showConfigError = !isPreview && !mappingValid;
    const showEmpty = !showConfigError && !store.loading && !store.hasTasks;
    const shellHeight = resolveGanttShellHeight(widgetProps.height, store.expandHeight);
    const ganttContainerHeight = resolveGanttContainerHeight(
        widgetProps.height,
        store.expandHeight,
        widgetProps.showToolbar
    );
    const hideGantt = showEmpty || showConfigError;

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
                "ax-ganttchart--fullscreen": store.fullscreen,
                "ax-ganttchart--expand-height": store.expandHeight
            })}
            style={{ height: shellHeight }}
        >
            {widgetProps.showToolbar && <GanttToolbar />}

            <div className="ax-ganttchart__body" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                {store.loading && <GanttSkeleton />}

                {showConfigError && (
                    <div className="ax-ganttchart__empty">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Gantt configuration incomplete. Check id, text, start date, and end date or duration mappings."
                        />
                    </div>
                )}

                {showEmpty && (
                    <div className="ax-ganttchart__empty">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tasks to display" />
                    </div>
                )}

                <div
                    ref={containerRef}
                    className="ax-ganttchart__gantt"
                    style={{
                        height: ganttContainerHeight,
                        minHeight:
                            typeof ganttContainerHeight === "number" ? ganttContainerHeight : undefined,
                        display: hideGantt ? "none" : "block",
                        visibility: store.loading ? "hidden" : "visible"
                    }}
                />

                {hoveredTask && <GanttTooltip task={hoveredTask} pos={tooltipPos} containerRef={rootRef} />}
            </div>
        </div>
    );
});
