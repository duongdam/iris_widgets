import type { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import type Big from "big.js";
import type { GanttTask } from "../eventbus/eventTypes";
import type { AxGanttChartProps } from "../../typings/AxGanttChartProps";

export interface AdapterResult {
    tasks: GanttTask[];
    skippedCount: number;
    warnings: string[];
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
>;

function formatGanttDate(value: Date | undefined): string | undefined {
    if (!value || Number.isNaN(value.getTime())) {
        return undefined;
    }

    const pad = (n: number): string => String(n).padStart(2, "0");
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(
        value.getMinutes()
    )}`;
}

function formatAttributeString(value: string | Big | undefined, displayValue?: string): string | undefined {
    if (value != null) {
        return typeof value === "object" && "toString" in value ? value.toString() : String(value);
    }

    return displayValue != null ? String(displayValue) : undefined;
}

function readId(item: ObjectItem, accessor: ListAttributeValue<string | Big>): string | undefined {
    const attr = accessor.get(item);
    if (attr.status !== "available") {
        return undefined;
    }

    return formatAttributeString(attr.value, attr.displayValue);
}

function readText(item: ObjectItem, accessor: ListAttributeValue<string>): string | undefined {
    const attr = accessor.get(item);
    if (attr.status !== "available") {
        return undefined;
    }

    return formatAttributeString(attr.value, attr.displayValue);
}

function readDate(item: ObjectItem, accessor?: ListAttributeValue<Date>): Date | undefined {
    if (!accessor) {
        return undefined;
    }

    const attr = accessor.get(item);
    if (attr.status !== "available") {
        return undefined;
    }

    return attr.value;
}

function readNumber(item: ObjectItem, accessor?: ListAttributeValue<Big>): number | undefined {
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

function clampProgress(value: number | undefined): number | undefined {
    if (value == null) {
        return undefined;
    }

    if (value > 1 && value <= 100) {
        return value / 100;
    }

    return Math.min(1, Math.max(0, value));
}

export function mapMendixDatasourceToGanttTasks(props: MendixTaskMappingProps): AdapterResult {
    const datasource = props.tasksDatasource;

    if (datasource.status !== "available") {
        return { tasks: [], skippedCount: 0, warnings: [] };
    }

    const warnings: string[] = [];
    const tasks: GanttTask[] = [];
    let skippedCount = 0;
    const items = datasource.items ?? [];

    for (const item of items) {
        const id = readId(item, props.idAttribute);
        const text = readText(item, props.textAttribute);
        const startDate = readDate(item, props.startDateAttribute);
        const start_date = formatGanttDate(startDate);

        if (!id || !text || !start_date) {
            skippedCount += 1;
            warnings.push(`Skipped item ${item.id}: missing id, text, or start date`);
            continue;
        }

        const endDate = readDate(item, props.endDateAttribute);
        const end_date = formatGanttDate(endDate);
        const duration = readNumber(item, props.durationAttribute);
        const progress = clampProgress(readNumber(item, props.progressAttribute));
        const parent = props.parentAttribute ? readText(item, props.parentAttribute) : undefined;
        const open = readBoolean(item, props.openAttribute);
        const type = props.typeAttribute ? readText(item, props.typeAttribute) : undefined;

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

        tasks.push(task);
    }

    const validIds = new Set(tasks.map(task => task.id));
    for (const task of tasks) {
        if (task.parent && !validIds.has(task.parent)) {
            warnings.push(`Task ${task.id}: parent ${task.parent} not found, promoting to root`);
            delete task.parent;
        }
    }

    return { tasks, skippedCount, warnings };
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
