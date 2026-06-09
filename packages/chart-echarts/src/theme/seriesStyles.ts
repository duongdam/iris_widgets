import type { BarSeriesOption, LineSeriesOption } from "echarts";
import { getSeriesColor } from "../helpers/colorPalette";
import { IRIS_TOKENS } from "./irisTokens";

const DIMMED_OPACITY = 0.35;

export interface ChartDataPoint {
    value?: number;
    recordId?: string;
    [key: string]: unknown;
}

export function applySelectionOpacity<T extends ChartDataPoint>(
    data: T[],
    selectedId?: string
): T[] {
    if (!selectedId) {
        return data;
    }

    return data.map(item => ({
        ...item,
        itemStyle: {
            ...(typeof item.itemStyle === "object" ? item.itemStyle : {}),
            opacity: item.recordId === selectedId ? 1 : DIMMED_OPACITY,
            ...(item.recordId === selectedId
                ? { borderColor: IRIS_TOKENS.primary, borderWidth: 2 }
                : {}),
        },
    }));
}

export function buildBarGradient(colorIndex = 0): BarSeriesOption["itemStyle"] {
    const base = getSeriesColor(colorIndex);
    return {
        color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
                { offset: 0, color: base },
                { offset: 1, color: `${base}99` },
            ],
        },
        borderRadius: [4, 4, 0, 0],
    };
}

export const barVerticalPreset: Partial<BarSeriesOption> = {
    barMaxWidth: 48,
    barMinHeight: 2,
};

export const columnGroupedPreset: Partial<BarSeriesOption> = {
    barMaxWidth: 36,
    barGap: "20%",
    barCategoryGap: "30%",
    itemStyle: {
        borderRadius: [4, 4, 0, 0],
    },
};

export function buildAreaSeriesStyle(colorIndex: number): Partial<LineSeriesOption> {
    const color = getSeriesColor(colorIndex);
    return {
        smooth: true,
        lineStyle: { width: 2, color },
        showSymbol: true,
        symbolSize: 6,
        itemStyle: { color },
        areaStyle: {
            color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                    { offset: 0, color: `${color}66` },
                    { offset: 1, color: `${color}0D` },
                ],
            },
        },
        emphasis: { focus: "series" },
    };
}

export const reportComboBarPreset: Partial<BarSeriesOption> = {
    barMaxWidth: 40,
    itemStyle: {
        borderRadius: [4, 4, 0, 0],
    },
};

export const reportComboLinePreset: Partial<LineSeriesOption> = {
    smooth: true,
    lineStyle: { width: 2 },
    symbolSize: 6,
};
