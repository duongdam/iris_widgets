import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import type { AxGanttStore } from "../../stores/AxGanttStore";
import type { MendixActionBridge } from "../../shared/bridge/mendixActionBridge";
import { applyEditingConfig } from "../../gantt/ganttEditing";
import { updateLayout } from "../../gantt/ganttLayout";
import { bindGanttController, type GanttControllerHandle } from "../../gantt/ganttController";
import { gantt } from "../../gantt/ganttInstance";
import { expandToLevel } from "../components/TreeExpandManager";
import { applyMode, applyTimelineRange } from "../components/TimelineManager";
import { scheduleTodayMarkerRefresh, syncTodayMarker } from "../components/TodayMarker";
import { scheduleMtoMarkerRefresh } from "../components/MtoMarker";
import { applyGridReorderConfig } from "../../shared/utils/gridReorder";
import { syncTasks } from "../services/GanttSyncService";
import type { GanttEditingConfig } from "../../shared/types/editingConfig";
import { mergeGanttOpenState } from "../../shared/utils/preserveBranchOpenState";

export interface UseGanttInstanceOptions {
    store: AxGanttStore;
    containerRef: React.RefObject<HTMLDivElement>;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    editing: GanttEditingConfig;
    allowGridReorder?: boolean;
    actionBridge?: MendixActionBridge;
    customGanttConfig?: Record<string, unknown>;
    useDhtmlxTooltip?: boolean;
    onHoverTask?: (taskId: string | undefined) => void;
    onAddTaskClick?: (taskId: string) => void;
    onRefresh?: () => void;
}

interface GanttInstanceRuntime {
    initialized: boolean;
    controller: GanttControllerHandle | null;
    actionBridge?: MendixActionBridge;
    showTodayMarker: boolean;
    allowGridReorder: boolean;
    editing: GanttEditingConfig;
    onAddTaskClick?: (taskId: string) => void;
    onHoverTask?: (taskId: string | undefined) => void;
    teardownEditing: (() => void) | null;
    teardownGridReorder: (() => void) | null;
}

export function useGanttInstance(options: UseGanttInstanceOptions): void {
    const {
        store,
        containerRef,
        showGrid,
        showTimeline,
        showProgress,
        showTodayMarker,
        editing,
        allowGridReorder = true,
        actionBridge,
        customGanttConfig,
        useDhtmlxTooltip,
        onHoverTask,
        onAddTaskClick
    } = options;

    const runtimeRef = useRef<GanttInstanceRuntime>({
        initialized: false,
        controller: null,
        actionBridge,
        showTodayMarker,
        allowGridReorder,
        editing,
        onAddTaskClick,
        onHoverTask,
        teardownEditing: null,
        teardownGridReorder: null
    });

    const onAddTaskClickRef = useRef(onAddTaskClick);
    const onHoverTaskRef = useRef(onHoverTask);
    const actionBridgeRef = useRef(actionBridge);
    const customGanttConfigRef = useRef(customGanttConfig);

    onAddTaskClickRef.current = onAddTaskClick;
    onHoverTaskRef.current = onHoverTask;
    actionBridgeRef.current = actionBridge;
    customGanttConfigRef.current = customGanttConfig;
    runtimeRef.current.actionBridge = actionBridge;
    runtimeRef.current.showTodayMarker = showTodayMarker;
    runtimeRef.current.onAddTaskClick = onAddTaskClick;
    runtimeRef.current.onHoverTask = onHoverTask;
    runtimeRef.current.allowGridReorder = allowGridReorder;
    runtimeRef.current.editing = editing;

    useEffect(() => {
        const runtime = runtimeRef.current;
        const container = containerRef.current;
        if (!container || runtime.initialized) {
            return undefined;
        }

        runtime.initialized = true;
        runtime.controller = bindGanttController({
            store,
            container,
            display: {
                showGrid: store.showGrid,
                showTimeline: store.showTimeline,
                showProgress,
                showTodayMarker,
                viewMode: store.viewMode,
                taskCount: store.tasks.length,
                timelineStart: store.timelineStart,
                timelineEnd: store.timelineEnd,
                useDhtmlxTooltip,
                customConfig: customGanttConfigRef.current
            },
            editing,
            useDhtmlxTooltip,
            actionBridge: actionBridgeRef.current,
            onAddTaskClick: taskId => onAddTaskClickRef.current?.(taskId),
            onHoverTask: taskId => onHoverTaskRef.current?.(taskId),
            getShowTodayMarker: () => runtimeRef.current.showTodayMarker
        });

        return () => {
            runtime.controller?.teardown();
            runtime.controller = null;
            runtime.initialized = false;
        };
    }, [containerRef, store, showProgress, useDhtmlxTooltip]);

    useEffect(() => {
        const runtime = runtimeRef.current;
        if (!runtime.initialized) {
            return undefined;
        }

        runtime.teardownEditing?.();
        runtime.teardownEditing = applyEditingConfig(editing);

        return () => {
            runtime.teardownEditing?.();
            runtime.teardownEditing = null;
        };
    }, [editing]);

    useEffect(() => {
        const runtime = runtimeRef.current;
        if (!runtime.initialized) {
            return undefined;
        }

        const dispose = reaction(
            () => ({
                enabled: runtimeRef.current.allowGridReorder && store.gridReorderMode,
                readOnly: runtimeRef.current.editing.readOnly
            }),
            ({ enabled, readOnly }) => {
                runtime.teardownGridReorder?.();
                runtime.teardownGridReorder = applyGridReorderConfig(enabled, store, runtimeRef.current.actionBridge, gantt, {
                    readOnly
                });
            },
            { fireImmediately: true }
        );

        return () => {
            dispose();
            runtime.teardownGridReorder?.();
            runtime.teardownGridReorder = null;
        };
    }, [store]);

    useEffect(() => {
        if (!allowGridReorder && store.gridReorderMode) {
            store.setGridReorderMode(false);
        }
    }, [allowGridReorder, store]);

    useEffect(() => {
        const runtime = runtimeRef.current;
        const controller = runtime.controller;
        if (!runtime.initialized || !controller) {
            return;
        }

        const hadTasks = controller.state.previousTasks.length > 0;
        const tasksToSync = mergeGanttOpenState(controller.state.previousTasks, store.tasks, gantt);
        controller.state.previousTasks = syncTasks(controller.state.previousTasks, tasksToSync);

        if (!hadTasks && store.tasks.length > 0) {
            requestAnimationFrame(() => {
                scheduleTodayMarkerRefresh(gantt, runtimeRef.current.showTodayMarker);
            });
        } else {
            scheduleTodayMarkerRefresh(gantt, runtimeRef.current.showTodayMarker);
        }

        scheduleMtoMarkerRefresh(gantt);
    }, [store.tasks]);

    useEffect(() => {
        const runtime = runtimeRef.current;
        if (!runtime.initialized) {
            return undefined;
        }

        const dispose = reaction(
            () => store.expandLevel,
            level => {
                expandToLevel(gantt, level);
            }
        );

        return dispose;
    }, [store]);

    useEffect(() => {
        const runtime = runtimeRef.current;
        if (!runtime.initialized) {
            return;
        }

        applyMode(gantt, store.viewMode, store.timelineStart, store.timelineEnd);
        scheduleTodayMarkerRefresh(gantt, runtimeRef.current.showTodayMarker);
    }, [store.viewMode]);

    useEffect(() => {
        const runtime = runtimeRef.current;
        if (!runtime.initialized) {
            return;
        }

        applyTimelineRange(gantt, store.viewMode, store.timelineStart, store.timelineEnd);
        gantt.render();
        scheduleTodayMarkerRefresh(gantt, runtimeRef.current.showTodayMarker);
    }, [store.timelineStart, store.timelineEnd]);

    useEffect(() => {
        runtimeRef.current.showTodayMarker = showTodayMarker;

        const runtime = runtimeRef.current;
        if (!runtime.initialized) {
            return;
        }

        syncTodayMarker(gantt, showTodayMarker);
    }, [showTodayMarker]);

    useEffect(() => {
        const runtime = runtimeRef.current;
        if (!runtime.initialized) {
            return;
        }

        updateLayout({
            showGrid: store.showGrid,
            showTimeline: store.showTimeline
        });
    }, [store.showGrid, store.showTimeline]);

    useEffect(() => {
        const dispose = reaction(
            () => ({ grid: showGrid, timeline: showTimeline }),
            ({ grid, timeline }) => {
                store.setShowGrid(grid);
                store.setShowTimeline(timeline);
            }
        );

        return dispose;
    }, [store, showGrid, showTimeline]);
}
