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
import { defaultTooltipFormatter } from "../helpers/tooltipFormatters";
import { groupByName } from "../transformers/groupByName";
import { getSortedPeriods } from "../transformers/groupByPeriod";
import { shouldDisableAnimation } from "../helpers/performanceHelpers";
import { applySelectionOpacity, buildAreaSeriesStyle } from "../theme/seriesStyles";

import type { ChartDisplayOptions } from "./buildBarChartOption";

const SAMPLING_THRESHOLD = 1000;
const REFERENCE_LINE_COLOR = "#EF4444";
const REFERENCE_LINE_ANIMATION_DURATION = 1400;
const REFERENCE_LINE_ANIMATION_DELAY = 400;

export function buildStackAreaChartOption(records: ChartRecord[], options: ChartDisplayOptions): EChartsOption {
    const animation = options.animation ?? !shouldDisableAnimation(records);
    const useSampling = records.length >= SAMPLING_THRESHOLD;
    const periods = getSortedPeriods(records);
    const seriesGroups = groupByName(records);
    const legendTop = resolveLegendTop(options.showTitle);
    const hasReferenceLine =
        options.referenceLineValue !== undefined && options.referenceLineValue !== null;
    const refLineLabel = options.referenceLineLabel?.trim() || String(options.referenceLineValue ?? "");

    const stackedSeries = seriesGroups.map((group, index) => ({
        name: group.name,
        type: "line" as const,
        stack: "total",
        sampling: useSampling ? ("lttb" as const) : undefined,
        ...INTERACTIVE_SERIES_OPTIONS,
        ...buildAreaSeriesStyle(index),
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

    const referenceSeries = hasReferenceLine
        ? [
              {
                  name: refLineLabel,
                  type: "line" as const,
                  data: periods.map(() => options.referenceLineValue as number),
                  symbol: "none" as const,
                  silent: true,
                  animation: true,
                  animationDuration: REFERENCE_LINE_ANIMATION_DURATION,
                  animationDelay: REFERENCE_LINE_ANIMATION_DELAY,
                  animationEasing: "cubicOut" as const,
                  lineStyle: {
                      color: REFERENCE_LINE_COLOR,
                      width: 2,
                      type: "solid" as const,
                  },
                  itemStyle: {
                      color: REFERENCE_LINE_COLOR,
                  },
                  endLabel: {
                      show: true,
                      formatter: `{c}`,
                      color: REFERENCE_LINE_COLOR,
                      fontWeight: "bold" as const,
                      fontSize: 12,
                      backgroundColor: "rgba(255,255,255,0.85)",
                      padding: [2, 6],
                      borderRadius: 3,
                      borderColor: REFERENCE_LINE_COLOR,
                      borderWidth: 1,
                  },
                  tooltip: { show: false },
              },
          ]
        : [];

    const legendNames = [
        ...seriesGroups.map(g => g.name),
        ...(hasReferenceLine ? [refLineLabel] : []),
    ];

    return {
        animation,
        title: resolveChartTitle(options.title, options.showTitle),
        tooltip: buildTooltip(options.showTooltip, defaultTooltipFormatter),
        legend: buildLegend(options.showLegend, legendTop, legendNames),
        grid: buildGrid("15%"),
        xAxis: buildCategoryAxis(periods, { boundaryGap: false }),
        yAxis: buildValueAxis(),
        dataZoom: [buildDataZoomInside(), buildDataZoomSlider()],
        series: [...stackedSeries, ...referenceSeries],
    };
}
