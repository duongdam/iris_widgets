/**
 * Contract: ThemeProvider — antd ConfigProvider wrapper for Gantt chrome.
 */

import type { ReactNode } from "react";

export interface GanttThemeTokens {
    colorPrimary?: string;
    colorBgContainer?: string;
    colorBorder?: string;
    colorText?: string;
    borderRadius?: number;
    fontFamily?: string;
}

export interface ThemeProviderProps {
    children: ReactNode;
    theme?: GanttThemeTokens;
    darkMode?: boolean;
}

export interface ThemeProviderComponent {
    (props: ThemeProviderProps): JSX.Element;
}
