import { ThemeProvider } from "@iris/chart-ui";
import type { ChartEventPayload, ChartRecord } from "@iris/chart-core";
import type { Big } from "big.js";
import type { EditableValue } from "mendix";
import { useMemo } from "react";
import { StackAreaChartView } from "../../../widgets/ax-stackareachart/src/main/components/StackAreaChartView";
import {
    StackAreaChartProvider,
    useStackAreaChartContext,
} from "../../../widgets/ax-stackareachart/src/main/providers/StackAreaChartProvider";
import type { AxStackAreaChartProps } from "../../../widgets/ax-stackareachart/src/typings/AxStackAreaChartProps";
import { ChartEventMonitor } from "../components/ChartEventMonitor";
import { ChartContextExporter } from "../components/ChartContextExporter";
import { createMockListValue } from "../mocks/listValue";
import "../../../widgets/ax-stackareachart/src/styles/ax-stackareachart.scss";

export interface StackAreaChartDemoProps {
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
    referenceLineValue?: number;
    referenceLineLabel?: string;
}

function createMockBigValue(value: number): EditableValue<Big> {
    const bigLike = { toString: () => String(value) } as unknown as Big;
    return {
        value: bigLike,
        status: "available",
        readOnly: true,
        displayValue: String(value),
        formatter: { format: (v: Big) => String(v), parse: () => ({}) as Big },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: () => undefined,
        setValue: () => undefined,
        isList: false as const,
        validation: undefined,
        universe: undefined,
    } as unknown as EditableValue<Big>;
}

function StackAreaChartEventMonitor({
    onChartEvent,
}: {
    onChartEvent?: (payload: ChartEventPayload) => void;
}): JSX.Element | null {
    const { eventBus } = useStackAreaChartContext();
    return <ChartEventMonitor eventBus={eventBus} onChartEvent={onChartEvent} />;
}

function StackAreaChartContextBridge({
    onContextReady,
}: {
    onContextReady?: StackAreaChartDemoProps["onContextReady"];
}): null {
    const { eventBus, widgetId } = useStackAreaChartContext();
    return <ChartContextExporter eventBus={eventBus} widgetId={widgetId} onContextReady={onContextReady} />;
}

export function StackAreaChartDemo(props: StackAreaChartDemoProps): JSX.Element {
    const {
        title, showTitle, showTooltip, height, records,
        selectedId, selectedName, selectedPayload, onChartEvent, onContextReady,
        referenceLineValue, referenceLineLabel = "",
    } = props;

    const { datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute } = useMemo(
        () => createMockListValue(records),
        [records]
    );

    const mockRefLineValue = useMemo(
        () => (referenceLineValue !== undefined ? createMockBigValue(referenceLineValue) : undefined),
        [referenceLineValue]
    );

    const widgetProps = useMemo<AxStackAreaChartProps>(
        () => ({
            name: "mock-stackareachart",
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
            referenceLineValue: mockRefLineValue,
            referenceLineLabel,
        }),
        [title, showTitle, showTooltip, height, datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute, selectedId, selectedName, selectedPayload, mockRefLineValue, referenceLineLabel]
    );

    return (
        <ThemeProvider>
            <StackAreaChartProvider widgetProps={widgetProps}>
                <StackAreaChartEventMonitor onChartEvent={onChartEvent} />
                <StackAreaChartContextBridge onContextReady={onContextReady} />
                <StackAreaChartView widgetProps={widgetProps} />
            </StackAreaChartProvider>
        </ThemeProvider>
    );
}
