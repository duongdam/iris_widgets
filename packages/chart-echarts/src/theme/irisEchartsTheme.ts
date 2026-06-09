import * as echarts from "echarts";
import { IRIS_ECHARTS_THEME_NAME, IRIS_TOKENS } from "./irisTokens";

let registered = false;

export function registerIrisTheme(): void {
    if (registered) {
        return;
    }

    const t = IRIS_TOKENS;

    echarts.registerTheme(IRIS_ECHARTS_THEME_NAME, {
        color: [...t.series],
        backgroundColor: "transparent",
        textStyle: {
            fontFamily: t.fontFamily,
            color: t.textPrimary,
        },
        title: {
            textStyle: {
                color: t.textPrimary,
                fontSize: 15,
                fontWeight: 600,
            },
        },
        legend: {
            textStyle: {
                color: t.textSecondary,
            },
        },
        tooltip: {
            backgroundColor: t.surface,
            borderColor: t.border,
            textStyle: {
                color: t.textPrimary,
            },
        },
        categoryAxis: {
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: t.textSecondary },
            splitLine: { show: false },
        },
        valueAxis: {
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: t.textSecondary },
            splitLine: {
                lineStyle: { color: t.gridLine, type: "dashed" },
            },
        },
    });

    registered = true;
}
