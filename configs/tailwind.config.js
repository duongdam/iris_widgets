const { join } = require("path");

/** @type {import("tailwindcss").Config} */
module.exports = {
    content: [
        join(__dirname, "../widgets/*/src/**/*.{js,jsx,ts,tsx}"),
        join(__dirname, "../packages/chart-ui/src/**/*.{js,jsx,ts,tsx}"),
        join(__dirname, "../mock-ui/src/**/*.{js,jsx,ts,tsx}"),
        join(__dirname, "./widget-styles.scss"),
        join(__dirname, "./chart-design-tokens.scss"),
    ],
    theme: {
        extend: {
            colors: {
                iris: {
                    primary: "var(--iris-primary)",
                    surface: "var(--iris-surface)",
                    "surface-muted": "var(--iris-surface-muted)",
                    border: "var(--iris-border)",
                    "border-strong": "var(--iris-border-strong)",
                    "text-primary": "var(--iris-text-primary)",
                    "text-secondary": "var(--iris-text-secondary)",
                    "text-muted": "var(--iris-text-muted)",
                    "grid-line": "var(--iris-grid-line)",
                    "series-1": "var(--iris-series-1)",
                    "series-2": "var(--iris-series-2)",
                    "series-3": "var(--iris-series-3)",
                    "series-4": "var(--iris-series-4)",
                    "series-5": "var(--iris-series-5)",
                    "series-6": "var(--iris-series-6)",
                    "series-7": "var(--iris-series-7)",
                    "series-8": "var(--iris-series-8)",
                },
            },
            boxShadow: {
                "iris-sm": "var(--iris-shadow-sm)",
                "iris-md": "var(--iris-shadow-md)",
            },
            borderRadius: {
                iris: "var(--iris-radius-lg)",
                "iris-sm": "var(--iris-radius-sm)",
            },
            fontFamily: {
                iris: "var(--iris-font-family)",
            },
        },
    },
    plugins: [],
};
