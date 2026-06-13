import { ThemeProvider } from "@iris/chart-ui";
import type { ChartEventPayload, ChartRecord } from "@iris/chart-core";
import type { EditableValue } from "mendix";
import { useMemo } from "react";
import { BarChartView } from "../../../widgets/ax-barchart/src/main/components/BarChartView";
import {
    BarChartProvider,
    useBarChartContext,
} from "../../../widgets/ax-barchart/src/main/providers/BarChartProvider";
import type { AxBarChartProps } from "../../../widgets/ax-barchart/src/typings/AxBarChartProps";
import { ChartEventMonitor } from "../components/ChartEventMonitor";
import { createMockListValue } from "../mocks/listValue";
import "../../../widgets/ax-barchart/src/styles/ax-barchart.scss";

export interface BarChartDemoProps {
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

function BarChartEventMonitor({
    onChartEvent,
}: {
    onChartEvent?: (payload: ChartEventPayload) => void;
}): JSX.Element | null {
    const { eventBus } = useBarChartContext();
    return <ChartEventMonitor eventBus={eventBus} onChartEvent={onChartEvent} />;
}

export function BarChartDemo({
    title,
    showTitle,
    showTooltip,
    height,
    records,
    selectedId,
    selectedName,
    selectedPayload,
    onChartEvent,
}: BarChartDemoProps): JSX.Element {
    const { datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute } = useMemo(
        () => createMockListValue(records),
        [records]
    );

    const widgetProps = useMemo<AxBarChartProps>(
        () => ({
            name: "mock-barchart",
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
            selectedId,
            selectedName,
            selectedPayload,
        }),
        [title, showTitle, showTooltip, height, datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute, selectedId, selectedName, selectedPayload]
    );

    return (
        <ThemeProvider>
            <BarChartProvider widgetProps={widgetProps}>
                <BarChartEventMonitor onChartEvent={onChartEvent} />
                <BarChartView widgetProps={widgetProps} />
            </BarChartProvider>
        </ThemeProvider>
    );
}
