import type { ActionValue, EditableValue } from "mendix";
import type { CSSProperties } from "react";

export interface AxColumnChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxColumnChartProps extends AxColumnChartContainerProps {
    title: string;
    height: number;

    jsonData: EditableValue<string>;
    dataFormat: "flat" | "elastic";

    showTitle: boolean;
    showLegend: boolean;
    showTooltip: boolean;

    selectedId?: EditableValue<string>;
    selectedName?: EditableValue<string>;
    selectedPayload?: EditableValue<string>;

    onClick?: ActionValue;
    onSelectionChanged?: ActionValue;
}
