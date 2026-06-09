export function resolveChartTitle(
    title: string | undefined,
    showTitle: boolean
): { text: string; left: "center" } | undefined {
    if (!showTitle || !title) {
        return undefined;
    }

    return { text: title, left: "center" };
}

export function resolveLegendTop(showTitle: boolean): number {
    return showTitle ? 30 : 0;
}
