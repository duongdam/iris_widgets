import type { ChartRecord } from "@iris/chart-core";
import type { EChartsType } from "echarts";

export interface ChartDataPoint {
    value?: number;
    recordId?: string;
    period?: string;
    name?: string;
}

export interface EchartsPointerParams {
    dataIndex?: number;
    seriesIndex?: number;
    seriesName?: string;
    name?: string;
    data?: number | ChartDataPoint;
}

export function isWritableAttribute(
    attribute?: { readOnly?: boolean; setValue?: (value: string) => void }
): attribute is { readOnly?: boolean; setValue: (value: string) => void } {
    return Boolean(attribute && attribute.readOnly !== true && typeof attribute.setValue === "function");
}

export function resolveRecordFromClick(
    records: ChartRecord[],
    params: EchartsPointerParams,
    lookup?: {
        periods?: string[];
        names?: string[];
    }
): ChartRecord | undefined {
    const data = params.data;
    if (data && typeof data === "object" && data.recordId) {
        return records.find(record => record.id === data.recordId);
    }

    if (params.seriesName && params.dataIndex !== undefined && lookup?.periods) {
        const period = lookup.periods[params.dataIndex];
        if (period) {
            return records.find(record => record.name === params.seriesName && record.period === period);
        }
    }

    if (params.dataIndex !== undefined && lookup?.periods) {
        const period = lookup.periods[params.dataIndex];
        if (period) {
            return records.find(record => record.period === period);
        }
    }

    if (params.dataIndex !== undefined && lookup?.names) {
        const name = lookup.names[params.dataIndex] ?? params.name;
        if (name) {
            return records.find(record => record.name === name);
        }
    }

    if (params.name) {
        return records.find(record => record.name === params.name || `${record.name} (${record.period})` === params.name);
    }

    return undefined;
}

function isCategoryAxis(axis: unknown): boolean {
    if (Array.isArray(axis)) {
        return axis[0]?.type === "category";
    }

    return (axis as { type?: string } | undefined)?.type === "category";
}

export function resolvePointerParamsFromPixel(
    instance: EChartsType,
    offsetX: number,
    offsetY: number,
    allowedSeriesIndexes?: number[]
): EchartsPointerParams | undefined {
    const point: [number, number] = [offsetX, offsetY];
    const option = instance.getOption();
    const seriesList = (option.series ?? []) as Array<{
        type?: string;
        name?: string;
        data?: Array<number | ChartDataPoint>;
    }>;
    const indexes = allowedSeriesIndexes ?? seriesList.map((_, index) => index);

    for (const seriesIndex of indexes) {
        const series = seriesList[seriesIndex];
        if (!series || !instance.containPixel({ seriesIndex }, point)) {
            continue;
        }

        const converted = instance.convertFromPixel({ seriesIndex }, point);
        if (!converted || converted.length < 2) {
            continue;
        }

        const horizontalBar =
            series.type === "bar" &&
            isCategoryAxis(option.yAxis) &&
            !isCategoryAxis(option.xAxis);
        const dataIndex = Math.round(horizontalBar ? Number(converted[1]) : Number(converted[0]));
        const dataItem = (series.data as Array<number | ChartDataPoint> | undefined)?.[dataIndex];

        return {
            dataIndex,
            seriesIndex,
            seriesName: typeof series.name === "string" ? series.name : undefined,
            data: typeof dataItem === "number" ? dataItem : dataItem,
        };
    }

    return undefined;
}

export function handleChartRecordSelect(
    record: ChartRecord | undefined,
    actions: {
        selectRecord: (record: ChartRecord | undefined) => void;
        handleClick: (record: ChartRecord) => void;
        handleHover?: (record: ChartRecord) => void;
    },
    mode: "click" | "hover"
): void {
    if (!record) {
        return;
    }

    if (mode === "hover") {
        actions.handleHover?.(record);
        return;
    }

    actions.selectRecord(record);
    actions.handleClick(record);
}
