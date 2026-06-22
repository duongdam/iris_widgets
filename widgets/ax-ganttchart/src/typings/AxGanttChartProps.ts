import type { DynamicValue } from "mendix";
import type { Big } from "big.js";

export type { AxGanttChartContainerProps, AxGanttChartPreviewProps } from "../../typings/AxGanttChartProps";

import type { AxGanttChartContainerProps } from "../../typings/AxGanttChartProps";

/** Runtime widget props (alias for generated container props). */
export type AxGanttChartProps = AxGanttChartContainerProps;

export function readDynamicBoolean(value: DynamicValue<boolean>, fallback: boolean): boolean {
    if (value.status !== "available" || value.value == null) {
        return fallback;
    }

    return value.value;
}

export function readDynamicString(value: DynamicValue<string>, fallback: string): string {
    if (value.status !== "available" || value.value == null) {
        return fallback;
    }

    return value.value;
}

export function readDynamicNumber(value: DynamicValue<Big>, fallback: number): number {
    if (value.status !== "available" || value.value == null) {
        return fallback;
    }

    const raw = value.value;
    const numeric =
        typeof raw === "object" && raw !== null && "toNumber" in raw && typeof raw.toNumber === "function"
            ? raw.toNumber()
            : Number(raw);

    return Number.isFinite(numeric) ? numeric : fallback;
}

export function readWidgetHeight(props: AxGanttChartContainerProps, fallback = 600): number {
    return readDynamicNumber(props.height, fallback);
}

export function readWidgetViewMode(props: AxGanttChartContainerProps, fallback = "month"): string {
    return readDynamicString(props.defaultViewMode, fallback).toLowerCase();
}
