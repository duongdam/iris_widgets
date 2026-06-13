import type { ActionValue, EditableValue, ListAttributeValue, ListValue } from "mendix";
import type { Big } from "big.js";
import type { CSSProperties } from "react";

export interface AxNegativeBarChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxNegativeBarChartProps extends AxNegativeBarChartContainerProps {
    title: string;
    height: number;

    datasource: ListValue;
    idAttribute?: ListAttributeValue<string | Big>;
    nameAttribute: ListAttributeValue<string>;
    periodAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<Big>;

    baselineValue?: EditableValue<Big>;
    baselineLabel: string;

    showTitle: boolean;
    showLegend: boolean;
    showTooltip: boolean;

    selectedId?: EditableValue<string>;
    selectedName?: EditableValue<string>;
    selectedPayload?: EditableValue<string>;

    onClick?: ActionValue;
    onSelectionChanged?: ActionValue;
}
