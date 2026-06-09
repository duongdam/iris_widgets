import type { CallbackDataParams } from "echarts/types/dist/shared";
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
import { aggregateTotals } from "../transformers/aggregateTotals";
import { getSortedPeriods } from "../transformers/groupByPeriod";
import { getSortedNames } from "../transformers/groupByName";
import { IRIS_TOKENS } from "../theme/irisTokens";
import {
    applySelectionOpacity,
    buildBarGradient,
    reportComboBarPreset,
    reportComboLinePreset,
} from "../theme/seriesStyles";

import type { ChartDisplayOptions } from "./buildBarChartOption";

export interface ReportChartOptions extends ChartDisplayOptions {
    aggregationMode: "period" | "name" | "both";
    showGrandTotal: boolean;
    drilldownEnabled: boolean;
}

export function buildReportChartOption(records: ChartRecord[], options: ReportChartOptions): EChartsOption {
    const totals = aggregateTotals(records);
    const periods = getSortedNames(records);
    const periodKeys = getSortedPeriods(records);
    const legendTop = resolveLegendTop(options.showTitle);

    const primaryCategories =
        options.aggregationMode === "name"
            ? periods
            : options.aggregationMode === "period"
              ? periodKeys
              : periodKeys;

    const primaryData = primaryCategories.map(key => {
        const value =
            options.aggregationMode === "name"
                ? (totals.byName.get(key) ?? 0)
                : (totals.byPeriod.get(key) ?? 0);
        const record =
            options.aggregationMode === "name"
                ? records.find(item => item.name === key)
                : records.find(item => item.period === key);
        return { value, key, recordId: record?.id };
    });

    const barData = applySelectionOpacity(
        primaryData.map(item => ({
            value: item.value,
            recordId: item.recordId,
            key: item.key,
        })),
        options.selectedId
    );

    const cumulativeData = primaryData.reduce<number[]>((acc, item) => {
        const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
        acc.push(prev + item.value);
        return acc;
    }, []);

    const markPoint = options.showGrandTotal
        ? {
              data: [
                  {
                      name: "Grand Total",
                      coord: [primaryCategories.length - 1, totals.grandTotal],
                      value: totals.grandTotal,
                      itemStyle: { color: IRIS_TOKENS.primary },
                  },
              ],
          }
        : undefined;

    return {
        title: resolveChartTitle(options.title, options.showTitle),
        tooltip: buildTooltip(options.showTooltip, defaultTooltipFormatter),
        legend: buildLegend(options.showLegend, legendTop, ["Total", "Cumulative"]),
        grid: buildGrid(),
        xAxis: buildCategoryAxis(primaryCategories),
        yAxis: buildValueAxis(),
        series: [
            {
                type: "bar",
                name: "Total",
                ...INTERACTIVE_SERIES_OPTIONS,
                ...reportComboBarPreset,
                data: barData,
                itemStyle: buildBarGradient(0),
                markPoint,
                label: {
                    show: true,
                    position: "top",
                    color: IRIS_TOKENS.textSecondary,
                    fontSize: 11,
                    formatter: (params: CallbackDataParams) => {
                        const value = typeof params.value === "number" ? params.value : Number(params.value);
                        return Number.isFinite(value) ? value.toLocaleString() : "";
                    },
                },
            },
            {
                type: "line",
                name: "Cumulative",
                ...reportComboLinePreset,
                data: cumulativeData,
                itemStyle: { color: getColorPalette(2)[1] },
            },
        ],
        ...(options.drilldownEnabled
            ? {
                  graphic: [
                      {
                          type: "text",
                          left: "center",
                          bottom: 0,
                          style: {
                              text: "Drilldown enabled",
                              fill: IRIS_TOKENS.textMuted,
                              fontSize: 12,
                              fontFamily: IRIS_TOKENS.fontFamily,
                          },
                      },
                  ],
              }
            : {}),
    };
}
