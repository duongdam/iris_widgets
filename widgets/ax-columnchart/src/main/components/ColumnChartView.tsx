import { buildColumnChartOption, getSortedPeriods, IRIS_ECHARTS_THEME_NAME, registerIrisTheme } from "@iris/chart-echarts";
import {
    ChartContainer,
    ChartEmptyState,
    ChartLoadingOverlay,
    DeferredChartMount,
    useChartData,
    useChartPointerEvents,
    useSelectionSync,
} from "@iris/chart-ui";
import ReactECharts from "echarts-for-react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import type { AxColumnChartProps } from "../../typings/AxColumnChartProps";
import { useColumnChartContext } from "../providers/ColumnChartProvider";

export interface ColumnChartViewProps {
    widgetProps: AxColumnChartProps;
}

export const ColumnChartView = observer(function ColumnChartView({
    widgetProps,
}: ColumnChartViewProps): JSX.Element {
    const { store, bridge } = useColumnChartContext();
    const jsonData = widgetProps.jsonData.value ?? "";

    const { error, isEmpty } = useChartData(store, jsonData, widgetProps.dataFormat);

    useSelectionSync({
        store,
        selectedId: widgetProps.selectedId,
        selectedName: widgetProps.selectedName,
        selectedPayload: widgetProps.selectedPayload,
        bridge,
    });

    const option = useMemo(
        () =>
            buildColumnChartOption(store.records, {
                title: widgetProps.title,
                showTitle: widgetProps.showTitle,
                showLegend: widgetProps.showLegend,
                showTooltip: widgetProps.showTooltip,
                height: widgetProps.height,
                selectedId: store.selectedRecord?.id,
            }),
        [
            store.records,
            widgetProps.title,
            widgetProps.showTitle,
            widgetProps.showLegend,
            widgetProps.showTooltip,
            widgetProps.height,
            store.selectedRecord?.id,
        ]
    );

    const periods = useMemo(() => getSortedPeriods(store.records), [store.records]);

    useEffect(() => {
        registerIrisTheme();
    }, []);

    const { chartRef, onChartReady } = useChartPointerEvents(store, bridge, { periods });

    useEffect(() => {
        if (!store.loading && store.records.length > 0) {
            bridge.handleReady(store.records.length);
        }
    }, [store.loading, store.records.length, bridge]);

    useEffect(() => {
        if (!store.loading) {
            bridge.handleRefresh(store.records.length);
        }
    }, [jsonData, store.loading, store.records.length, bridge]);

    const emptyMessage =
        error === "parse-error"
            ? "Invalid JSON data"
            : error === "format-mismatch"
              ? "Data format does not match selected format"
              : "No chart data available";

    return (
        <ChartContainer
            title={widgetProps.showTitle ? widgetProps.title : undefined}
            height={widgetProps.height}
            showHeaderDivider={widgetProps.showTitle}
        >
            {store.loading ? <ChartLoadingOverlay /> : null}
            {!store.loading && isEmpty ? <ChartEmptyState message={emptyMessage} /> : null}
            {!store.loading && !isEmpty ? (
                <DeferredChartMount>
                    <ReactECharts
                        ref={chartRef}
                        theme={IRIS_ECHARTS_THEME_NAME}
                        option={option}
                        style={{ height: widgetProps.height, width: "100%" }}
                        opts={{ renderer: "canvas" }}
                        onChartReady={onChartReady}
                    />
                </DeferredChartMount>
            ) : null}
        </ChartContainer>
    );
});
