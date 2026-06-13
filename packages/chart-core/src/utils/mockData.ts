import type { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import type { Big } from "big.js";
import type { ChartRecord } from "../contracts/chart-record";

export const MOCK_FLAT_RECORDS: ChartRecord[] = [
    { id: "1", name: "CPU", period: "2025-01", pm: 120, metadata: { region: "apac" } },
    { id: "2", name: "Memory", period: "2025-01", pm: 85 },
    { id: "3", name: "CPU", period: "2025-02", pm: 140, metadata: { region: "apac" } },
    { id: "4", name: "Memory", period: "2025-02", pm: 95 },
    { id: "5", name: "Disk", period: "2025-01", pm: 60, metadata: { cluster: "cluster-a" } },
];

export const MOCK_FLAT_JSON = JSON.stringify(MOCK_FLAT_RECORDS);

export const MOCK_ELASTIC_JSON = JSON.stringify({
    aggregations: {
        periods: {
            buckets: [
                {
                    key: "2025-01",
                    items: {
                        buckets: [
                            { key: "CPU", value: { value: 120 } },
                            { key: "Memory", value: { value: 85 } },
                        ],
                    },
                },
                {
                    key: "2025-02",
                    items: {
                        buckets: [
                            { key: "CPU", value: { value: 140 } },
                            { key: "Memory", value: { value: 95 } },
                        ],
                    },
                },
            ],
        },
    },
});

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

export interface MockDatasource {
    datasource: ListValue;
    idAttribute: ListAttributeValue<string | Big>;
    nameAttribute: ListAttributeValue<string>;
    periodAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<Big>;
}

export function createMockDatasource(records: ChartRecord[]): MockDatasource {
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
    const valueMap = new Map<string, unknown>(records.map(r => [r.id, { toNumber: () => r.pm, toString: () => String(r.pm) }]));

    return {
        datasource,
        idAttribute: makeAttr(idMap) as unknown as ListAttributeValue<string | Big>,
        nameAttribute: makeAttr(nameMap) as unknown as ListAttributeValue<string>,
        periodAttribute: makeAttr(periodMap) as unknown as ListAttributeValue<string>,
        valueAttribute: makeAttr(valueMap) as unknown as ListAttributeValue<Big>,
    };
}

