import type { ChartRecord } from "@iris/chart-core";
import type { EChartsOption } from "echarts";
import {
    buildGrid,
    buildValueAxis,
} from "../helpers/chartStyleHelpers";
import { resolveChartTitle, resolveLegendTop } from "../helpers/chartTitleHelpers";
import { IRIS_TOKENS } from "../theme/irisTokens";
import { shouldDisableAnimation } from "../helpers/performanceHelpers";

const COLOR_ABOVE = "#10B981";
const COLOR_BELOW = "#EF4444";
const BASELINE_COLOR = "#94A3B8";

export interface NegativeBarChartOptions {
    title?: string;
    showTitle: boolean;
    showLegend: boolean;
    showTooltip: boolean;
    height: number;
    baselineValue?: number;
    baselineLabel?: string;
    animation?: boolean;
}

const LEGEND_ITEMS = [
    { name: "Above baseline", icon: "rect" },
    { name: "Below baseline", icon: "rect" },
];

function buildNegativeLegend(show: boolean, top: number | string): EChartsOption["legend"] {
    if (!show) return { show: false };
    return {
        show: true,
        top,
        data: LEGEND_ITEMS,
        textStyle: {
            color: IRIS_TOKENS.textSecondary,
            fontSize: 12,
            fontFamily: IRIS_TOKENS.fontFamily,
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 16,
    };
}

function buildNegativeTooltip(show: boolean, baseline: number): EChartsOption["tooltip"] {
    if (!show) return { show: false };
    return {
        show: true,
        trigger: "axis" as const,
        confine: true,
        appendToBody: true,
        axisPointer: { type: "shadow" as const },
        backgroundColor: IRIS_TOKENS.surface,
        borderColor: IRIS_TOKENS.border,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: IRIS_TOKENS.textPrimary, fontSize: 12 },
        formatter: (params: unknown) => {
            const items = params as Array<{ name: string; value: number; marker: string }>;
            if (!items?.length) return "";
            const { name, value, marker } = items[0];
            const diff = value - baseline;
            const sign = diff >= 0 ? "+" : "";
            return `${marker}<strong>${name}</strong><br/>Value: <strong>${value}</strong><br/>vs baseline: <strong style="color:${diff >= 0 ? COLOR_ABOVE : COLOR_BELOW}">${sign}${diff.toFixed(1)}</strong>`;
        },
    };
}

export function buildNegativeBarChartOption(
    records: ChartRecord[],
    options: NegativeBarChartOptions
): EChartsOption {
    const animation = options.animation ?? !shouldDisableAnimation(records);
    const baseline = options.baselineValue ?? 0;
    const legendTop = resolveLegendTop(options.showTitle);

    const sortedRecords = [...records].sort(
        (a, b) => a.period.localeCompare(b.period) || a.name.localeCompare(b.name)
    );

    const categories = sortedRecords.map(r =>
        r.period ? `${r.name}\n${r.period}` : r.name
    );

    const barData = sortedRecords.map(r => {
        const diff = r.pm - baseline;
        const diffLabel = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}`;
        return {
            value: r.pm,
            recordId: r.id,
            itemStyle: {
                color: r.pm >= baseline ? COLOR_ABOVE : COLOR_BELOW,
                borderRadius: r.pm >= baseline ? [4, 4, 0, 0] : [0, 0, 4, 4],
            },
            label: {
                show: true,
                position: r.pm >= baseline ? ("top" as const) : ("bottom" as const),
                color: r.pm >= baseline ? COLOR_ABOVE : COLOR_BELOW,
                fontSize: 11,
                fontWeight: "bold" as const,
                formatter: diffLabel,
            },
        };
    });

    return {
        animation,
        title: resolveChartTitle(options.title, options.showTitle),
        tooltip: buildNegativeTooltip(options.showTooltip, baseline),
        legend: buildNegativeLegend(options.showLegend, legendTop),
        grid: buildGrid("18%"),
        xAxis: {
            type: "category",
            data: categories,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: IRIS_TOKENS.textSecondary,
                fontSize: 11,
                fontFamily: IRIS_TOKENS.fontFamily,
                interval: 0,
                overflow: "truncate",
                width: 80,
            },
            splitLine: { show: false },
        },
        yAxis: {
            ...buildValueAxis(),
            min: (v: { min: number }) =>
                Math.min(v.min, baseline) - Math.abs(baseline) * 0.15,
            max: (v: { max: number }) =>
                Math.max(v.max, baseline) + Math.abs(Math.max(v.max, baseline)) * 0.15,
        },
        series: [
            {
                type: "bar",
                barMaxWidth: 48,
                data: barData,
                markLine: {
                    silent: true,
                    symbol: "none",
                    animation: false,
                    data: [
                        {
                            yAxis: baseline,
                            name: options.baselineLabel || `Baseline: ${baseline}`,
                            lineStyle: {
                                color: BASELINE_COLOR,
                                type: "dashed",
                                width: 1.5,
                            },
                            label: {
                                show: true,
                                position: "insideEndTop",
                                formatter: options.baselineLabel || `Baseline: ${baseline}`,
                                color: BASELINE_COLOR,
                                fontSize: 11,
                            },
                        },
                    ],
                },
            },
        ],
    };
}
