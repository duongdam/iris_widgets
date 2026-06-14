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
import { useSelectionSync } from "../hooks/useSelectionSync";
import { useGanttContext } from "../providers/GanttProvider";
import { isDatasourceAvailable, mapMendixDatasourceToGanttTasks } from "../services/MendixTaskAdapter";
import type { GanttTask } from "../eventbus/eventTypes";
import type { Big } from "big.js";
import type { EditableValue } from "mendix";

function countDescendants(taskId: string, tasks: GanttTask[]): number {
    const children = tasks.filter(task => task.parent === taskId);
    return children.reduce((sum, child) => sum + 1 + countDescendants(child.id, tasks), 0);
}

function writeAddTaskContext(
    task: GanttTask,
    selectedTaskId?: EditableValue<string | Big>,
    selectedPayload?: EditableValue<string>
): void {
    if (selectedTaskId?.status === "available" && selectedTaskId.readOnly !== true) {
        selectedTaskId.setValue(task.id);
    }
    if (selectedPayload?.status === "available" && selectedPayload.readOnly !== true) {
        selectedPayload.setValue(JSON.stringify(task));
    }
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
    useSelectionSync(store, widgetProps.selectedTaskId, widgetProps.selectedPayload, bridge);

    const editingConfig = useMemo(
        () => ({
            allowCreate: widgetProps.allowCreate,
            allowUpdate: widgetProps.allowUpdate,
            allowDelete: widgetProps.allowDelete,
            allowDrag: widgetProps.allowDrag,
            allowResize: widgetProps.allowResize,
            readOnly: widgetProps.readOnly
        }),
        [
            widgetProps.allowCreate,
            widgetProps.allowUpdate,
            widgetProps.allowDelete,
            widgetProps.allowDrag,
            widgetProps.allowResize,
            widgetProps.readOnly
        ]
    );

    const handleAddTaskClick = useCallback(
        (taskId: string) => {
            const task = store.taskById.get(taskId);
            if (!task) {
                return;
            }

            writeAddTaskContext(task, widgetProps.selectedTaskId, widgetProps.selectedPayload);
            bridge.handleAddTaskRequested(task, countDescendants(taskId, store.tasks));
        },
        [bridge, store.taskById, store.tasks, widgetProps.selectedPayload, widgetProps.selectedTaskId]
    );

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
        bridge,
        onAddTaskClick: handleAddTaskClick
    });

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

    const hoveredTask = store.hoveredTaskId ? store.taskById.get(store.hoveredTaskId) : undefined;
    const showConfigError = !isPreview && !mappingValid;
    const showEmpty = !showConfigError && !store.loading && !store.hasTasks;
    const height = store.expandHeight ? "100vh" : widgetProps.height;

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
            style={{ height }}
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
                    style={{ display: showEmpty || showConfigError ? "none" : store.loading ? "none" : "block" }}
                />

                {hoveredTask && <GanttTooltip task={hoveredTask} pos={tooltipPos} containerRef={rootRef} />}
            </div>
        </div>
    );
});
