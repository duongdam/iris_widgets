import type { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import type { ComboboxOption } from "../contracts/combobox-option";

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

export interface MockComboboxDatasource {
    datasource: ListValue;
    labelAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<string>;
}

export function createMockComboboxDatasource(options: ComboboxOption[]): MockComboboxDatasource {
    const items = options.map(option => ({ __id: option.value } as MockItem));

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

    const labelMap = new Map<string, unknown>(options.map(option => [option.value, option.label]));
    const valueMap = new Map<string, unknown>(options.map(option => [option.value, option.value]));

    return {
        datasource,
        labelAttribute: makeAttr(labelMap) as unknown as ListAttributeValue<string>,
        valueAttribute: makeAttr(valueMap) as unknown as ListAttributeValue<string>,
    };
}
