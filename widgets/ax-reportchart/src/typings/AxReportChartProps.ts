import type { ActionValue, EditableValue } from "mendix";
import type { CSSProperties } from "react";

export type ReportAggregationMode = "period" | "name" | "both";

export interface AxReportChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxReportChartProps extends AxReportChartContainerProps {
    title: string;
    height: number;

    jsonData: EditableValue<string>;
    dataFormat: "flat" | "elastic";

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
}
