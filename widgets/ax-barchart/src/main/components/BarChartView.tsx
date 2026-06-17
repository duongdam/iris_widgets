import { buildBarChartOption, IRIS_ECHARTS_THEME_NAME, registerIrisTheme } from "@iris/chart-echarts";
import { useChartCommandSync } from "@iris/chart-core";
import {
    ChartContainer,
    ChartEmptyState,
    ChartLoadingOverlay,
    DeferredChartMount,
    useChartDatasource,
    useChartPointerEvents,
    useSelectionSync,
} from "@iris/chart-ui";
import ReactECharts from "echarts-for-react";
import { observer } from "mobx-react-lite";
import { JSX, useEffect, useMemo, useRef } from "react";
import type { AxBarChartProps } from "../../typings/AxBarChartProps";
import { useBarChartContext } from "../providers/BarChartProvider";

export interface BarChartViewProps {
    widgetProps: AxBarChartProps;
}

export const BarChartView = observer(function BarChartView({ widgetProps }: BarChartViewProps): JSX.Element {
    const { store, bridge, eventBus, widgetId } = useBarChartContext();
    const containerRef = useRef<HTMLDivElement>(null);

    const { isEmpty } = useChartDatasource(store, widgetProps.datasource, {
        idAttribute: widgetProps.idAttribute,
        nameAttribute: widgetProps.nameAttribute,
        periodAttribute: widgetProps.periodAttribute,
        valueAttribute: widgetProps.valueAttribute,
    });

    useSelectionSync({
        store,
        selectedId: widgetProps.selectedId,
        selectedName: widgetProps.selectedName,
        selectedPayload: widgetProps.selectedPayload,
        bridge,
    });

    useChartCommandSync({
        command: widgetProps.command,
        commandPayload: widgetProps.commandPayload,
        eventBus,
        widgetId,
        store,
        containerRef,
    });

    const option = useMemo(
        () =>
            buildBarChartOption(store.records, {
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

    const labels = useMemo(
        () =>
            [...store.records]
                .sort(
                    (left, right) =>
                        left.name.localeCompare(right.name) || left.period.localeCompare(right.period)
                )
                .map(record => `${record.name} (${record.period})`),
        [store.records]
    );

    useEffect(() => {
        registerIrisTheme();
    }, []);

    const { chartRef, onChartReady } = useChartPointerEvents(store, bridge, { names: labels });

    useEffect(() => {
        if (!store.loading && store.records.length > 0) {
            bridge.handleReady(store.records.length);
        }
    }, [store.loading, store.records.length, bridge]);

    useEffect(() => {
        if (!store.loading) {
            bridge.handleRefresh(store.records.length);
        }
    }, [store.loading, store.records.length, bridge]);

    const emptyMessage = "No chart data available";

    return (
        <ChartContainer
            ref={containerRef}
            title={widgetProps.showTitle ? widgetProps.title : undefined}
            height={widgetProps.height}
            showHeaderDivider={widgetProps.showTitle}
            fullscreen={store.fullscreen}
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
