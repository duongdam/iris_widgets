import type { ChartRecord, SeriesGroup } from "@iris/chart-core";

export function groupByName(records: ChartRecord[]): SeriesGroup[] {
    const groups = new Map<string, ChartRecord[]>();

    for (const record of records) {
        const existing = groups.get(record.name) ?? [];
        existing.push(record);
        groups.set(record.name, existing);
    }

    return Array.from(groups.entries()).map(([name, seriesRecords]) => ({
        name,
        records: seriesRecords,
    }));
}

export function getSortedNames(records: ChartRecord[]): string[] {
    return Array.from(new Set(records.map(record => record.name))).sort();
}
