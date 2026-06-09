import type { ChartRecord } from "../contracts/chart-record";
import { ChartEvents, type ChartEventBus } from "./types";

export interface MendixActionValue {
    canExecute?: boolean;
    isExecuting?: boolean;
    execute?: () => void;
}

export interface WidgetEventBridgeOptions {
    widgetId: string;
    eventBus: ChartEventBus;
    onClick?: MendixActionValue;
    onSelectionChanged?: MendixActionValue;
}

export interface WidgetEventBridge {
    handleClick: (record: ChartRecord) => void;
    handleHover: (record: ChartRecord) => void;
    handleLegendSelect: (seriesName: string, selected: boolean) => void;
    handleDrilldown: (record: ChartRecord, level?: number) => void;
    handleSelectionChanged: (record?: ChartRecord) => void;
    handleReady: (recordCount: number) => void;
    handleRefresh: (recordCount: number) => void;
}

const HOVER_DEBOUNCE_MS = 16;

export function createWidgetEventBridge(options: WidgetEventBridgeOptions): WidgetEventBridge {
    const { widgetId, eventBus, onClick, onSelectionChanged } = options;
    let hoverTimer: ReturnType<typeof setTimeout> | undefined;
    let pendingHoverRecord: ChartRecord | undefined;

    return {
        handleClick(record: ChartRecord): void {
            eventBus.emit({
                widgetId,
                type: ChartEvents.CHART_CLICK,
                data: { record },
            });

            if (onClick?.canExecute && !onClick.isExecuting) {
                onClick.execute?.();
            }
        },

        handleHover(record: ChartRecord): void {
            pendingHoverRecord = record;
            if (hoverTimer !== undefined) {
                clearTimeout(hoverTimer);
            }
            hoverTimer = setTimeout(() => {
                if (pendingHoverRecord) {
                    eventBus.emit({
                        widgetId,
                        type: ChartEvents.CHART_HOVER,
                        data: { record: pendingHoverRecord },
                    });
                }
                hoverTimer = undefined;
            }, HOVER_DEBOUNCE_MS);
        },

        handleLegendSelect(seriesName: string, selected: boolean): void {
            eventBus.emit({
                widgetId,
                type: ChartEvents.CHART_LEGEND_SELECT,
                data: { seriesName, selected },
            });
        },

        handleDrilldown(record: ChartRecord, level = 0): void {
            eventBus.emit({
                widgetId,
                type: ChartEvents.CHART_DRILLDOWN,
                data: { record, level },
            });
        },

        handleSelectionChanged(record?: ChartRecord): void {
            eventBus.emit({
                widgetId,
                type: ChartEvents.CHART_SELECTION_CHANGED,
                data: { record },
            });

            if (onSelectionChanged?.canExecute && !onSelectionChanged.isExecuting) {
                onSelectionChanged.execute?.();
            }
        },

        handleReady(recordCount: number): void {
            eventBus.emit({
                widgetId,
                type: ChartEvents.CHART_READY,
                data: { recordCount },
            });
        },

        handleRefresh(recordCount: number): void {
            eventBus.emit({
                widgetId,
                type: ChartEvents.CHART_REFRESH,
                data: { recordCount },
            });
        },
    };
}
