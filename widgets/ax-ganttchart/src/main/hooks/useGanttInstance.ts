import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import type { GanttStore } from "../../stores/GanttStore";
import {
    applyEditingConfig,
    attachNativeEvents,
    enablePlugins,
    gantt,
    initGantt,
    resetGantt,
    setupTodayMarkerSync,
    updateLayout
} from "../components/GanttConfiguration";
import { applyMode, applyTimelineRange, scrollToToday } from "../components/TimelineManager";
import { scheduleTodayMarkerRefresh, syncTodayMarker } from "../components/todayMarker";
import type { GanttTask } from "../eventbus/eventTypes";
import type { WidgetEventBridge } from "../services/WidgetEventBridge";
import { syncTasks } from "../services/GanttSyncService";
import type { GanttEditingConfig } from "../../shared/types/editingConfig";

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
    bridge?: WidgetEventBridge;
    onHoverTask?: (taskId: string | undefined) => void;
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
        bridge,
        onHoverTask
    } = options;

    const initializedRef = useRef(false);
    const previousTasksRef = useRef<GanttTask[]>([]);
    const bridgeRef = useRef(bridge);
    const showTodayMarkerRef = useRef(showTodayMarker);
    const teardownTodayMarkerRef = useRef<(() => void) | null>(null);
    const teardownEditingRef = useRef<(() => void) | null>(null);
    bridgeRef.current = bridge;
    showTodayMarkerRef.current = showTodayMarker;

    useEffect(() => {
        const container = containerRef.current;
        if (!container || initializedRef.current) {
            return undefined;
        }

        initializedRef.current = true;
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

        teardownTodayMarkerRef.current = setupTodayMarkerSync(() => showTodayMarkerRef.current);
        teardownEditingRef.current = applyEditingConfig(editing);

        const detachEvents = attachNativeEvents({
            onTaskClick: (id: string) => {
                const task = store.taskById.get(id);
                if (task) {
                    store.selectTask(task);
                    bridgeRef.current?.handleTaskClick(task);
                    bridgeRef.current?.handleSelectionChanged(task);
                }
            },
            onTaskDblClick: (id: string) => {
                const task = store.taskById.get(id);
                if (task) {
                    bridgeRef.current?.handleTaskDoubleClick(task);
                }
            },
            onAfterTaskAdd: (_id: string, task: GanttTask) => {
                bridgeRef.current?.handleTaskCreated(task);
            },
            onAfterTaskUpdate: (_id: string, task: GanttTask) => {
                bridgeRef.current?.handleTaskUpdated(task);
            },
            onAfterTaskDelete: (id: string) => {
                bridgeRef.current?.handleTaskDeleted(id);
            },
            onMouseMove: (id: string) => {
                store.setHoveredTaskId(id);
                onHoverTask?.(id);
                applyCrossHighlight(id);
            }
        });

        if (store.tasks.length > 0) {
            syncTasks([], store.tasks);
            previousTasksRef.current = store.tasks;
        }

        scheduleFocusOnToday(showTodayMarkerRef.current);

        return () => {
            teardownTodayMarkerRef.current?.();
            teardownTodayMarkerRef.current = null;
            teardownEditingRef.current?.();
            teardownEditingRef.current = null;
            detachEvents();
            clearCrossHighlight();
            resetGantt();
            initializedRef.current = false;
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
        if (!initializedRef.current) {
            return undefined;
        }

        teardownEditingRef.current?.();
        teardownEditingRef.current = applyEditingConfig(editing);

        return () => {
            teardownEditingRef.current?.();
            teardownEditingRef.current = null;
        };
    }, [editing]);

    useEffect(() => {
        if (!initializedRef.current) {
            return;
        }

        const hadTasks = previousTasksRef.current.length > 0;
        syncTasks(previousTasksRef.current, store.tasks);
        previousTasksRef.current = store.tasks;

        if (!hadTasks && store.tasks.length > 0) {
            scheduleFocusOnToday(showTodayMarkerRef.current);
        } else {
            scheduleTodayMarkerRefresh(gantt, showTodayMarkerRef.current);
        }
    }, [store.tasks]);

    useEffect(() => {
        if (!initializedRef.current) {
            return;
        }

        applyMode(gantt, store.viewMode, store.timelineStart, store.timelineEnd);
        scheduleTodayMarkerRefresh(gantt, showTodayMarkerRef.current);
        bridgeRef.current?.handleViewChanged(store.viewMode);
    }, [store.viewMode]);

    useEffect(() => {
        if (!initializedRef.current) {
            return;
        }

        applyTimelineRange(gantt, store.viewMode, store.timelineStart, store.timelineEnd);
        gantt.render();
        scheduleTodayMarkerRefresh(gantt, showTodayMarkerRef.current);
    }, [store.timelineStart, store.timelineEnd]);

    useEffect(() => {
        showTodayMarkerRef.current = showTodayMarker;

        if (!initializedRef.current) {
            return;
        }

        syncTodayMarker(gantt, showTodayMarker);
    }, [showTodayMarker]);

    useEffect(() => {
        if (!initializedRef.current) {
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
