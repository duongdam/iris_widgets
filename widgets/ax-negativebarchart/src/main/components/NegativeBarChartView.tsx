import { buildNegativeBarChartOption, IRIS_ECHARTS_THEME_NAME, registerIrisTheme } from "@iris/chart-echarts";
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
import { useEffect, useMemo } from "react";
import type { AxNegativeBarChartProps } from "../../typings/AxNegativeBarChartProps";
import { useNegativeBarChartContext } from "../providers/NegativeBarChartProvider";

export interface NegativeBarChartViewProps {
    widgetProps: AxNegativeBarChartProps;
}

export const NegativeBarChartView = observer(function NegativeBarChartView({
    widgetProps,
}: NegativeBarChartViewProps): JSX.Element {
    const { store, bridge } = useNegativeBarChartContext();

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

    const baselineValue =
        widgetProps.baselineValue?.value != null
            ? Number(widgetProps.baselineValue.value.toString())
            : 0;

    const labels = useMemo(
        () =>
            [...store.records]
                .sort((a, b) => a.period.localeCompare(b.period) || a.name.localeCompare(b.name))
                .map(r => (r.period ? `${r.name}\n${r.period}` : r.name)),
        [store.records]
    );

    const option = useMemo(
        () =>
            buildNegativeBarChartOption(store.records, {
                title: widgetProps.title,
                showTitle: widgetProps.showTitle,
                showLegend: widgetProps.showLegend,
                showTooltip: widgetProps.showTooltip,
                height: widgetProps.height,
                baselineValue,
                baselineLabel: widgetProps.baselineLabel,
            }),
        [
            store.records,
            widgetProps.title,
            widgetProps.showTitle,
            widgetProps.showLegend,
            widgetProps.showTooltip,
            widgetProps.height,
            baselineValue,
            widgetProps.baselineLabel,
        ]
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
