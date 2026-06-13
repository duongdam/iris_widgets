import type { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import type Big from "big.js";
import type { GanttTask } from "../eventbus/eventTypes";
import type { AxGanttChartProps } from "../../typings/AxGanttChartProps";
import { convertDate, convertDateToGanttString } from "../../shared/converters/convertDate";
import { convertProgress } from "../../shared/converters/convertProgress";
import { convertTaskId } from "../../shared/converters/convertTaskId";
import { validateDatasourceMapping } from "../../shared/validators/validateDatasourceMapping";

export interface AdapterResult {
    tasks: GanttTask[];
    skippedCount: number;
    warnings: string[];
    mappingValid: boolean;
}

export type MendixTaskMappingProps = Pick<
    AxGanttChartProps,
    | "tasksDatasource"
    | "idAttribute"
    | "textAttribute"
    | "startDateAttribute"
    | "endDateAttribute"
    | "durationAttribute"
    | "progressAttribute"
    | "parentAttribute"
    | "openAttribute"
    | "typeAttribute"
    | "tagsAttribute"
>;

function parseTags(value: string | undefined): string[] | undefined {
    if (!value) {
        return undefined;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
            const tags = parsed.filter((tag): tag is string => typeof tag === "string" && tag.length > 0);
            return tags.length > 0 ? tags : undefined;
        }
    } catch {
        // Fall through to comma-separated parsing.
    }

    const tags = trimmed
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);
    return tags.length > 0 ? tags : undefined;
}

function readAttributeString(item: ObjectItem, accessor: ListAttributeValue<string>): string | undefined {
    const attr = accessor.get(item);
    if (attr.status !== "available") {
        return undefined;
    }

    return attr.value ?? attr.displayValue ?? undefined;
}

function readTaskId(item: ObjectItem, accessor: ListAttributeValue<string | Big>): string | undefined {
    const attr = accessor.get(item);
    if (attr.status !== "available") {
        return undefined;
    }

    return convertTaskId(attr.value, attr.displayValue);
}

function readDate(item: ObjectItem, accessor?: ListAttributeValue<Date>): Date | undefined {
    if (!accessor) {
        return undefined;
    }

    const attr = accessor.get(item);
    if (attr.status !== "available") {
        return undefined;
    }

    return convertDate(attr.value);
}

function readNumber(item: ObjectItem, accessor?: ListAttributeValue<Big>): number | undefined {
    if (!accessor) {
        return undefined;
    }

    const attr = accessor.get(item);
    if (attr.status !== "available" || attr.value == null) {
        return undefined;
    }

    return convertProgress(attr.value);
}

function readDuration(item: ObjectItem, accessor?: ListAttributeValue<Big>): number | undefined {
    if (!accessor) {
        return undefined;
    }

    const attr = accessor.get(item);
    if (attr.status !== "available" || attr.value == null) {
        return undefined;
    }

    const num = Number(attr.value);
    return Number.isFinite(num) ? num : undefined;
}

function readBoolean(item: ObjectItem, accessor?: ListAttributeValue<boolean>): boolean | undefined {
    if (!accessor) {
        return undefined;
    }

    const attr = accessor.get(item);
    if (attr.status !== "available") {
        return undefined;
    }

    return attr.value;
}

export function mapMendixDatasourceToGanttTasks(props: MendixTaskMappingProps): AdapterResult {
    const mappingValidation = validateDatasourceMapping(props);
    if (!mappingValidation.valid) {
        return { tasks: [], skippedCount: 0, warnings: mappingValidation.errors, mappingValid: false };
    }

    const datasource = props.tasksDatasource;

    if (datasource.status !== "available") {
        return { tasks: [], skippedCount: 0, warnings: [], mappingValid: true };
    }

    const warnings: string[] = [];
    const tasks: GanttTask[] = [];
    let skippedCount = 0;
    const items = datasource.items ?? [];

    for (const item of items) {
        const id = readTaskId(item, props.idAttribute);
        const text = readAttributeString(item, props.textAttribute);
        const startDate = readDate(item, props.startDateAttribute);
        const start_date = convertDateToGanttString(startDate);

        if (!id || !text || !start_date) {
            skippedCount += 1;
            warnings.push(`Skipped item ${item.id}: missing id, text, or start date`);
            continue;
        }

        const endDate = readDate(item, props.endDateAttribute);
        const end_date = convertDateToGanttString(endDate);
        const duration = readDuration(item, props.durationAttribute);
        const progress = readNumber(item, props.progressAttribute);
        const parent = props.parentAttribute ? readTaskId(item, props.parentAttribute) : undefined;
        const open = readBoolean(item, props.openAttribute);
        const type = props.typeAttribute ? readAttributeString(item, props.typeAttribute) : undefined;
        const tags = props.tagsAttribute ? parseTags(readAttributeString(item, props.tagsAttribute)) : undefined;

        const task: GanttTask = {
            id,
            text,
            start_date,
            metadata: { mendixItemId: item.id }
        };

        if (end_date) {
            task.end_date = end_date;
        } else if (duration != null && duration > 0) {
            task.duration = duration;
        } else {
            skippedCount += 1;
            warnings.push(`Skipped item ${item.id}: missing end date or duration`);
            continue;
        }

        if (progress != null) {
            task.progress = progress;
        }

        if (parent) {
            task.parent = parent;
        }

        if (open != null) {
            task.open = open;
        }

        if (type) {
            task.type = type;
        }

        if (tags) {
            task.tags = tags;
        }

        tasks.push(task);
    }

    const validIds = new Set(tasks.map(task => task.id));
    for (const task of tasks) {
        if (task.parent && !validIds.has(task.parent)) {
            warnings.push(`Task ${task.id}: parent ${task.parent} not found, promoting to root`);
            delete task.parent;
        }
    }

    return { tasks, skippedCount, warnings, mappingValid: true };
}

export function isDatasourceLoading(datasource: ListValue): boolean {
    return datasource.status === "loading";
}

export function isDatasourceUnavailable(datasource: ListValue): boolean {
    return datasource.status === "unavailable";
}

export function isDatasourceAvailable(datasource: ListValue): boolean {
    return datasource.status === "available";
}

export { validateDatasourceMapping } from "../../shared/validators/validateDatasourceMapping";
