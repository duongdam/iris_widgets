import type { ChartRecord } from "@iris/chart-core";
import type { EChartsOption } from "echarts";
import { INTERACTIVE_SERIES_OPTIONS } from "../helpers/chartSeriesOptions";
import {
    buildCategoryAxis,
    buildGrid,
    buildLegend,
    buildTooltip,
    buildValueAxis,
} from "../helpers/chartStyleHelpers";
import { defaultTooltipFormatter } from "../helpers/tooltipFormatters";
import { resolveChartTitle, resolveLegendTop } from "../helpers/chartTitleHelpers";
import { getLargeSeriesOptions, shouldDisableAnimation } from "../helpers/performanceHelpers";
import {
    applySelectionOpacity,
    barVerticalPreset,
    buildBarGradient,
} from "../theme/seriesStyles";

export interface ChartDisplayOptions {
    title?: string;
    showTitle: boolean;
    showLegend: boolean;
    showTooltip: boolean;
    height: number;
    selectedId?: string;
    animation?: boolean;
}

export function buildBarChartOption(records: ChartRecord[], options: ChartDisplayOptions): EChartsOption {
    const sortedRecords = [...records].sort(
        (left, right) => left.name.localeCompare(right.name) || left.period.localeCompare(right.period)
    );
    const labels = sortedRecords.map(record => `${record.name} (${record.period})`);
    const rawData = sortedRecords.map(record => ({
        value: record.pm,
        recordId: record.id,
        name: record.name,
        period: record.period,
    }));
    const data = applySelectionOpacity(rawData, options.selectedId);

    const largeOptions = getLargeSeriesOptions(records);
    const animation = options.animation ?? !shouldDisableAnimation(records);
    const legendTop = resolveLegendTop(options.showTitle);

    return {
        title: resolveChartTitle(options.title, options.showTitle),
        tooltip: buildTooltip(options.showTooltip, defaultTooltipFormatter),
        legend: buildLegend(options.showLegend, legendTop),
        grid: buildGrid(labels.length > 8 ? "15%" : "3%"),
        xAxis: buildCategoryAxis(labels, { rotate: labels.length > 8 ? 45 : 0 }),
        yAxis: buildValueAxis(),
        series: [
            {
                type: "bar",
                data,
                ...INTERACTIVE_SERIES_OPTIONS,
                ...largeOptions,
                ...barVerticalPreset,
                animation,
                itemStyle: buildBarGradient(0),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 8,
                        shadowColor: "rgba(79,70,229,0.25)",
                    },
                },
            },
        ],
    };
}
