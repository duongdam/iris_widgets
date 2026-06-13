import type { ActionValue, EditableValue, ListAttributeValue, ListValue } from "mendix";
import type { Big } from "big.js";
import type { CSSProperties } from "react";

export type ColumnStackModeEnum = "grouped" | "stacked";

export interface AxColumnChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxColumnChartProps extends AxColumnChartContainerProps {
    title: string;
    height: number;

    datasource: ListValue;
    idAttribute?: ListAttributeValue<string | Big>;
    nameAttribute: ListAttributeValue<string>;
    periodAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<Big>;

    showTitle: boolean;
    showLegend: boolean;
    showTooltip: boolean;
    stackMode: ColumnStackModeEnum;
    columnWidthPercent: number;
    showSeriesLabels: boolean;

    referenceLineValue?: EditableValue<Big>;
    referenceLineLabel: string;

    selectedId?: EditableValue<string>;
    selectedName?: EditableValue<string>;
    selectedPayload?: EditableValue<string>;

    onClick?: ActionValue;
    onSelectionChanged?: ActionValue;
}
