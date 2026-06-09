import type { ChartRecord } from "@iris/chart-core";

export interface AggregationTotals {
    byPeriod: Map<string, number>;
    byName: Map<string, number>;
    grandTotal: number;
}

export function aggregateTotals(records: ChartRecord[]): AggregationTotals {
    const byPeriod = new Map<string, number>();
    const byName = new Map<string, number>();
    let grandTotal = 0;

    for (const record of records) {
        grandTotal += record.pm;
        byPeriod.set(record.period, (byPeriod.get(record.period) ?? 0) + record.pm);
        byName.set(record.name, (byName.get(record.name) ?? 0) + record.pm);
    }

    return { byPeriod, byName, grandTotal };
}
