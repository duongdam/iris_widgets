import type { ChartRecord } from "@iris/chart-core";

export interface AxisConfig {
    type: "category" | "value";
    data?: string[];
    name?: string;
}

export function buildCategoryAxis(data: string[], name?: string): AxisConfig {
    return {
        type: "category",
        data,
        name,
    };
}

export function buildValueAxis(name?: string): AxisConfig {
    return {
        type: "value",
        name,
    };
}

export function sumByField(records: ChartRecord[], field: "name" | "period", key: string): number {
    return records.filter(record => record[field] === key).reduce((sum, record) => sum + record.pm, 0);
}
