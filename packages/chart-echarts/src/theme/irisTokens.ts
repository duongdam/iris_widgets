/** TypeScript mirror of configs/chart-design-tokens.scss — keep values in sync */

export interface IrisChartTokens {
    primary: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    borderStrong: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    gridLine: string;
    shadowSm: string;
    shadowMd: string;
    radiusLg: string;
    radiusSm: string;
    fontFamily: string;
    series: readonly [string, string, string, string, string, string, string, string];
}

export const IRIS_TOKENS: IrisChartTokens = {
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

export const IRIS_ECHARTS_THEME_NAME = "iris-enterprise";
