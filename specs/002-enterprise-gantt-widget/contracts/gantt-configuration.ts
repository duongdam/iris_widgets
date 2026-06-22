/**
 * Contract: DHTMLX Gantt Configuration
 *
 * Subset applied by AxGanttChartView init + recommended defaults.
 * Full inventory: research.md §6
 */

import type { GanttStatic } from "dhtmlx-gantt";

export type TimelineViewMode = "day" | "week" | "month";

export interface AxGanttDisplayConfig {
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    viewMode: TimelineViewMode;
    taskCount?: number;
    timelineStart?: Date;
    timelineEnd?: Date;
}

export interface AxGanttEditingConfig {
    readOnly: boolean;
    allowDrag: boolean;
    allowResize: boolean;
    allowGridReorder: boolean;
}

/** Config keys set during gantt.init() */
export const APPLIED_GANTT_CONFIG = [
    "date_format",
    "xml_date",
    "smart_rendering",
    "branch_loading",
    "scroll_on_click",
    "autosize",
    "row_height",
    "bar_height",
    "scale_height",
    "min_column_width",
    "column_width",
    "show_progress",
    "show_grid",
    "show_chart",
    "fit_tasks",
    "start_on_monday",
    "show_links",
    "drag_links",
    "show_task_cells",
    "show_unscheduled",
    "scales",
    "start_date",
    "end_date",
    "readonly",
    "drag_move",
    "drag_resize",
    "drag_progress",
    "details_on_create",
    "details_on_dblclick",
    "order_branch"
] as const;

/** Recommended values for Ax Gantt */
export const GANTT_CONFIG_DEFAULTS: Record<string, unknown> = {
    date_format: "%Y-%m-%d %H:%i",
    xml_date: "%Y-%m-%d %H:%i",
    smart_rendering: true,
    branch_loading: true,
    scroll_on_click: false,
    autosize: false,
    fit_tasks: false,
    start_on_monday: true,
    show_links: false,
    drag_links: false,
    show_unscheduled: false,
    details_on_dblclick: false
};

export function initAxGantt(container: HTMLElement, display: AxGanttDisplayConfig): void;

export function applyEditingConfig(config: AxGanttEditingConfig, target?: GanttStatic): () => void;

export function mapTaskForDhtmlx(task: import("./gantt-record").AxGanttTask): Record<string, unknown>;
