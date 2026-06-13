export {
    buildBarChartOption,
    type ChartDisplayOptions,
} from "./builders/buildBarChartOption";
export {
    buildColumnChartOption,
    type ColumnChartOptions,
    type ColumnStackMode,
} from "./builders/buildColumnChartOption";
export { buildStackAreaChartOption } from "./builders/buildStackAreaChartOption";
export {
    buildReportChartOption,
    type ReportChartOptions,
} from "./builders/buildReportChartOption";
export {
    buildNegativeBarChartOption,
    type NegativeBarChartOptions,
} from "./builders/buildNegativeBarChartOption";

export { groupByPeriod, getSortedPeriods } from "./transformers/groupByPeriod";
export { groupByName, getSortedNames } from "./transformers/groupByName";
export { aggregateTotals, type AggregationTotals } from "./transformers/aggregateTotals";

export { buildCategoryAxis, buildValueAxis, sumByField } from "./helpers/axisHelpers";
export { CHART_COLORS, getSeriesColor, getColorPalette } from "./helpers/colorPalette";
export {
    formatRecordTooltip,
    defaultTooltipFormatter,
    stackedColumnTooltipFormatter,
    stackAreaItemTooltipFormatter,
} from "./helpers/tooltipFormatters";
export {
    buildGrid,
    buildLegend,
    buildTooltip,
    buildDataZoomSlider,
    buildDataZoomInside,
} from "./helpers/chartStyleHelpers";

export { IRIS_TOKENS, IRIS_ECHARTS_THEME_NAME } from "./theme/irisTokens";
export { registerIrisTheme } from "./theme/irisEchartsTheme";
export {
    applySelectionOpacity,
    buildBarGradient,
    barVerticalPreset,
    columnGroupedPreset,
    columnStackedPreset,
    buildColumnBarPreset,
    buildAreaSeriesStyle,
} from "./theme/seriesStyles";
export {
    buildReferenceMarkLine,
    hasReferenceLine,
    resolveReferenceLineLabel,
    type ReferenceLineConfig,
} from "./helpers/referenceLineHelpers";
