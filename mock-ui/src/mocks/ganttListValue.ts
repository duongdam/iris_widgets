import type { ListValue, ObjectItem } from "mendix";
import type { GanttTask } from "../../../widgets/ax-ganttchart/src/main/eventbus/eventTypes";
import type { AxGanttChartProps } from "../../../widgets/ax-ganttchart/src/typings/AxGanttChartProps";

interface MockGanttEntity {
    item: ObjectItem;
    task: GanttTask;
}

function parseGanttDate(dateStr: string): Date {
    const normalized = dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr.replace(" ", "T");
    return new Date(normalized);
}

function createAttrValue(value: unknown) {
    return {
        value,
        status: "available",
        readOnly: true,
        displayValue: value != null ? String(value) : "",
        formatter: {
            format: (v?: unknown) => String(v ?? ""),
            parse: (v: string) => v,
        },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: () => undefined,
        setValue: () => undefined,
        isList: false as const,
        validation: undefined,
        universe: undefined,
    };
}

function createListAttribute(entities: MockGanttEntity[], pick: (task: GanttTask) => unknown) {
    const byItemId = new Map(entities.map(entity => [entity.item.id, entity.task]));

    return {
        id: "mock-gantt-attr",
        sortable: false,
        filterable: false,
        type: "String",
        formatter: {
            format: (v?: unknown) => String(v ?? ""),
            parse: (v: string) => ({ valid: true, value: v }),
        },
        universe: undefined,
        isList: false,
        get: (item: ObjectItem) => {
            const task = byItemId.get(item.id);
            return createAttrValue(task ? pick(task) : undefined);
        },
    };
}

function ganttTasksToEntities(tasks: GanttTask[]): MockGanttEntity[] {
    return tasks.map(task => ({
        item: { id: `mock-${task.id}` } as ObjectItem,
        task,
    }));
}

export function createMockGanttDatasource(tasks: GanttTask[]): Pick<
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
> {
    const entities = ganttTasksToEntities(tasks);

    return {
        tasksDatasource: {
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
            setFilter: () => undefined,
        } as unknown as ListValue,
        idAttribute: createListAttribute(entities, task => task.id),
        textAttribute: createListAttribute(entities, task => task.text),
        startDateAttribute: createListAttribute(entities, task =>
            task.start_date instanceof Date ? task.start_date : parseGanttDate(task.start_date as string)
        ),
        endDateAttribute: createListAttribute(entities, task =>
            task.end_date
                ? task.end_date instanceof Date
                    ? task.end_date
                    : parseGanttDate(task.end_date as string)
                : undefined
        ),
        durationAttribute: createListAttribute(entities, task => task.duration),
        progressAttribute: createListAttribute(entities, task => task.progress),
        parentAttribute: createListAttribute(entities, task => task.parent) as unknown as AxGanttChartProps["parentAttribute"],
        openAttribute: createListAttribute(entities, task => task.open),
        typeAttribute: createListAttribute(entities, task => task.type),
        tagsAttribute: createListAttribute(entities, task =>
            task.tags && task.tags.length > 0 ? JSON.stringify(task.tags) : undefined
        ),
    } as unknown as Pick<
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
}
