import { ThemeProvider } from "@iris/chart-ui";
import type { ChartEventPayload } from "@iris/chart-core";
import type { EditableValue } from "mendix";
import { useMemo } from "react";
import { ReportChartView } from "../../../widgets/ax-reportchart/src/main/components/ReportChartView";
import {
    ReportChartProvider,
    useReportChartContext,
} from "../../../widgets/ax-reportchart/src/main/providers/ReportChartProvider";
import type { AxReportChartProps } from "../../../widgets/ax-reportchart/src/typings/AxReportChartProps";
import { ChartEventMonitor } from "../components/ChartEventMonitor";
import "../../../widgets/ax-reportchart/src/styles/ax-reportchart.scss";

export interface ReportChartDemoProps {
    title: string;
    showTitle: boolean;
    showTooltip: boolean;
    height: number;
    jsonData: EditableValue<string>;
    dataFormat: "flat" | "elastic";
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
    const { title, showTitle, showTooltip, height, jsonData, dataFormat, selectedId, selectedName, selectedPayload, onChartEvent } =
        props;

    const widgetProps = useMemo<AxReportChartProps>(
        () => ({
            name: "mock-reportchart",
            class: "mock-chart",
            title,
            showTitle,
            height,
            jsonData,
            dataFormat,
            showLegend: true,
            showTooltip,
            aggregationMode: "both",
            showGrandTotal: true,
            drilldownEnabled: true,
            selectedId,
            selectedName,
            selectedPayload,
        }),
        [title, showTitle, showTooltip, height, jsonData, dataFormat, selectedId, selectedName, selectedPayload]
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
