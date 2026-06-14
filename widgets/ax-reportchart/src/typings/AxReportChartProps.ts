import type { ActionValue, EditableValue, ListAttributeValue, ListValue } from "mendix";
import type { Big } from "big.js";
import type { CSSProperties } from "react";

export interface AxReportChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export type ReportAggregationMode = "period" | "name" | "both";

export interface AxReportChartProps extends AxReportChartContainerProps {
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

    aggregationMode?: ReportAggregationMode;
    showGrandTotal?: boolean;
    drilldownEnabled?: boolean;

    selectedId?: EditableValue<string>;
    selectedName?: EditableValue<string>;
    selectedPayload?: EditableValue<string>;

    onClick?: ActionValue;
    onSelectionChanged?: ActionValue;

    command?: EditableValue<string>;
    commandPayload?: EditableValue<string>;
}
