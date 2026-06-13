import type { ChartRecord } from "@iris/chart-core";
import type { BarSeriesOption, EChartsOption } from "echarts";
import type { CallbackDataParams } from "echarts/types/dist/shared";
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
import { defaultTooltipFormatter, stackedColumnTooltipFormatter } from "../helpers/tooltipFormatters";
import { buildReferenceMarkLine } from "../helpers/referenceLineHelpers";
import { groupByName } from "../transformers/groupByName";
import { getSortedPeriods } from "../transformers/groupByPeriod";
import { getLargeSeriesOptions, shouldDisableAnimation } from "../helpers/performanceHelpers";
import { applySelectionOpacity, buildColumnBarPreset } from "../theme/seriesStyles";

import type { ChartDisplayOptions } from "./buildBarChartOption";

export type ColumnStackMode = "grouped" | "stacked";

export interface ColumnChartOptions extends ChartDisplayOptions {
    stackMode?: ColumnStackMode;
    columnWidthPercent?: number;
    showSeriesLabels?: boolean;
}

const DEFAULT_COLUMN_WIDTH_PERCENT = 70;

function extractBarLabelValue(value: CallbackDataParams["value"]): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (value && typeof value === "object" && "value" in value) {
        const nested = (value as { value: unknown }).value;
        if (typeof nested === "number" && Number.isFinite(nested)) {
            return nested;
        }
    }

    return 0;
}

function buildSeriesLabelOptions(
    showSeriesLabels: boolean,
    isStacked: boolean
): BarSeriesOption["label"] {
    if (!showSeriesLabels) {
        return { show: false };
    }

    return {
        show: true,
        formatter: (params: CallbackDataParams) => {
            const rawValue = extractBarLabelValue(params.value);
            if (!rawValue) {
                return "";
            }
            return params.seriesName ?? "";
        },
        position: isStacked ? "inside" : "top",
        color: isStacked ? "#fff" : undefined,
        fontSize: 11,
        fontWeight: 500,
    };
}

export function buildColumnChartOption(records: ChartRecord[], options: ColumnChartOptions): EChartsOption {
    const stackMode = options.stackMode ?? "grouped";
    const isStacked = stackMode === "stacked";
    const columnWidthPercent = options.columnWidthPercent ?? DEFAULT_COLUMN_WIDTH_PERCENT;
    const showSeriesLabels = options.showSeriesLabels ?? false;
    const periods = getSortedPeriods(records);
    const seriesGroups = groupByName(records);
    const colors = getColorPalette(seriesGroups.length);
    const largeOptions = getLargeSeriesOptions(records);
    const animation = options.animation ?? !shouldDisableAnimation(records);
    const legendTop = resolveLegendTop(options.showTitle);
    const seriesPreset = buildColumnBarPreset({ columnWidthPercent, isStacked });
    const seriesLabel = buildSeriesLabelOptions(showSeriesLabels, isStacked);
    const referenceMarkLine = buildReferenceMarkLine({
        referenceLineValue: options.referenceLineValue,
        referenceLineLabel: options.referenceLineLabel,
    });

    const series = seriesGroups.map((group, index) => ({
        name: group.name,
        type: "bar" as const,
        ...(isStacked ? { stack: "total" as const } : {}),
        ...INTERACTIVE_SERIES_OPTIONS,
        ...largeOptions,
        ...seriesPreset,
        animation,
        label: seriesLabel,
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
        itemStyle: {
            ...(seriesPreset.itemStyle ?? {}),
            color: colors[index],
        },
        emphasis: isStacked
            ? { focus: "series" as const }
            : {
                  itemStyle: {
                      shadowBlur: 6,
                      shadowColor: "rgba(79,70,229,0.2)",
                  },
              },
    }));

    const legendNames = seriesGroups.map(group => group.name);

    return {
        title: resolveChartTitle(options.title, options.showTitle),
        tooltip: buildTooltip(
            options.showTooltip,
            isStacked ? stackedColumnTooltipFormatter : defaultTooltipFormatter
        ),
        legend: buildLegend(options.showLegend, legendTop, legendNames),
        grid: buildGrid(),
        xAxis: buildCategoryAxis(periods),
        yAxis: buildValueAxis(),
        series,
    };
}
