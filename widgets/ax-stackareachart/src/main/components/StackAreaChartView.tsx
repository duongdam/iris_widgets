import { buildStackAreaChartOption, getSortedPeriods, IRIS_ECHARTS_THEME_NAME, registerIrisTheme } from "@iris/chart-echarts";
import {
    ChartContainer,
    ChartEmptyState,
    ChartLoadingOverlay,
    DeferredChartMount,
    useChartDatasource,
    useChartPointerEvents,
    useSelectionSync,
} from "@iris/chart-ui";
import type { EChartsType } from "echarts";
import ReactECharts from "echarts-for-react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { AxStackAreaChartProps } from "../../typings/AxStackAreaChartProps";
import { useStackAreaChartContext } from "../providers/StackAreaChartProvider";

export interface StackAreaChartViewProps {
    widgetProps: AxStackAreaChartProps;
}

export const StackAreaChartView = observer(function StackAreaChartView({
    widgetProps,
}: StackAreaChartViewProps): JSX.Element {
    const { store, bridge } = useStackAreaChartContext();

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

    const referenceLineValue = widgetProps.referenceLineValue?.value != null
        ? Number(widgetProps.referenceLineValue.value.toString())
        : undefined;

    const option = useMemo(
        () =>
            buildStackAreaChartOption(store.records, {
                title: widgetProps.title,
                showTitle: widgetProps.showTitle,
                showLegend: widgetProps.showLegend,
                showTooltip: widgetProps.showTooltip,
                height: widgetProps.height,
                selectedId: store.selectedRecord?.id,
                referenceLineValue,
                referenceLineLabel: widgetProps.referenceLineLabel,
            }),
        [
            store.records,
            widgetProps.title,
            widgetProps.showTitle,
            widgetProps.showLegend,
            widgetProps.showTooltip,
            widgetProps.height,
            store.selectedRecord?.id,
            referenceLineValue,
            widgetProps.referenceLineLabel,
        ]
    );

    const periods = useMemo(() => getSortedPeriods(store.records), [store.records]);

    useEffect(() => {
        registerIrisTheme();
    }, []);

    const { chartRef, onChartReady: bindPointerEvents } = useChartPointerEvents(store, bridge, {
        periods,
    });
    const bridgeRef = useRef(bridge);
    bridgeRef.current = bridge;

    const onChartReady = useCallback(
        (instance: EChartsType) => {
            bindPointerEvents(instance);
            instance.off("legendselectchanged");
            instance.on("legendselectchanged", params => {
                const event = params as { name: string; selected: Record<string, boolean> };
                const selected = event.selected[event.name] ?? true;
                bridgeRef.current.handleLegendSelect(event.name, selected);
            });
        },
        [bindPointerEvents]
    );

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

    return (
        <ChartContainer
            title={widgetProps.showTitle ? widgetProps.title : undefined}
            height={widgetProps.height}
            showHeaderDivider={widgetProps.showTitle}
        >
            {store.loading ? <ChartLoadingOverlay /> : null}
            {!store.loading && isEmpty ? <ChartEmptyState message="No chart data available" /> : null}
            {!store.loading && !isEmpty ? (
                <DeferredChartMount>
                    <ReactECharts
                        ref={chartRef}
                        theme={IRIS_ECHARTS_THEME_NAME}
                        option={option}
                        style={{ height: widgetProps.height, width: "100%" }}
                        opts={{ renderer: "canvas" }}
                        notMerge={false}
                        onChartReady={onChartReady}
                    />
                </DeferredChartMount>
            ) : null}
        </ChartContainer>
    );
});
