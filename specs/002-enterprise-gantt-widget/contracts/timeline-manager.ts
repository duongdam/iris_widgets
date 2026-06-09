/**
 * Contract: TimelineManager — DHTMLX scale configuration per view mode.
 */

import type { TimelineViewMode } from "./gantt-record";

export interface GanttScaleConfig {
    unit: string;
    step: number;
    format?: string;
    css?: string;
}

export interface TimelineManager {
    /** Returns scale array for the given view mode */
    getScales(mode: TimelineViewMode): GanttScaleConfig[];

    /** Apply mode to live gantt instance without re-init */
    applyMode(gantt: GanttInstance, mode: TimelineViewMode): void;

    /** Fit all tasks into visible timeline range */
    fitTimeline(gantt: GanttInstance): void;

    /** Scroll timeline to date */
    scrollToDate(gantt: GanttInstance, date: Date): void;

    /** Scroll timeline to task by id */
    scrollToTask(gantt: GanttInstance, taskId: string): void;
}

/** Minimal DHTMLX Gantt instance surface used by managers */
export interface GanttInstance {
    config: {
        scales: GanttScaleConfig[];
        start_date?: Date;
        end_date?: Date;
        fit_tasks?: boolean;
        today_marker?: boolean;
        show_grid?: boolean;
        smart_rendering?: boolean;
        autosize?: boolean;
    };
    render(): void;
    showDate(date: Date): void;
    showTask(taskId: string): void;
    getTask?(taskId: string): { id: string } | null;
}
