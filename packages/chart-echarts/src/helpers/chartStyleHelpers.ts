import type { DataZoomComponentOption, EChartsOption } from "echarts";
import { IRIS_TOKENS } from "../theme/irisTokens";

const t = IRIS_TOKENS;

export function buildGrid(bottom = "3%"): EChartsOption["grid"] {
    return {
        left: "3%",
        right: "4%",
        bottom,
        containLabel: true,
    };
}

export function buildCategoryAxis(
    data: string[],
    options?: { rotate?: number; boundaryGap?: boolean }
): EChartsOption["xAxis"] {
    return {
        type: "category",
        data,
        boundaryGap: options?.boundaryGap ?? true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
            color: t.textSecondary,
            fontSize: 12,
            fontFamily: t.fontFamily,
            rotate: options?.rotate ?? 0,
            interval: 0,
            overflow: "truncate",
            width: 80,
        },
        splitLine: { show: false },
    };
}

export function buildValueAxis(): EChartsOption["yAxis"] {
    return {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
            color: t.textSecondary,
            fontSize: 12,
            fontFamily: t.fontFamily,
        },
        splitLine: {
            lineStyle: {
                color: t.gridLine,
                type: "dashed",
            },
        },
    };
}

export function buildLegend(
    show: boolean,
    top: number | string,
    data?: string[]
): EChartsOption["legend"] {
    if (!show) {
        return { show: false };
    }

    return {
        show: true,
        top,
        data,
        type: data && data.length > 5 ? "scroll" : "plain",
        textStyle: {
            color: t.textSecondary,
            fontSize: 12,
            fontFamily: t.fontFamily,
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 16,
        icon: "circle",
    };
}

export function buildTooltip(
    show: boolean,
    formatter: (params: unknown) => string,
    trigger: "axis" | "item" = "axis"
): EChartsOption["tooltip"] {
    if (!show) {
        return { show: false };
    }

    return {
        show: true,
        trigger,
        confine: true,
        appendToBody: true,
        axisPointer:
            trigger === "axis"
                ? { type: "shadow", shadowStyle: { color: "rgba(79, 70, 229, 0.08)" } }
                : undefined,
        backgroundColor: t.surface,
        borderColor: t.border,
        borderWidth: 1,
        padding: [8, 12],
        extraCssText:
            "max-width: 280px; white-space: normal; box-shadow: 0 4px 12px rgba(15,23,42,0.12);",
        textStyle: {
            color: t.textPrimary,
            fontSize: 12,
        },
        position: (point, _params, _dom, _rect, size) => {
            const [x, y] = point;
            const [contentWidth, contentHeight] = size.contentSize;
            const [viewWidth, viewHeight] = size.viewSize;
            let left = x + 16;
            let top = y - contentHeight - 12;

            if (top < 8) {
                top = y + 16;
            }
            if (left + contentWidth > viewWidth - 8) {
                left = Math.max(8, x - contentWidth - 16);
            }
            if (top + contentHeight > viewHeight - 8) {
                top = Math.max(8, viewHeight - contentHeight - 8);
            }

            return [left, top];
        },
        formatter,
    };
}

export function buildDataZoomSlider(): DataZoomComponentOption {
    return {
        type: "slider",
        start: 0,
        end: 100,
        bottom: 10,
        height: 18,
        borderColor: t.border,
        backgroundColor: t.surfaceMuted,
        fillerColor: "rgba(79,70,229,0.12)",
        handleStyle: {
            color: t.primary,
            borderColor: t.primary,
        },
        textStyle: {
            color: t.textMuted,
            fontSize: 11,
        },
    };
}

export function buildDataZoomInside(): DataZoomComponentOption {
    return {
        type: "inside",
        start: 0,
        end: 100,
    };
}
