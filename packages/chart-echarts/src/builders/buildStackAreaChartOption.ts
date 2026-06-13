import type { ChartRecord } from "@iris/chart-core";
import type { EChartsOption } from "echarts";
import { INTERACTIVE_SERIES_OPTIONS } from "../helpers/chartSeriesOptions";
import {
    buildCategoryAxis,
    buildDataZoomInside,
    buildDataZoomSlider,
    buildGrid,
    buildLegend,
    buildTooltip,
    buildValueAxis,
} from "../helpers/chartStyleHelpers";
import { resolveChartTitle, resolveLegendTop } from "../helpers/chartTitleHelpers";
import { stackAreaItemTooltipFormatter } from "../helpers/tooltipFormatters";
import { buildReferenceMarkLine } from "../helpers/referenceLineHelpers";
import { groupByName } from "../transformers/groupByName";
import { getSortedPeriods } from "../transformers/groupByPeriod";
import { shouldDisableAnimation } from "../helpers/performanceHelpers";
import { applySelectionOpacity, buildAreaSeriesStyle } from "../theme/seriesStyles";

import type { ChartDisplayOptions } from "./buildBarChartOption";

const SAMPLING_THRESHOLD = 1000;

export function buildStackAreaChartOption(records: ChartRecord[], options: ChartDisplayOptions): EChartsOption {
    const animation = options.animation ?? !shouldDisableAnimation(records);
    const useSampling = records.length >= SAMPLING_THRESHOLD;
    const periods = getSortedPeriods(records);
    const seriesGroups = groupByName(records);
    const legendTop = resolveLegendTop(options.showTitle);
    const referenceMarkLine = buildReferenceMarkLine({
        referenceLineValue: options.referenceLineValue,
        referenceLineLabel: options.referenceLineLabel,
    });

    const stackedSeries = seriesGroups.map((group, index) => ({
        name: group.name,
        type: "line" as const,
        stack: "total",
        sampling: useSampling ? ("lttb" as const) : undefined,
        ...INTERACTIVE_SERIES_OPTIONS,
        ...buildAreaSeriesStyle(index),
        ...(index === 0 && referenceMarkLine ? { markLine: referenceMarkLine } : {}),
        data: applySelectionOpacity(
            periods.map(period => {
                const match = group.records.find(record => record.period === period);
                return match
                    ? { value: match.pm, recordId: match.id, period }
                    : { value: 0, period };
            }),
            options.selectedId
        ),
    }));

    const legendNames = seriesGroups.map(g => g.name);

    return {
        animation,
        title: resolveChartTitle(options.title, options.showTitle),
        tooltip: buildTooltip(options.showTooltip, stackAreaItemTooltipFormatter, "item"),
        legend: buildLegend(options.showLegend, legendTop, legendNames),
        grid: buildGrid("15%"),
        xAxis: buildCategoryAxis(periods, { boundaryGap: false }),
        yAxis: buildValueAxis(),
        dataZoom: [buildDataZoomInside(), buildDataZoomSlider()],
        series: stackedSeries,
    };
}
