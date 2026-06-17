import { ConfigProvider, theme as antdTheme, type ThemeConfig } from "antd";
import { JSX, useMemo, type ReactNode } from "react";

export interface ThemeProviderProps {
    children: ReactNode;
    theme?: ThemeConfig;
    darkMode?: boolean;
}

function buildIrisAntdTheme(darkMode?: boolean): ThemeConfig {
    const primary = darkMode ? "#818cf8" : "#4f46e5";
    const primaryBg = darkMode ? "#312e81" : "#eef2ff";
    const primaryBorder = darkMode ? "#4338ca" : "#c7d2fe";
    const selectedText = darkMode ? "#f8fafc" : "#0f172a";

    return {
        token: {
            colorPrimary: primary,
            colorBgContainer: "var(--iris-surface)",
            colorBorder: "var(--iris-border)",
            colorText: "var(--iris-text-primary)",
            colorTextSecondary: "var(--iris-text-secondary)",
            colorTextDescription: "var(--iris-text-muted)",
            borderRadius: 8,
            fontFamily: "var(--iris-font-family)",
        },
        components: {
            Select: {
                optionSelectedBg: primaryBg,
                optionSelectedColor: selectedText,
                optionActiveBg: darkMode ? "#1e293b" : "#f8fafc",
                multipleItemBg: primaryBg,
                multipleItemBorderColor: primaryBorder,
            },
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
        components: {
            ...irisTheme.components,
            ...customTheme?.components,
        },
        algorithm: customTheme?.algorithm ?? irisTheme.algorithm,
    };
}

export function ThemeProvider({ children, theme, darkMode }: ThemeProviderProps): JSX.Element {
    const mergedTheme = useMemo(() => mergeTheme(theme, darkMode), [theme, darkMode]);

    return <ConfigProvider theme={mergedTheme}>{children}</ConfigProvider>;
}
