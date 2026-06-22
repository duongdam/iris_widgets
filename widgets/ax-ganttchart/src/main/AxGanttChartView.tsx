import { Empty } from "antd";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useRef, useState } from "react";
import type { AxGanttChartProps } from "../typings/AxGanttChartProps";
import { readDynamicBoolean, readWidgetHeight } from "../typings/AxGanttChartProps";
import { GanttSkeleton } from "./components/GanttSkeleton";
import { GanttToolbar } from "./components/GanttToolbar";
import { GanttTooltip } from "./components/GanttTooltip";
import { useDatasourceSync } from "./hooks/useDatasourceSync";
import { useGanttInstance } from "./hooks/useGanttInstance";
import { useAxGanttContext } from "../AxGanttInner";
import { isDatasourceAvailable, mapMendixDatasourceToGanttTasks } from "./services/MendixTaskAdapter";
import { createGanttEditingConfig } from "../shared/types/editingConfig";
import { resolveGanttContainerHeight, resolveGanttShellHeight } from "./components/GanttConfiguration";

export interface AxGanttChartViewProps {
    widgetProps: AxGanttChartProps;
    rootRef: React.RefObject<HTMLDivElement>;
}

interface TooltipPos {
    x: number;
    y: number;
}

export const AxGanttChartView = observer(function AxGanttChartView({
    widgetProps,
    rootRef
}: AxGanttChartViewProps): JSX.Element {
    const { store, actionBridge, isPreview, customGanttConfig, useDhtmlxTooltip } = useAxGanttContext();
    const containerRef = useRef<HTMLDivElement>(null);

    const [tooltipPos, setTooltipPos] = useState<TooltipPos>({ x: 0, y: 0 });
    const showReactTooltip = !useDhtmlxTooltip;

    const mappingValid = useDatasourceSync(store, widgetProps, !isPreview);

    const allowDrag = readDynamicBoolean(widgetProps.allowDrag, true);
    const allowResize = readDynamicBoolean(widgetProps.allowResize, false);
    const readOnly = readDynamicBoolean(widgetProps.readOnly, false);
    const allowGridReorder = readDynamicBoolean(widgetProps.allowGridReorder, true);
    const widgetHeight = readWidgetHeight(widgetProps, 600);

    const editingConfig = useMemo(
        () =>
            createGanttEditingConfig({
                allowDrag,
                allowResize,
                readOnly
            }),
        [allowDrag, allowResize, readOnly]
    );

    const handleAddTaskClick = useCallback(
        (taskId: string) => {
            const task = store.getTask(taskId);
            if (!task) {
                return;
            }

            store.selectTask(task);
            actionBridge.fireAdded(task);
        },
        [actionBridge, store]
    );

    const handleRefresh = useCallback(() => {
        if (isPreview || !isDatasourceAvailable(widgetProps.roadmapItems) || !mappingValid) {
            return;
        }
        const mapped = mapMendixDatasourceToGanttTasks(widgetProps);
        store.setTasksIfChanged(mapped.tasks);
    }, [isPreview, mappingValid, store, widgetProps]);

    useGanttInstance({
        store,
        containerRef,
        showGrid: widgetProps.showGrid,
        showTimeline: widgetProps.showTimeline,
        showProgress: widgetProps.showProgress,
        showTodayMarker: widgetProps.showTodayMarker,
        editing: editingConfig,
        allowGridReorder,
        actionBridge,
        customGanttConfig,
        useDhtmlxTooltip,
        onAddTaskClick: handleAddTaskClick,
        onRefresh: handleRefresh
    });

    const hoveredTask = store.hoveredTaskId ? store.getTask(store.hoveredTaskId) : undefined;
    const showConfigError = !isPreview && !mappingValid;
    const showEmpty = !showConfigError && !store.loading && !store.hasTasks;
    const shellHeight = resolveGanttShellHeight(widgetHeight, store.expandHeight);
    const ganttContainerHeight = resolveGanttContainerHeight(
        widgetHeight,
        store.expandHeight,
        widgetProps.showToolbar
    );
    const hideGantt = showEmpty || showConfigError;

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (showReactTooltip) {
                setTooltipPos({ x: e.clientX, y: e.clientY });
            }
        },
        [showReactTooltip]
    );

    const handleMouseLeave = useCallback(() => {
        if (showReactTooltip) {
            store.setHoveredTaskId(undefined);
        }
    }, [showReactTooltip, store]);

    const ganttContainerStyle = useMemo(
        () => ({
            height: ganttContainerHeight,
            minHeight: typeof ganttContainerHeight === "number" ? ganttContainerHeight : undefined,
            display: hideGantt ? ("none" as const) : ("block" as const),
            visibility: store.loading ? ("hidden" as const) : ("visible" as const)
        }),
        [ganttContainerHeight, hideGantt, store.loading]
    );

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
                            description="Gantt configuration incomplete. Check itemId, text, type, and parentId mappings."
                        />
                    </div>
                )}

                {showEmpty && (
                    <div className="ax-ganttchart__empty">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tasks to display" />
                    </div>
                )}

                <div ref={containerRef} className="ax-ganttchart__gantt" style={ganttContainerStyle} />

                {showReactTooltip && hoveredTask && (
                    <GanttTooltip task={hoveredTask} pos={tooltipPos} containerRef={rootRef} />
                )}
            </div>
        </div>
    );
});
