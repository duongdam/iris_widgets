import type { ChartRecord } from "@iris/chart-core";

export function groupByPeriod(records: ChartRecord[]): Map<string, ChartRecord[]> {
    const groups = new Map<string, ChartRecord[]>();

    for (const record of records) {
        const existing = groups.get(record.period) ?? [];
        existing.push(record);
        groups.set(record.period, existing);
    }

    return groups;
}

export function getSortedPeriods(records: ChartRecord[]): string[] {
    return Array.from(new Set(records.map(record => record.period))).sort();
}
