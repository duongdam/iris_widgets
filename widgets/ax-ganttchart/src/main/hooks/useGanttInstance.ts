import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import type { GanttStore } from "../../stores/GanttStore";
import {
    applyEditingConfig,
    attachAddButtonDelegation,
    attachNativeEvents,
    enablePlugins,
    gantt,
    initGantt,
    installGanttLayoutSync,
    resetGantt,
    setupTodayMarkerSync,
    setupMtoMarkerSync,
    updateLayout
} from "../components/GanttConfiguration";
import { expandToLevel } from "../components/TreeExpandManager";
import { applyMode, applyTimelineRange, scrollToToday } from "../components/TimelineManager";
import { scheduleTodayMarkerRefresh, syncTodayMarker } from "../components/TodayMarker";
import { scheduleMtoMarkerRefresh } from "../components/MtoMarker";
import { applyGridReorderConfig } from "../../shared/utils/gridReorder";
import type { GanttTask } from "../eventbus/eventTypes";
import type { WidgetEventBridge } from "../services/WidgetEventBridge";
import { syncTasks } from "../services/GanttSyncService";
import type { GanttEditingConfig } from "../../shared/types/editingConfig";
import { mergeGanttOpenState } from "../../shared/utils/preserveBranchOpenState";

export interface UseGanttInstanceOptions {
    store: GanttStore;
    containerRef: React.RefObject<HTMLDivElement>;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    showCriticalPath: boolean;
    showBaseline: boolean;
    editing: GanttEditingConfig;
    allowGridReorder?: boolean;
    bridge?: WidgetEventBridge;
    onHoverTask?: (taskId: string | undefined) => void;
    onAddTaskClick?: (taskId: string) => void;
}

interface GanttInstanceRuntime {
    initialized: boolean;
    previousTasks: GanttTask[];
    bridge?: WidgetEventBridge;
    showTodayMarker: boolean;
    allowGridReorder: boolean;
    editing: GanttEditingConfig;
    onAddTaskClick?: (taskId: string) => void;
    teardownTodayMarker: (() => void) | null;
    teardownMtoMarker: (() => void) | null;
    teardownGridReorder: (() => void) | null;
    teardownEditing: (() => void) | null;
    teardownAddButton: (() => void) | null;
    teardownLayout: (() => void) | null;
}

let previousHoverRow: HTMLElement | null = null;
let previousHoverCells: HTMLElement[] = [];

function clearCrossHighlight(): void {
    previousHoverRow?.classList.remove("gantt-cross-hover-row");
    for (const cell of previousHoverCells) {
        cell.classList.remove("gantt-cross-hover-col");
    }
    previousHoverRow = null;
    previousHoverCells = [];
}

function applyCrossHighlight(taskId: string): void {
    clearCrossHighlight();

    const row = document.querySelector(`[task_id="${taskId}"]`) as HTMLElement | null;
    if (row) {
        row.classList.add("gantt-cross-hover-row");
        previousHoverRow = row;
    }

    const cells = Array.from(
        document.querySelectorAll(`.gantt_task_row[task_id="${taskId}"] .gantt_task_cell`)
    ) as HTMLElement[];

    for (const cell of cells) {
        cell.classList.add("gantt-cross-hover-col");
    }
    previousHoverCells = cells;
}

function scheduleFocusOnToday(showMarker: boolean): void {
    requestAnimationFrame(() => {
        scrollToToday(gantt);
        scheduleTodayMarkerRefresh(gantt, showMarker);
    });
}

function createRuntimeState(options: UseGanttInstanceOptions): GanttInstanceRuntime {
    return {
        initialized: false,
        previousTasks: [],
        bridge: options.bridge,
        showTodayMarker: options.showTodayMarker,
        allowGridReorder: options.allowGridReorder ?? true,
        editing: options.editing,
        onAddTaskClick: options.onAddTaskClick,
        teardownTodayMarker: null,
        teardownMtoMarker: null,
        teardownGridReorder: null,
        teardownEditing: null,
        teardownAddButton: null,
        teardownLayout: null
    };
}

export function useGanttInstance(options: UseGanttInstanceOptions): void {
    const {
        store,
        containerRef,
        showGrid,
        showTimeline,
        showProgress,
        showTodayMarker,
        showCriticalPath,
        showBaseline,
        editing,
        allowGridReorder = true,
        bridge,
        onHoverTask,
        onAddTaskClick
    } = options;

    const runtimeRef = useRef<GanttInstanceRuntime>(createRuntimeState(options));

    runtimeRef.current.bridge = bridge;
    runtimeRef.current.showTodayMarker = showTodayMarker;
    runtimeRef.current.onAddTaskClick = onAddTaskClick;
    runtimeRef.current.allowGridReorder = allowGridReorder;
    runtimeRef.current.editing = editing;

    useEffect(() => {
        const runtime = runtimeRef.current;
        const container = containerRef.current;
        if (!container || runtime.initialized) {
            return undefined;
        }

        runtime.initialized = true;
        enablePlugins();

        initGantt(container, {
            showGrid: store.showGrid,
            showTimeline: store.showTimeline,
            showProgress,
            showTodayMarker,
            viewMode: store.viewMode,
            taskCount: store.tasks.length,
            timelineStart: store.timelineStart,
            timelineEnd: store.timelineEnd,
            appearance: { showCriticalPath, showBaseline }
        });
        runtime.teardownLayout = installGanttLayoutSync(container);

        runtime.teardownTodayMarker = setupTodayMarkerSync(() => runtimeRef.current.showTodayMarker);
        runtime.teardownMtoMarker = setupMtoMarkerSync();
        runtime.teardownEditing = applyEditingConfig(editing);

        const detachEvents = attachNativeEvents({
            onTaskClick: (id: string) => {
                const task = store.taskById.get(id);
                if (task) {
                    store.selectTask(task);
                    runtimeRef.current.bridge?.handleTaskClick(task);
                }
            },
            onTaskDblClick: (id: string) => {
                const task = store.taskById.get(id);
                if (task) {
                    store.selectTask(task);
                    runtimeRef.current.bridge?.handleTaskDoubleClick(task);
                }
            },
            onAfterTaskAdd: (_id: string, task: GanttTask) => {
                runtimeRef.current.bridge?.handleTaskCreated(task);
            },
            onAfterTaskUpdate: (_id: string, task: GanttTask) => {
                runtimeRef.current.bridge?.handleTaskUpdated(task);
            },
            onAfterTaskDelete: (id: string) => {
                runtimeRef.current.bridge?.handleTaskDeleted(id);
            },
            onMouseMove: (id: string) => {
                store.setHoveredTaskId(id);
                onHoverTask?.(id);
                applyCrossHighlight(id);
            }
        });

        runtime.teardownAddButton = attachAddButtonDelegation(container, (taskId, event) => {
            event.stopPropagation();
            runtimeRef.current.onAddTaskClick?.(taskId);
        });

        if (store.tasks.length > 0) {
            syncTasks([], store.tasks);
            runtime.previousTasks = store.tasks;
        }

        scheduleFocusOnToday(runtimeRef.current.showTodayMarker);

        return () => {
            runtime.teardownTodayMarker?.();
            runtime.teardownTodayMarker = null;
            runtime.teardownMtoMarker?.();
            runtime.teardownMtoMarker = null;
            runtime.teardownGridReorder?.();
            runtime.teardownGridReorder = null;
            runtime.teardownEditing?.();
            runtime.teardownEditing = null;
            runtime.teardownAddButton?.();
            runtime.teardownAddButton = null;
            runtime.teardownLayout?.();
            runtime.teardownLayout = null;
            detachEvents();
            clearCrossHighlight();
            resetGantt();
            runtime.initialized = false;
        };
    }, [
        containerRef,
        showProgress,
        showCriticalPath,
        showBaseline,
        store.viewMode,
        store.showGrid,
        store.showTimeline,
        onHoverTask
    ]);

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
                runtime.teardownGridReorder = applyGridReorderConfig(
                    enabled,
                    store,
                    runtimeRef.current.bridge,
                    gantt,
                    { readOnly }
                );
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
        if (!runtime.initialized) {
            return;
        }

        const hadTasks = runtime.previousTasks.length > 0;
        const tasksToSync = mergeGanttOpenState(runtime.previousTasks, store.tasks, gantt);
        syncTasks(runtime.previousTasks, tasksToSync);
        runtime.previousTasks = tasksToSync;

        if (store.expandLevel > 0) {
            expandToLevel(gantt, store.expandLevel);
        }

        if (!hadTasks && store.tasks.length > 0) {
            scheduleFocusOnToday(runtimeRef.current.showTodayMarker);
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
