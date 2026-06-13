import type { Big } from "big.js";
import type { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import type { ChartRecord } from "../contracts/chart-record";
import { generateId } from "../utils/generateId";

export interface DatasourceMapping {
    idAttribute?: ListAttributeValue<string | Big>;
    nameAttribute: ListAttributeValue<string>;
    periodAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<Big>;
}

export function mapDatasourceToRecords(
    datasource: ListValue,
    mapping: DatasourceMapping
): ChartRecord[] {
    const items: ObjectItem[] = datasource.items ?? [];
    return items.map((item): ChartRecord => {
        const name = mapping.nameAttribute.get(item).value ?? "";
        const period = mapping.periodAttribute.get(item).value ?? "";
        const rawValue = mapping.valueAttribute.get(item).value;
        const pm = rawValue != null ? rawValue.toNumber() : 0;

        let id: string;
        if (mapping.idAttribute) {
            const rawId = mapping.idAttribute.get(item).value;
            id = rawId != null ? String(rawId) : generateId("ds");
        } else {
            id = generateId("ds");
        }

        return { id, name, period, pm };
    });
}
