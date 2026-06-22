/**
 * Contract: AxGanttTask — normalized internal task model
 */

export type AxTaskType =
    | "DISTRICT_GROUP"
    | "CUSTOM_GROUP"
    | "TASK"
    | "SUB_TASK";

/** Legacy types in gantt-test.json */
export type LegacyTaskType = "AREA" | "BIZ_LINE" | "TASK" | "SUB_TASK";

export function normalizeTaskType(raw: string | undefined): AxTaskType | string;

export function isGroupType(type: string | undefined): boolean;

export function isScheduledType(type: string | undefined): boolean;

export interface AxGanttTask {
    id: string;
    aid?: string;
    text: string;
    name?: string;
    type?: AxTaskType | string;
    parent?: string;
    group?: string;

    start_date?: string | Date;
    end_date?: string | Date;
    duration?: number;
    progress?: number;

    /** DHTMLX: true for groups / dateless rows */
    unscheduled?: boolean;
    open?: boolean;

    milestone?: string;
    stndMileMonth?: string | Date;
    order?: number;
    customOrder?: string | number;
    count?: number;

    hasTuning?: boolean;
    hasManual?: boolean;
    hasCert?: boolean;
    hasRF?: boolean;
    canEdit?: boolean;

    metadata?: Record<string, unknown>;
}

/** @deprecated Use AxGanttTask */
export type GanttTask = AxGanttTask;
