/**
 * Contract: ChartDesignTokens — shared visual constants for Iris chart suite.
 *
 * Source of truth: configs/chart-design-tokens.scss
 * TypeScript mirror: packages/chart-echarts/src/theme/irisTokens.ts (implementation)
 */

/** Semantic color and layout tokens */
export interface ChartDesignTokens {
    /** Brand primary — selection emphasis, active states */
    primary: string;
    /** Card background */
    surface: string;
    /** Empty/loading background */
    surfaceMuted: string;
    /** Default container border */
    border: string;
    /** Hover/focus border */
    borderStrong: string;
    /** Title and primary text */
    textPrimary: string;
    /** Axis labels, subtitles */
    textSecondary: string;
    /** Placeholder, disabled text */
    textMuted: string;
    /** ECharts grid splitLine color */
    gridLine: string;
    /** Container box-shadow */
    shadowSm: string;
    /** Tooltip box-shadow */
    shadowMd: string;
    /** Container border-radius */
    radiusLg: string;
    /** Bar/column top border-radius */
    radiusSm: string;
    /** Font family stack */
    fontFamily: string;
    /** Categorical series colors (index 0–7) */
    series: readonly [string, string, string, string, string, string, string, string];
}

/** Read tokens from CSS custom properties at runtime (browser only) */
export interface ChartTokenReader {
    (): ChartDesignTokens;
}

/** Default light-theme token values (fallback when CSS vars unavailable, e.g. SSR/preview) */
export const DEFAULT_CHART_TOKENS: ChartDesignTokens = {
    primary: "#4F46E5",
    surface: "#FFFFFF",
    surfaceMuted: "#F8FAFC",
    border: "#E2E8F0",
    borderStrong: "#CBD5E1",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
    gridLine: "#F1F5F9",
    shadowSm: "0 1px 3px rgba(15,23,42,0.08)",
    shadowMd: "0 4px 12px rgba(15,23,42,0.10)",
    radiusLg: "12px",
    radiusSm: "4px",
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    series: ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"],
};
