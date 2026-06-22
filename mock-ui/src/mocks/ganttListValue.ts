import type { ListValue, ObjectItem } from "mendix";
import type { AxGanttTask } from "../../../widgets/ax-ganttchart/src/shared/types/axGanttTask";
import type { AxGanttChartProps } from "../../../widgets/ax-ganttchart/src/typings/AxGanttChartProps";

interface MockGanttEntity {
    item: ObjectItem;
    task: AxGanttTask;
}

function parseGanttDate(dateStr: string): Date {
    const normalized = dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr.replace(" ", "T");
    return new Date(normalized);
}

function toDate(value: string | Date | undefined): Date | undefined {
    if (!value) {
        return undefined;
    }

    return value instanceof Date ? value : parseGanttDate(value);
}

function createAttrValue(value: unknown) {
    return {
        value,
        status: "available",
        readOnly: true,
        displayValue: value != null ? String(value) : "",
        formatter: {
            format: (v?: unknown) => String(v ?? ""),
            parse: (v: string) => v
        },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: () => undefined,
        setValue: () => undefined,
        isList: false as const,
        validation: undefined,
        universe: undefined
    };
}

function createListAttribute(entities: MockGanttEntity[], pick: (task: AxGanttTask) => unknown) {
    const byItemId = new Map(entities.map(entity => [entity.item.id, entity.task]));

    return {
        id: "mock-gantt-attr",
        sortable: false,
        filterable: false,
        type: "String",
        formatter: {
            format: (v?: unknown) => String(v ?? ""),
            parse: (v: string) => ({ valid: true, value: v })
        },
        universe: undefined,
        isList: false,
        get: (item: ObjectItem) => {
            const task = byItemId.get(item.id);
            return createAttrValue(task ? pick(task) : undefined);
        }
    };
}

function ganttTasksToEntities(tasks: AxGanttTask[]): MockGanttEntity[] {
    return tasks.map(task => ({
        item: { id: `mock-${task.id}` } as ObjectItem,
        task
    }));
}

export function createMockGanttDatasource(tasks: AxGanttTask[]): Pick<
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
> {
    const entities = ganttTasksToEntities(tasks);

    return {
        roadmapItems: {
            status: "available",
            offset: 0,
            limit: Number.POSITIVE_INFINITY,
            setOffset: () => undefined,
            setLimit: () => undefined,
            requestTotalCount: () => undefined,
            reload: () => undefined,
            items: entities.map(entity => entity.item),
            sortOrder: [],
            filter: undefined,
            setSortOrder: () => undefined,
            setFilter: () => undefined
        } as unknown as ListValue,
        aidAttribute: createListAttribute(entities, task => task.aid ?? task.id),
        itemIdAttribute: createListAttribute(entities, task => task.id),
        textAttribute: createListAttribute(entities, task => task.text),
        nameAttribute: createListAttribute(entities, task => task.name ?? task.text),
        typeAttribute: createListAttribute(entities, task => task.type ?? "TASK"),
        parentIdAttribute: createListAttribute(entities, task => task.parent ?? ""),
        groupAttribute: createListAttribute(entities, task => task.group ?? ""),
        countAttribute: createListAttribute(entities, task => task.count ?? 0),
        orderAttribute: createListAttribute(entities, task => task.order ?? 0),
        customOrderAttribute: createListAttribute(entities, task => task.customOrder ?? task.order ?? 0),
        startDateAttribute: createListAttribute(entities, task => toDate(task.start_date)),
        endDateAttribute: createListAttribute(entities, task => toDate(task.end_date)),
        milestoneAttribute: createListAttribute(entities, task => task.milestone ?? ""),
        stndMileMonthAttribute: createListAttribute(entities, task =>
            toDate(task.stndMileMonth)
        ),
        hasTuningAttribute: createListAttribute(entities, task => task.hasTuning ?? false),
        hasManualAttribute: createListAttribute(entities, task => task.hasManual ?? false),
        hasCertAttribute: createListAttribute(entities, task => task.hasCert ?? false),
        hasRFAttribute: createListAttribute(entities, task => task.hasRF ?? false),
        canEditAttribute: createListAttribute(entities, task => task.canEdit ?? false)
    } as unknown as Pick<
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
    >;
}
