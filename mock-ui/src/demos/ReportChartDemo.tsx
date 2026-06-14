import { ThemeProvider } from "@iris/chart-ui";
import type { ChartEventPayload, ChartRecord } from "@iris/chart-core";
import type { EditableValue } from "mendix";
import { useMemo } from "react";
import { ReportChartView } from "../../../widgets/ax-reportchart/src/main/components/ReportChartView";
import {
    ReportChartProvider,
    useReportChartContext,
} from "../../../widgets/ax-reportchart/src/main/providers/ReportChartProvider";
import type { AxReportChartProps } from "../../../widgets/ax-reportchart/src/typings/AxReportChartProps";
import { ChartEventMonitor } from "../components/ChartEventMonitor";
import { ChartContextExporter } from "../components/ChartContextExporter";
import { createMockListValue } from "../mocks/listValue";
import "../../../widgets/ax-reportchart/src/styles/ax-reportchart.scss";

export interface ReportChartDemoProps {
    title: string;
    showTitle: boolean;
    showTooltip: boolean;
    height: number;
    records: ChartRecord[];
    selectedId: EditableValue<string>;
    selectedName: EditableValue<string>;
    selectedPayload: EditableValue<string>;
    onChartEvent?: (payload: ChartEventPayload) => void;
    onContextReady?: (context: { eventBus: import("@iris/chart-core").ChartEventBus; widgetId: string }) => void;
}

function ReportChartEventMonitor({
    onChartEvent,
}: {
    onChartEvent?: (payload: ChartEventPayload) => void;
}): JSX.Element | null {
    const { eventBus } = useReportChartContext();
    return <ChartEventMonitor eventBus={eventBus} onChartEvent={onChartEvent} />;
}

function ReportChartContextBridge({
    onContextReady,
}: {
    onContextReady?: ReportChartDemoProps["onContextReady"];
}): null {
    const { eventBus, widgetId } = useReportChartContext();
    return <ChartContextExporter eventBus={eventBus} widgetId={widgetId} onContextReady={onContextReady} />;
}

export function ReportChartDemo(props: ReportChartDemoProps): JSX.Element {
    const { title, showTitle, showTooltip, height, records, selectedId, selectedName, selectedPayload, onChartEvent, onContextReady } =
        props;

    const { datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute } = useMemo(
        () => createMockListValue(records),
        [records]
    );

    const widgetProps = useMemo<AxReportChartProps>(
        () => ({
            name: "mock-reportchart",
            class: "mock-chart",
            title,
            showTitle,
            height,
            datasource,
            idAttribute,
            nameAttribute,
            periodAttribute,
            valueAttribute,
            showLegend: true,
            showTooltip,
            aggregationMode: "both",
            showGrandTotal: true,
            drilldownEnabled: true,
            selectedId,
            selectedName,
            selectedPayload,
        }),
        [title, showTitle, showTooltip, height, datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute, selectedId, selectedName, selectedPayload]
    );

    return (
        <ThemeProvider>
            <ReportChartProvider widgetProps={widgetProps}>
                <ReportChartEventMonitor onChartEvent={onChartEvent} />
                <ReportChartContextBridge onContextReady={onContextReady} />
                <ReportChartView widgetProps={widgetProps} />
            </ReportChartProvider>
        </ThemeProvider>
    );
}
