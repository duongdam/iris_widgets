import { makeAutoObservable } from "mobx";
import type { ChartRecord, SeriesGroup } from "../contracts/chart-record";

export class ChartStore {
    records: ChartRecord[] = [];
    selectedRecord?: ChartRecord;
    loading = false;
    fullscreen = false;

    constructor() {
        makeAutoObservable(this);
    }

    setRecords(records: ChartRecord[]): void {
        this.records = records;
        this.loading = false;
    }

    setLoading(loading: boolean): void {
        this.loading = loading;
    }

    setFullscreen(fullscreen: boolean): void {
        this.fullscreen = fullscreen;
    }

    selectRecord(record: ChartRecord | undefined): void {
        this.selectedRecord = record;
    }

    clearSelection(): void {
        this.selectedRecord = undefined;
    }

    get categories(): string[] {
        const periods = new Set(this.records.map(record => record.period));
        return Array.from(periods).sort();
    }

    get seriesData(): SeriesGroup[] {
        const groups = new Map<string, ChartRecord[]>();

        for (const record of this.records) {
            const existing = groups.get(record.name) ?? [];
            existing.push(record);
            groups.set(record.name, existing);
        }

        return Array.from(groups.entries()).map(([name, records]) => ({ name, records }));
    }
}

export function createChartStore(): ChartStore {
    return new ChartStore();
}
