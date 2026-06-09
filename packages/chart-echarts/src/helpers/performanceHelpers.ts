import type { ChartRecord } from "@iris/chart-core";

/** Enable ECharts large-mode rendering at 5,000+ records. */
export const LARGE_DATA_THRESHOLD = 5000;

/** Disable chart animation above 1,000 records to avoid initial-render jank. */
export const ANIMATION_DISABLE_THRESHOLD = 1000;

export const PROGRESSIVE_CHUNK_SIZE = 400;
export const PROGRESSIVE_THRESHOLD = 3000;

export function shouldUseLargeMode(records: ChartRecord[]): boolean {
    return records.length >= LARGE_DATA_THRESHOLD;
}

export function shouldDisableAnimation(records: ChartRecord[]): boolean {
    return records.length >= ANIMATION_DISABLE_THRESHOLD;
}

export function getLargeSeriesOptions(records: ChartRecord[]): {
    large?: boolean;
    progressive?: number;
    progressiveThreshold?: number;
} {
    const large = shouldUseLargeMode(records);
    if (!large) {
        return {};
    }
    return {
        large: true,
        progressive: PROGRESSIVE_CHUNK_SIZE,
        progressiveThreshold: PROGRESSIVE_THRESHOLD,
    };
}
