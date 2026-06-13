import type { ChartRecord } from "@iris/chart-core";
import type { CallbackDataParams } from "echarts/types/dist/shared";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function formatTooltipValue(value: unknown): string {
    if (typeof value === "number" && Number.isFinite(value)) {
        return numberFormatter.format(value);
    }

    if (value && typeof value === "object" && "value" in value) {
        const nested = (value as { value: unknown }).value;
        if (typeof nested === "number" && Number.isFinite(nested)) {
            return numberFormatter.format(nested);
        }
    }

    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}

function formatTooltipItem(item: CallbackDataParams, includeAxisLabel: boolean): string {
    const seriesName = item.seriesName ?? "";
    const axisLabel =
        includeAxisLabel && "axisValue" in item && item.axisValue != null
            ? String(item.axisValue)
            : item.name != null
              ? String(item.name)
              : "";
    const value = formatTooltipValue(item.value);

    if (seriesName && axisLabel) {
        return `${seriesName}: ${value}`;
    }

    if (seriesName) {
        return `${seriesName}: ${value}`;
    }

    return axisLabel ? `${axisLabel}: ${value}` : `Value: ${value}`;
}

export function formatRecordTooltip(record: ChartRecord): string {
    return `${record.name}<br/>Period: ${record.period}<br/>Value: ${numberFormatter.format(record.pm)}`;
}

export function stackAreaItemTooltipFormatter(params: unknown): string {
    if (!params || typeof params !== "object") {
        return "";
    }

    const p = params as CallbackDataParams;
    const period = p.name ?? (p as { axisValue?: string }).axisValue ?? "";
    const series = p.seriesName ?? "";
    const rawValue = typeof p.value === "number" ? p.value : null;
    const value = rawValue !== null ? numberFormatter.format(rawValue) : "";
    const marker = typeof (p as { marker?: string }).marker === "string"
        ? (p as { marker: string }).marker
        : "●";

    const periodLine = period ? `<strong style="display:block;margin-bottom:4px">${period}</strong>` : "";
    return `${periodLine}${marker} <span style="color:inherit">${series}</span>: <strong>${value}</strong>`;
}

function extractTooltipNumericValue(value: unknown): number {
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

export function stackedColumnTooltipFormatter(params: unknown): string {
    if (!params || !Array.isArray(params)) {
        return defaultTooltipFormatter(params);
    }

    const items = params.filter(
        (item): item is CallbackDataParams => Boolean(item && typeof item === "object")
    );
    if (items.length === 0) {
        return "";
    }

    const axisLabel =
        "axisValue" in items[0] && items[0].axisValue != null ? String(items[0].axisValue) : "";
    const seriesLines = items.map(item => formatTooltipItem(item, false)).filter(Boolean);
    const total = items.reduce((sum, item) => sum + extractTooltipNumericValue(item.value), 0);
    const totalLine = `<strong>Total: ${numberFormatter.format(total)}</strong>`;

    if (axisLabel) {
        return `<strong>${axisLabel}</strong><br/>${seriesLines.join("<br/>")}<br/>${totalLine}`;
    }

    return `${seriesLines.join("<br/>")}<br/>${totalLine}`;
}

export function defaultTooltipFormatter(params: unknown): string {
    if (!params) {
        return "";
    }

    if (Array.isArray(params)) {
        const items = params.filter(
            (item): item is CallbackDataParams => Boolean(item && typeof item === "object")
        );
        if (items.length === 0) {
            return "";
        }

        const axisLabel =
            "axisValue" in items[0] && items[0].axisValue != null
                ? String(items[0].axisValue)
                : "";
        const seriesLines = items.map(item => formatTooltipItem(item, false)).filter(Boolean);

        if (axisLabel) {
            return `<strong>${axisLabel}</strong><br/>${seriesLines.join("<br/>")}`;
        }

        return seriesLines.join("<br/>");
    }

    if (typeof params === "object") {
        return formatTooltipItem(params as CallbackDataParams, true);
    }

    return "";
}
