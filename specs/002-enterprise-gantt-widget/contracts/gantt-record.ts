/**
 * Contract: GanttTask — normalized task model for DHTMLX Gantt.
 */

export interface GanttTask {
    id: string;
    text: string;
    start_date: string;
    end_date?: string;
    duration?: number;
    progress?: number;
    parent?: string;
    open?: boolean;
    type?: string;
    color?: string;
    metadata?: Record<string, unknown>;
}

export enum TimelineViewMode {
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    QUARTER = "quarter",
}

export interface GanttParsePayload {
    data: GanttTask[];
    links?: GanttLink[];
}

export interface GanttLink {
    id: string;
    source: string;
    target: string;
    type: string;
}
