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
}

function ReportChartEventMonitor({
    onChartEvent,
}: {
    onChartEvent?: (payload: ChartEventPayload) => void;
}): JSX.Element | null {
    const { eventBus } = useReportChartContext();
    return <ChartEventMonitor eventBus={eventBus} onChartEvent={onChartEvent} />;
}

export function ReportChartDemo(props: ReportChartDemoProps): JSX.Element {
    const { title, showTitle, showTooltip, height, records, selectedId, selectedName, selectedPayload, onChartEvent } =
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
                <ReportChartView widgetProps={widgetProps} />
            </ReportChartProvider>
        </ThemeProvider>
    );
}
