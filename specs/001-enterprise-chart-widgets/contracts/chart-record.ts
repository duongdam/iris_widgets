/**
 * Contract: ChartRecord — normalized chart data point.
 * Source of truth for Phase 2 implementation in @iris/chart-core.
 */

export interface ChartRecord {
    /** Unique identifier within the dataset */
    id: string;

    /** Optional parent reference for hierarchy / drilldown */
    parent?: string;

    /** Series or category label */
    name: string;

    /** Time bucket or categorical axis value */
    period: string;

    /** Primary numeric measure */
    pm: number;

    /**
     * Opaque metadata — structure is unknown to widgets.
     * MUST be preserved through adapter, store, selection, and events.
     */
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
