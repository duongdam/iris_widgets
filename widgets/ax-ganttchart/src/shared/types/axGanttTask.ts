export type AxTaskType = "DISTRICT_GROUP" | "CUSTOM_GROUP" | "TASK" | "SUB_TASK";

export type LegacyTaskType = "AREA" | "BIZ_LINE" | "TASK" | "SUB_TASK";

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
    unscheduled?: boolean;
    open?: boolean;
    milestone?: string;
    stndMileMonth?: string | Date;
    order?: number;
    customOrder?: string | number;
    count?: number;
    orderNo?: number;
    hasTuning?: boolean;
    hasManual?: boolean;
    hasCert?: boolean;
    hasRF?: boolean;
    canEdit?: boolean;
    metadata?: Record<string, unknown>;
}

/** @deprecated Use AxGanttTask */
export type GanttTask = AxGanttTask;

const GROUP_TYPES = new Set<string>(["DISTRICT_GROUP", "CUSTOM_GROUP", "AREA", "BIZ_LINE"]);
const SCHEDULED_TYPES = new Set<string>(["TASK", "SUB_TASK"]);

export function normalizeTaskType(raw: string | undefined): AxTaskType | string {
    if (!raw) {
        return "TASK";
    }

    switch (raw) {
        case "AREA":
            return "DISTRICT_GROUP";
        case "BIZ_LINE":
            return "CUSTOM_GROUP";
        case "SUB_TASK":
            return "SUB_TASK";
        default:
            return raw;
    }
}

export function isGroupType(type: string | undefined): boolean {
    if (!type) {
        return false;
    }

    return GROUP_TYPES.has(type) || GROUP_TYPES.has(normalizeTaskType(type));
}

export function isScheduledType(type: string | undefined): boolean {
    const normalized = normalizeTaskType(type);
    return SCHEDULED_TYPES.has(normalized);
}

export function resolveTaskTypeForOutput(task: AxGanttTask): string {
    return String(normalizeTaskType(task.type));
}
