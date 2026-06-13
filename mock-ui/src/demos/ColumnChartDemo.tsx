import { ThemeProvider } from "@iris/chart-ui";
import type { ChartEventPayload, ChartRecord } from "@iris/chart-core";
import type { Big } from "big.js";
import type { EditableValue } from "mendix";
import { useMemo } from "react";
import { ColumnChartView } from "../../../widgets/ax-columnchart/src/main/components/ColumnChartView";
import {
    ColumnChartProvider,
    useColumnChartContext,
} from "../../../widgets/ax-columnchart/src/main/providers/ColumnChartProvider";
import type { AxColumnChartProps, ColumnStackModeEnum } from "../../../widgets/ax-columnchart/src/typings/AxColumnChartProps";
import { ChartEventMonitor } from "../components/ChartEventMonitor";
import { createMockListValue } from "../mocks/listValue";
import "../../../widgets/ax-columnchart/src/styles/ax-columnchart.scss";

export interface ColumnChartDemoProps {
    title: string;
    showTitle: boolean;
    showTooltip: boolean;
    height: number;
    stackMode: ColumnStackModeEnum;
    columnWidthPercent: number;
    showSeriesLabels: boolean;
    referenceLineValue?: number;
    referenceLineLabel?: string;
    records: ChartRecord[];
    selectedId: EditableValue<string>;
    selectedName: EditableValue<string>;
    selectedPayload: EditableValue<string>;
    onChartEvent?: (payload: ChartEventPayload) => void;
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

function ColumnChartEventMonitor({
    onChartEvent,
}: {
    onChartEvent?: (payload: ChartEventPayload) => void;
}): JSX.Element | null {
    const { eventBus } = useColumnChartContext();
    return <ChartEventMonitor eventBus={eventBus} onChartEvent={onChartEvent} />;
}

export function ColumnChartDemo(props: ColumnChartDemoProps): JSX.Element {
    const {
        title,
        showTitle,
        showTooltip,
        height,
        stackMode,
        columnWidthPercent,
        showSeriesLabels,
        referenceLineValue,
        referenceLineLabel = "",
        records,
        selectedId,
        selectedName,
        selectedPayload,
        onChartEvent,
    } = props;

    const { datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute } = useMemo(
        () => createMockListValue(records),
        [records]
    );

    const mockRefLineValue = useMemo(
        () => (referenceLineValue !== undefined ? createMockBigValue(referenceLineValue) : undefined),
        [referenceLineValue]
    );

    const widgetProps = useMemo<AxColumnChartProps>(
        () => ({
            name: "mock-columnchart",
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
            stackMode,
            columnWidthPercent,
            showSeriesLabels,
            referenceLineValue: mockRefLineValue,
            referenceLineLabel,
            selectedId,
            selectedName,
            selectedPayload,
        }),
        [
            title,
            showTitle,
            showTooltip,
            height,
            stackMode,
            columnWidthPercent,
            showSeriesLabels,
            datasource,
            idAttribute,
            nameAttribute,
            periodAttribute,
            valueAttribute,
            mockRefLineValue,
            referenceLineLabel,
            selectedId,
            selectedName,
            selectedPayload,
        ]
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
