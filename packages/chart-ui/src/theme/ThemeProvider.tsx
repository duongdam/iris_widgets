import { ConfigProvider, theme as antdTheme, type ThemeConfig } from "antd";
import { useMemo, type ReactNode } from "react";

export interface ThemeProviderProps {
    children: ReactNode;
    theme?: ThemeConfig;
    darkMode?: boolean;
}

function buildIrisAntdTheme(darkMode?: boolean): ThemeConfig {
    return {
        token: {
            colorPrimary: "var(--iris-primary)",
            colorBgContainer: "var(--iris-surface)",
            colorBorder: "var(--iris-border)",
            colorText: "var(--iris-text-primary)",
            colorTextSecondary: "var(--iris-text-secondary)",
            colorTextDescription: "var(--iris-text-muted)",
            borderRadius: 8,
            fontFamily: "var(--iris-font-family)",
        },
        algorithm: darkMode ? [antdTheme.darkAlgorithm] : [antdTheme.defaultAlgorithm],
    };
}

function mergeTheme(customTheme?: ThemeConfig, darkMode?: boolean): ThemeConfig {
    const irisTheme = buildIrisAntdTheme(darkMode);

    return {
        ...irisTheme,
        ...customTheme,
        token: {
            ...irisTheme.token,
            ...customTheme?.token,
        },
        algorithm: customTheme?.algorithm ?? irisTheme.algorithm,
    };
}

export function ThemeProvider({ children, theme, darkMode }: ThemeProviderProps): JSX.Element {
    const mergedTheme = useMemo(() => mergeTheme(theme, darkMode), [theme, darkMode]);

    return <ConfigProvider theme={mergedTheme}>{children}</ConfigProvider>;
}
