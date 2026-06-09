/**
 * Contract: ECharts option builders — all ECharts config lives here.
 */

import type { EChartsOption } from "echarts";
import type { ChartRecord } from "./chart-record";

export interface ChartDisplayOptions {
    title?: string;
    showLegend: boolean;
    showTooltip: boolean;
    height: number;
    selectedId?: string;
    animation?: boolean;
}

export interface ReportChartOptions extends ChartDisplayOptions {
    aggregationMode: "period" | "name" | "both";
    showGrandTotal: boolean;
    drilldownEnabled: boolean;
}

export interface BarChartBuilder {
    (records: ChartRecord[], options: ChartDisplayOptions): EChartsOption;
}

export interface ColumnChartBuilder {
    (records: ChartRecord[], options: ChartDisplayOptions): EChartsOption;
}

export interface StackAreaChartBuilder {
    (records: ChartRecord[], options: ChartDisplayOptions): EChartsOption;
}

export interface ReportChartBuilder {
    (records: ChartRecord[], options: ReportChartOptions): EChartsOption;
}

export declare const buildBarChartOption: BarChartBuilder;
export declare const buildColumnChartOption: ColumnChartBuilder;
export declare const buildStackAreaChartOption: StackAreaChartBuilder;
export declare const buildReportChartOption: ReportChartBuilder;
