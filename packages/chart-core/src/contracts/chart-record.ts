export interface ChartRecord {
    id: string;
    parent?: string;
    name: string;
    period: string;
    pm: number;
    metadata?: Record<string, unknown>;
}

export enum DataFormat {
    FLAT = "flat",
    ELASTIC = "elastic",
}

export interface SeriesGroup {
    name: string;
    records: ChartRecord[];
}
