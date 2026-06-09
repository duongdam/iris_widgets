import { IRIS_TOKENS } from "../theme/irisTokens";

export const CHART_COLORS = [...IRIS_TOKENS.series];

export function getSeriesColor(index: number): string {
    return CHART_COLORS[index % CHART_COLORS.length];
}

export function getColorPalette(count: number): string[] {
    return Array.from({ length: count }, (_, index) => getSeriesColor(index));
}
