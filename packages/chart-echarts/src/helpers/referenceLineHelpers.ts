import type { MarkLineComponentOption } from "echarts";

const REFERENCE_LINE_COLOR = "#EF4444";
const REFERENCE_LINE_ANIMATION_DURATION = 1400;
const REFERENCE_LINE_ANIMATION_DELAY = 400;

export interface ReferenceLineConfig {
    referenceLineValue?: number;
    referenceLineLabel?: string;
}

export function hasReferenceLine(referenceLineValue?: number): boolean {
    return referenceLineValue !== undefined && referenceLineValue !== null;
}

export function resolveReferenceLineLabel(
    referenceLineValue: number | undefined,
    referenceLineLabel?: string
): string {
    return referenceLineLabel?.trim() || String(referenceLineValue ?? "");
}

export function buildReferenceMarkLine(config: ReferenceLineConfig): MarkLineComponentOption | undefined {
    if (!hasReferenceLine(config.referenceLineValue)) {
        return undefined;
    }

    const label = resolveReferenceLineLabel(config.referenceLineValue, config.referenceLineLabel);

    return {
        symbol: ["none", "none"],
        silent: true,
        animation: true,
        animationDuration: REFERENCE_LINE_ANIMATION_DURATION,
        animationDelay: REFERENCE_LINE_ANIMATION_DELAY,
        animationEasing: "cubicOut",
        lineStyle: {
            color: REFERENCE_LINE_COLOR,
            width: 2,
            type: "solid",
        },
        label: {
            show: true,
            position: "end",
            formatter: label,
            color: REFERENCE_LINE_COLOR,
            fontWeight: "bold",
            fontSize: 12,
            backgroundColor: "rgba(255,255,255,0.85)",
            padding: [2, 6],
            borderRadius: 3,
            borderColor: REFERENCE_LINE_COLOR,
            borderWidth: 1,
        },
        data: [{ yAxis: config.referenceLineValue as number, name: label }],
    };
}
