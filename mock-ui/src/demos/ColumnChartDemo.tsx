import { ThemeProvider } from "@iris/chart-ui";
import type { ChartEventPayload } from "@iris/chart-core";
import type { EditableValue } from "mendix";
import { useMemo } from "react";
import { ColumnChartView } from "../../../widgets/ax-columnchart/src/main/components/ColumnChartView";
import {
    ColumnChartProvider,
    useColumnChartContext,
} from "../../../widgets/ax-columnchart/src/main/providers/ColumnChartProvider";
import type { AxColumnChartProps } from "../../../widgets/ax-columnchart/src/typings/AxColumnChartProps";
import { ChartEventMonitor } from "../components/ChartEventMonitor";
import "../../../widgets/ax-columnchart/src/styles/ax-columnchart.scss";

export interface ColumnChartDemoProps {
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

function ColumnChartEventMonitor({
    onChartEvent,
}: {
    onChartEvent?: (payload: ChartEventPayload) => void;
}): JSX.Element | null {
    const { eventBus } = useColumnChartContext();
    return <ChartEventMonitor eventBus={eventBus} onChartEvent={onChartEvent} />;
}

export function ColumnChartDemo(props: ColumnChartDemoProps): JSX.Element {
    const { title, showTitle, showTooltip, height, jsonData, dataFormat, selectedId, selectedName, selectedPayload, onChartEvent } =
        props;

    const widgetProps = useMemo<AxColumnChartProps>(
        () => ({
            name: "mock-columnchart",
            class: "mock-chart",
            title,
            showTitle,
            height,
            jsonData,
            dataFormat,
            showLegend: true,
            showTooltip,
            selectedId,
            selectedName,
            selectedPayload,
        }),
        [title, showTitle, showTooltip, height, jsonData, dataFormat, selectedId, selectedName, selectedPayload]
    );

    return (
        <ThemeProvider>
            <ColumnChartProvider widgetProps={widgetProps}>
                <ColumnChartEventMonitor onChartEvent={onChartEvent} />
                <ColumnChartView widgetProps={widgetProps} />
            </ColumnChartProvider>
        </ThemeProvider>
    );
}
