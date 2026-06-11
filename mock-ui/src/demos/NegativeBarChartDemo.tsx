import { ThemeProvider } from "@iris/chart-ui";
import type { ChartEventPayload } from "@iris/chart-core";
import type { Big } from "big.js";
import type { EditableValue } from "mendix";
import { useMemo } from "react";
import { NegativeBarChartView } from "../../../widgets/ax-negativebarchart/src/main/components/NegativeBarChartView";
import {
    NegativeBarChartProvider,
    useNegativeBarChartContext,
} from "../../../widgets/ax-negativebarchart/src/main/providers/NegativeBarChartProvider";
import type { AxNegativeBarChartProps } from "../../../widgets/ax-negativebarchart/src/typings/AxNegativeBarChartProps";
import { ChartEventMonitor } from "../components/ChartEventMonitor";
import "../../../widgets/ax-negativebarchart/src/styles/ax-negativebarchart.scss";

export interface NegativeBarChartDemoProps {
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
    baselineValue?: number;
    baselineLabel?: string;
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

function NegativeBarChartEventMonitor({
    onChartEvent,
}: {
    onChartEvent?: (payload: ChartEventPayload) => void;
}): JSX.Element | null {
    const { eventBus } = useNegativeBarChartContext();
    return <ChartEventMonitor eventBus={eventBus} onChartEvent={onChartEvent} />;
}

export function NegativeBarChartDemo(props: NegativeBarChartDemoProps): JSX.Element {
    const {
        title, showTitle, showTooltip, height, jsonData, dataFormat,
        selectedId, selectedName, selectedPayload, onChartEvent,
        baselineValue, baselineLabel = "",
    } = props;

    const mockBaselineValue = useMemo(
        () => (baselineValue !== undefined ? createMockBigValue(baselineValue) : undefined),
        [baselineValue]
    );

    const widgetProps = useMemo<AxNegativeBarChartProps>(
        () => ({
            name: "mock-negativebarchart",
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
            baselineValue: mockBaselineValue,
            baselineLabel,
        }),
        [title, showTitle, showTooltip, height, jsonData, dataFormat,
            selectedId, selectedName, selectedPayload, mockBaselineValue, baselineLabel]
    );

    return (
        <ThemeProvider>
            <NegativeBarChartProvider widgetProps={widgetProps}>
                <NegativeBarChartEventMonitor onChartEvent={onChartEvent} />
                <NegativeBarChartView widgetProps={widgetProps} />
            </NegativeBarChartProvider>
        </ThemeProvider>
    );
}
