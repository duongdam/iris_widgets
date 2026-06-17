import { ConfigProvider, theme as antdTheme, type ThemeConfig } from "antd";
import { JSX, useMemo, type ReactNode } from "react";

export interface ThemeProviderProps {
    children: ReactNode;
    theme?: ThemeConfig;
    darkMode?: boolean;
}

function buildGanttAntdTheme(darkMode?: boolean): ThemeConfig {
    return {
        token: {
            colorPrimary: "#1677ff",
            colorBgContainer: "#ffffff",
            colorBorder: "#f0f0f0",
            colorText: "#1f1f1f",
            colorTextSecondary: "#595959",
            borderRadius: 6,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        },
        algorithm: darkMode ? [antdTheme.darkAlgorithm] : [antdTheme.defaultAlgorithm]
    };
}

export function ThemeProvider({ children, theme, darkMode }: ThemeProviderProps): JSX.Element {
    const mergedTheme = useMemo(
        () => ({
            ...buildGanttAntdTheme(darkMode),
            ...theme,
            token: { ...buildGanttAntdTheme(darkMode).token, ...theme?.token }
        }),
        [theme, darkMode]
    );

    return <ConfigProvider theme={mergedTheme}>{children}</ConfigProvider>;
}
