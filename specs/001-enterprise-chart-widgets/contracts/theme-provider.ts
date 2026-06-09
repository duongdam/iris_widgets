/**
 * Contract: ThemeProvider — Ant Design ConfigProvider wrapper with Iris token sync.
 */

import type { ReactNode } from "react";
import type { ThemeConfig } from "antd";
import type { ChartDesignTokens } from "./chart-design-tokens";

export interface ThemeProviderProps {
    children: ReactNode;
    /** Ant Design token overrides */
    theme?: ThemeConfig;
    /** Enable dark mode algorithm */
    darkMode?: boolean;
    /** Optional explicit tokens; defaults to CSS var reader or DEFAULT_CHART_TOKENS */
    chartTokens?: ChartDesignTokens;
}

export interface ThemeProviderComponent {
    (props: ThemeProviderProps): JSX.Element;
}

/**
 * Maps ChartDesignTokens to Ant Design ConfigProvider token overrides
 * so Empty, Spin, and future Ant components match chart shell styling.
 */
export interface AntdTokenMapper {
    mapChartTokensToAntd(tokens: ChartDesignTokens, darkMode?: boolean): ThemeConfig;
}
