import {
    buildReportChartOption,
    getSortedNames,
    getSortedPeriods,
    IRIS_ECHARTS_THEME_NAME,
    registerIrisTheme,
} from "@iris/chart-echarts";
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
import { useEffect, useMemo, useRef } from "react";
import type { AxReportChartProps } from "../../typings/AxReportChartProps";
import { useReportChartContext } from "../providers/ReportChartProvider";

export interface ReportChartViewProps {
    widgetProps: AxReportChartProps;
}

export const ReportChartView = observer(function ReportChartView({
    widgetProps,
}: ReportChartViewProps): JSX.Element {
    const { store, bridge, eventBus, widgetId } = useReportChartContext();
    const containerRef = useRef<HTMLDivElement>(null);

    const aggregationMode = widgetProps.aggregationMode ?? "both";
    const showGrandTotal = widgetProps.showGrandTotal ?? true;
    const drilldownEnabled = widgetProps.drilldownEnabled ?? true;

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
            buildReportChartOption(store.records, {
                title: widgetProps.title,
                showTitle: widgetProps.showTitle,
                showLegend: widgetProps.showLegend,
                showTooltip: widgetProps.showTooltip,
                height: widgetProps.height,
                selectedId: store.selectedRecord?.id,
                aggregationMode,
                showGrandTotal,
                drilldownEnabled,
            }),
        [
            store.records,
            widgetProps.title,
            widgetProps.showTitle,
            widgetProps.showLegend,
            widgetProps.showTooltip,
            widgetProps.height,
            store.selectedRecord?.id,
            aggregationMode,
            showGrandTotal,
            drilldownEnabled,
        ]
    );

    const categories = useMemo(
        () =>
            aggregationMode === "name" ? getSortedNames(store.records) : getSortedPeriods(store.records),
        [store.records, aggregationMode]
    );

    useEffect(() => {
        registerIrisTheme();
    }, []);

    const { chartRef, onChartReady } = useChartPointerEvents(
        store,
        {
            ...bridge,
            handleClick: record => {
                bridge.handleClick(record);
                if (drilldownEnabled) {
                    bridge.handleDrilldown(record, 0);
                }
            },
            handleHover: bridge.handleHover,
            handleSelectionChanged: bridge.handleSelectionChanged,
        },
        {
            periods: aggregationMode === "name" ? undefined : categories,
            names: aggregationMode === "name" ? categories : undefined,
        },
        { allowedSeriesIndexes: [0] }
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
            ref={containerRef}
            title={widgetProps.showTitle ? widgetProps.title : undefined}
            height={widgetProps.height}
            showHeaderDivider={widgetProps.showTitle}
            fullscreen={store.fullscreen}
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
                        onChartReady={onChartReady}
                    />
                </DeferredChartMount>
            ) : null}
        </ChartContainer>
    );
});
