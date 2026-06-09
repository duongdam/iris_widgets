import { ThemeProvider } from "@iris/chart-ui";
import type { ChartEventPayload } from "@iris/chart-core";
import type { EditableValue } from "mendix";
import { useMemo } from "react";
import { StackAreaChartView } from "../../../widgets/ax-stackareachart/src/main/components/StackAreaChartView";
import {
    StackAreaChartProvider,
    useStackAreaChartContext,
} from "../../../widgets/ax-stackareachart/src/main/providers/StackAreaChartProvider";
import type { AxStackAreaChartProps } from "../../../widgets/ax-stackareachart/src/typings/AxStackAreaChartProps";
import { ChartEventMonitor } from "../components/ChartEventMonitor";
import "../../../widgets/ax-stackareachart/src/styles/ax-stackareachart.scss";

export interface StackAreaChartDemoProps {
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

function StackAreaChartEventMonitor({
    onChartEvent,
}: {
    onChartEvent?: (payload: ChartEventPayload) => void;
}): JSX.Element | null {
    const { eventBus } = useStackAreaChartContext();
    return <ChartEventMonitor eventBus={eventBus} onChartEvent={onChartEvent} />;
}

export function StackAreaChartDemo(props: StackAreaChartDemoProps): JSX.Element {
    const { title, showTitle, showTooltip, height, jsonData, dataFormat, selectedId, selectedName, selectedPayload, onChartEvent } =
        props;

    const widgetProps = useMemo<AxStackAreaChartProps>(
        () => ({
            name: "mock-stackareachart",
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
            <StackAreaChartProvider widgetProps={widgetProps}>
                <StackAreaChartEventMonitor onChartEvent={onChartEvent} />
                <StackAreaChartView widgetProps={widgetProps} />
            </StackAreaChartProvider>
        </ThemeProvider>
    );
}
