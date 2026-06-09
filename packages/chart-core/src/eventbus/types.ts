import type { ChartRecord } from "../contracts/chart-record";

export enum ChartEvents {
    CHART_READY = "CHART_READY",
    CHART_CLICK = "CHART_CLICK",
    CHART_HOVER = "CHART_HOVER",
    CHART_LEGEND_SELECT = "CHART_LEGEND_SELECT",
    CHART_SELECTION_CHANGED = "CHART_SELECTION_CHANGED",
    CHART_REFRESH = "CHART_REFRESH",
    CHART_FILTER_CHANGED = "CHART_FILTER_CHANGED",
    CHART_TIME_RANGE_CHANGED = "CHART_TIME_RANGE_CHANGED",
    CHART_DRILLDOWN = "CHART_DRILLDOWN",
    DASHBOARD_REFRESH = "DASHBOARD_REFRESH",
}

export interface ChartEventPayload {
    widgetId: string;
    type: ChartEvents;
    data?: unknown;
}

export type ChartEventHandler = (payload: ChartEventPayload) => void;

export interface ChartEventBus {
    emit(payload: ChartEventPayload): void;
    on(type: ChartEvents, handler: ChartEventHandler): () => void;
    off(type: ChartEvents, handler: ChartEventHandler): void;
    once(type: ChartEvents, handler: ChartEventHandler): void;
    clear(): void;
}

export interface ChartClickData {
    record: ChartRecord;
}

export interface ChartSelectionChangedData {
    record?: ChartRecord;
}

export interface ChartLegendSelectData {
    seriesName: string;
    selected: boolean;
}

export interface ChartReadyData {
    recordCount: number;
}

export interface ChartDrilldownData {
    record: ChartRecord;
    level: number;
}
