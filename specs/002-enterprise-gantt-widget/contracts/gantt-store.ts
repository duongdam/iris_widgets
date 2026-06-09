/**
 * Contract: GanttStore — MobX store for Gantt data and UI state.
 */

import type { GanttTask, TimelineViewMode } from "./gantt-record";

export interface GanttStore {
    tasks: GanttTask[];
    selectedTask?: GanttTask;
    viewMode: TimelineViewMode;
    fullscreen: boolean;
    loading: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    hoveredTaskId?: string;

    readonly taskById: Map<string, GanttTask>;
    readonly hasTasks: boolean;
    readonly rootTasks: GanttTask[];

    setTasks(tasks: GanttTask[]): void;
    selectTask(task: GanttTask | undefined): void;
    setViewMode(mode: TimelineViewMode): void;
    setFullscreen(value: boolean): void;
    setLoading(value: boolean): void;
    setShowGrid(value: boolean): void;
    setShowTimeline(value: boolean): void;
    setHoveredTaskId(id: string | undefined): void;
}

export interface GanttStoreFactory {
    create(defaultViewMode?: TimelineViewMode): GanttStore;
}
