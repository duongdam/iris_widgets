/**
 * Contract: ChartStore — MobX store for chart data and selection.
 */

import type { ChartRecord, SeriesGroup } from "./chart-record";

export interface ChartStore {
    records: ChartRecord[];
    selectedRecord?: ChartRecord;
    loading: boolean;

    setRecords(records: ChartRecord[]): void;
    selectRecord(record: ChartRecord | undefined): void;
    clearSelection(): void;

    /** Unique sorted period values */
    readonly categories: string[];

    /** Records grouped by series name */
    readonly seriesData: SeriesGroup[];
}

export interface ChartStoreFactory {
    create(): ChartStore;
}
