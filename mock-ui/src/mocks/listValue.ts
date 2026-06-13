import type { ChartRecord } from "@iris/chart-core";
import type { Big } from "big.js";
import type { ListAttributeValue, ListValue, ObjectItem } from "mendix";

type MockItem = { __id: string } & ObjectItem;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeAttr(map: Map<string, unknown>): ListAttributeValue<any> {
    return {
        get: (item: ObjectItem) => ({ value: map.get((item as MockItem).__id) }),
        id: "mock-attr",
        universe: undefined,
        filterable: false,
        sortable: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
}

export interface MockListValue {
    datasource: ListValue;
    idAttribute: ListAttributeValue<string | Big>;
    nameAttribute: ListAttributeValue<string>;
    periodAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<Big>;
}

export function createMockListValue(records: ChartRecord[]): MockListValue {
    const items = records.map(r => ({ __id: r.id } as MockItem));

    const datasource = {
        status: "available" as const,
        items,
        offset: 0,
        limit: 0,
        totalCount: items.length,
        hasMoreItems: false,
        requestTotalCount: () => {},
        setLimit: () => {},
        setOffset: () => {},
        reload: () => {},
        setSortOrder: () => {},
        setFilter: () => {},
    } as unknown as ListValue;

    const idMap = new Map<string, unknown>(records.map(r => [r.id, r.id]));
    const nameMap = new Map<string, unknown>(records.map(r => [r.id, r.name]));
    const periodMap = new Map<string, unknown>(records.map(r => [r.id, r.period]));
    const valueMap = new Map<string, unknown>(
        records.map(r => [
            r.id,
            { toNumber: () => r.pm, toString: () => String(r.pm) },
        ])
    );

    return {
        datasource,
        idAttribute: makeAttr(idMap) as unknown as ListAttributeValue<string | Big>,
        nameAttribute: makeAttr(nameMap) as unknown as ListAttributeValue<string>,
        periodAttribute: makeAttr(periodMap) as unknown as ListAttributeValue<string>,
        valueAttribute: makeAttr(valueMap) as unknown as ListAttributeValue<Big>,
    };
}
