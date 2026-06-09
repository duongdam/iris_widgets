/**
 * Contract: GanttDatasourceAdapter — Mendix ListValue → GanttTask[].
 */

import type { GanttTask } from "./gantt-record";

export interface MendixListAttributeValue {
    value?: unknown;
    displayValue?: string;
    status?: string;
}

export interface MendixListItem {
    id: string;
    [attributeKey: string]: MendixListAttributeValue | string | undefined;
}

export interface MendixListValue {
    status: "loading" | "available" | "unavailable" | "unknown";
    items?: MendixListItem[];
    hasMoreItems?: boolean;
}

export interface GanttDatasourceMapping {
    idAttribute: string;
    textAttribute: string;
    startDateAttribute: string;
    endDateAttribute?: string;
    durationAttribute?: string;
    progressAttribute?: string;
    parentAttribute?: string;
    openAttribute?: string;
    typeAttribute?: string;
}

export interface AdapterResult {
    tasks: GanttTask[];
    skippedCount: number;
    warnings: string[];
}

export interface GanttDatasourceAdapter {
    mapListValue(list: MendixListValue, mapping: GanttDatasourceMapping): AdapterResult;
}
