import type { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import type Big from "big.js";
import type { AxGanttTask } from "../../shared/types/axGanttTask";
import type { AxGanttChartProps } from "../../typings/AxGanttChartProps";
import { convertDate, convertDateToGanttString } from "../../shared/converters/convertDate";
import { convertTaskId } from "../../shared/converters/convertTaskId";
import { validateDatasourceMapping } from "../../shared/validators/validateDatasourceMapping";
import { isGroupType, isScheduledType, normalizeTaskType } from "../../shared/types/axGanttTask";
import { normalizeMtoDateField } from "../../shared/utils/mtoDate";
import { sortTasksByOrderNo } from "../../shared/utils/sortTasksByOrderNo";
import { convertProgress } from "../../shared/converters/convertProgress";

export interface AdapterResult {
    tasks: AxGanttTask[];
    skippedCount: number;
    warnings: string[];
    mappingValid: boolean;
}

export type MendixTaskMappingProps = Pick<
    AxGanttChartProps,
    | "roadmapItems"
    | "aidAttribute"
    | "itemIdAttribute"
    | "parentIdAttribute"
    | "groupAttribute"
    | "typeAttribute"
    | "nameAttribute"
    | "textAttribute"
    | "countAttribute"
    | "orderAttribute"
    | "customOrderAttribute"
    | "startDateAttribute"
    | "endDateAttribute"
    | "milestoneAttribute"
    | "stndMileMonthAttribute"
    | "hasTuningAttribute"
    | "hasManualAttribute"
    | "hasCertAttribute"
    | "hasRFAttribute"
    | "canEditAttribute"
    | "metadata1Attribute"
    | "metadata2Attribute"
    | "metadata3Attribute"
    | "metadata4Attribute"
    | "metadata5Attribute"
>;

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

function readMetadataValue(
    item: ObjectItem,
    accessor?: ListAttributeValue<string | Big | boolean | Date>
): string | number | boolean | undefined {
    if (!accessor) {
        return undefined;
    }

    const attr = accessor.get(item);
    if (attr.status !== "available" || attr.value == null) {
        return undefined;
    }

    if (attr.value instanceof Date) {
        return attr.value.toISOString();
    }

    if (typeof attr.value === "boolean" || typeof attr.value === "string") {
        return attr.value;
    }

    const num = Number(attr.value);
    return Number.isFinite(num) ? num : String(attr.value);
}

function readMetadataFields(
    item: ObjectItem,
    props: MendixTaskMappingProps
): Record<string, string | number | boolean> {
    const metadata: Record<string, string | number | boolean> = {};
    const slots = [
        ["metadata1", props.metadata1Attribute],
        ["metadata2", props.metadata2Attribute],
        ["metadata3", props.metadata3Attribute],
        ["metadata4", props.metadata4Attribute],
        ["metadata5", props.metadata5Attribute]
    ] as const;

    for (const [key, accessor] of slots) {
        const value = readMetadataValue(item, accessor);
        if (value !== undefined) {
            metadata[key] = value;
        }
    }

    return metadata;
}

export function mapMendixDatasourceToGanttTasks(props: MendixTaskMappingProps): AdapterResult {
    const mappingValidation = validateDatasourceMapping(props);
    if (!mappingValidation.valid) {
        return { tasks: [], skippedCount: 0, warnings: mappingValidation.errors, mappingValid: false };
    }

    const datasource = props.roadmapItems;

    if (datasource.status !== "available") {
        return { tasks: [], skippedCount: 0, warnings: [], mappingValid: true };
    }

    const warnings: string[] = [];
    const tasks: AxGanttTask[] = [];
    let skippedCount = 0;
    const items = datasource.items ?? [];

    for (const item of items) {
        const id = readTaskId(item, props.itemIdAttribute);
        const text = readAttributeString(item, props.textAttribute);
        const rawType = readAttributeString(item, props.typeAttribute);
        const type = normalizeTaskType(rawType);

        if (!id || !text) {
            skippedCount += 1;
            warnings.push(`Skipped item ${item.id}: missing itemId or text`);
            continue;
        }

        const parent = readAttributeString(item, props.parentIdAttribute);
        const group = readAttributeString(item, props.groupAttribute);
        const name = readAttributeString(item, props.nameAttribute);
        const startDate = readDate(item, props.startDateAttribute);
        const endDate = readDate(item, props.endDateAttribute);
        const start_date = convertDateToGanttString(startDate);
        const end_date = convertDateToGanttString(endDate);
        const milestone = readAttributeString(item, props.milestoneAttribute);
        const stndMileMonth = readDate(item, props.stndMileMonthAttribute);
        const order = readNumber(item, props.orderAttribute);
        const customOrderAttr = props.customOrderAttribute.get(item);
        const customOrder =
            customOrderAttr.status === "available" && customOrderAttr.value != null
                ? customOrderAttr.value instanceof Object && "toString" in customOrderAttr.value
                    ? customOrderAttr.value.toString()
                    : String(customOrderAttr.value)
                : undefined;
        const count = readNumber(item, props.countAttribute);
        const aid = readTaskId(item, props.aidAttribute);
        const extraMetadata = readMetadataFields(item, props);

        const unscheduled = isGroupType(type) || (isScheduledType(type) && !start_date);

        if (isScheduledType(type) && !start_date && !unscheduled) {
            skippedCount += 1;
            warnings.push(`Skipped item ${item.id}: TASK/SUB_TASK missing start date`);
            continue;
        }

        const task: AxGanttTask = {
            id,
            aid,
            text,
            name,
            type,
            parent: parent || undefined,
            group,
            unscheduled,
            order,
            customOrder,
            count,
            hasTuning: readBoolean(item, props.hasTuningAttribute),
            hasManual: readBoolean(item, props.hasManualAttribute),
            hasCert: readBoolean(item, props.hasCertAttribute),
            hasRF: readBoolean(item, props.hasRFAttribute),
            canEdit: readBoolean(item, props.canEditAttribute),
            metadata: { mendixItemId: item.id, ...extraMetadata }
        };

        if (!unscheduled) {
            if (start_date) {
                task.start_date = start_date;
            }
            if (end_date) {
                task.end_date = end_date;
            }
            if (milestone) {
                task.milestone = milestone;
            }
            if (stndMileMonth) {
                task.stndMileMonth = convertDateToGanttString(stndMileMonth);
            }
            tasks.push(normalizeMtoDateField(task));
        } else {
            tasks.push(task);
        }
    }

    const validIds = new Set(tasks.map(task => task.id));
    for (const task of tasks) {
        if (task.parent && !validIds.has(task.parent)) {
            warnings.push(`Task ${task.id}: parent ${task.parent} not found, promoting to root`);
            delete task.parent;
        }
    }

    return { tasks: sortTasksByOrderNo(tasks), skippedCount, warnings, mappingValid: true };
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
