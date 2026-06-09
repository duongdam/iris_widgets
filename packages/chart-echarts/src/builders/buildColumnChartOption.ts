import type { ChartRecord } from "@iris/chart-core";
import type { EChartsOption } from "echarts";
import { getColorPalette } from "../helpers/colorPalette";
import { INTERACTIVE_SERIES_OPTIONS } from "../helpers/chartSeriesOptions";
import {
    buildCategoryAxis,
    buildGrid,
    buildLegend,
    buildTooltip,
    buildValueAxis,
} from "../helpers/chartStyleHelpers";
import { resolveChartTitle, resolveLegendTop } from "../helpers/chartTitleHelpers";
import { defaultTooltipFormatter } from "../helpers/tooltipFormatters";
import { groupByName } from "../transformers/groupByName";
import { getSortedPeriods } from "../transformers/groupByPeriod";
import { getLargeSeriesOptions, shouldDisableAnimation } from "../helpers/performanceHelpers";
import { applySelectionOpacity, columnGroupedPreset } from "../theme/seriesStyles";

import type { ChartDisplayOptions } from "./buildBarChartOption";

export function buildColumnChartOption(records: ChartRecord[], options: ChartDisplayOptions): EChartsOption {
    const periods = getSortedPeriods(records);
    const seriesGroups = groupByName(records);
    const colors = getColorPalette(seriesGroups.length);
    const largeOptions = getLargeSeriesOptions(records);
    const animation = options.animation ?? !shouldDisableAnimation(records);
    const legendTop = resolveLegendTop(options.showTitle);

    const series = seriesGroups.map((group, index) => ({
        name: group.name,
        type: "bar" as const,
        ...INTERACTIVE_SERIES_OPTIONS,
        ...largeOptions,
        ...columnGroupedPreset,
        animation,
        data: applySelectionOpacity(
            periods.map(period => {
                const match = group.records.find(record => record.period === period);
                return match
                    ? { value: match.pm, recordId: match.id, period }
                    : { value: 0, period };
            }),
            options.selectedId
        ),
        itemStyle: {
            ...columnGroupedPreset.itemStyle,
            color: colors[index],
        },
        emphasis: {
            itemStyle: {
                shadowBlur: 6,
                shadowColor: "rgba(79,70,229,0.2)",
            },
        },
    }));

    return {
        title: resolveChartTitle(options.title, options.showTitle),
        tooltip: buildTooltip(options.showTooltip, defaultTooltipFormatter),
        legend: buildLegend(
            options.showLegend,
            legendTop,
            seriesGroups.map(group => group.name)
        ),
        grid: buildGrid(),
        xAxis: buildCategoryAxis(periods),
        yAxis: buildValueAxis(),
        series,
    };
}
