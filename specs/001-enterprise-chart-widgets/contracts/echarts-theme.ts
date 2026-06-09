/**
 * Contract: ECharts theme registration and style helper fragments.
 *
 * Implementation: packages/chart-echarts/src/theme/
 */

import type { EChartsOption } from "echarts";
import type { ChartDesignTokens } from "./chart-design-tokens";

/** Registered theme name — passed to ReactECharts `theme` prop */
export const IRIS_ECHARTS_THEME_NAME = "iris-enterprise";

/** One-time theme registration (idempotent) */
export interface EChartsThemeRegistrar {
    registerIrisTheme(tokens: ChartDesignTokens): void;
}

/** Reusable ECharts option fragments derived from tokens */
export interface ChartStyleHelpers {
    buildGrid(): EChartsOption["grid"];
    buildCategoryAxis(data: string[], name?: string): EChartsOption["xAxis"];
    buildValueAxis(name?: string): EChartsOption["yAxis"];
    buildLegend(show: boolean, top: number | string, data?: string[]): EChartsOption["legend"];
    buildTooltip(show: boolean, formatter: (params: unknown) => string): EChartsOption["tooltip"];
    buildTitle(text: string | undefined, show: boolean): EChartsOption["title"];
}

/** Per-chart-type series visual presets */
export type ChartStylePreset = "barVertical" | "columnGrouped" | "areaStacked" | "reportCombo";

export interface SeriesStylePreset {
    preset: ChartStylePreset;
    colorIndex: number;
    selectedId?: string;
}

/** Apply selection dimming: selected recordId full opacity, others reduced */
export interface SelectionStyleApplier {
    applySelectionOpacity<T extends { recordId?: string; value?: number }>(
        data: T[],
        selectedId?: string
    ): T[];
}
