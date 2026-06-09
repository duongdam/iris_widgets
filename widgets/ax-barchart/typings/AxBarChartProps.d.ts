/**
 * This file was generated from AxBarChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";

export type DataFormatEnum = "flat" | "elastic";

export interface AxBarChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    title: string;
    height: number;
    jsonData: EditableValue<string>;
    dataFormat: DataFormatEnum;
    showTitle: boolean;
    showLegend: boolean;
    showTooltip: boolean;
    selectedId?: EditableValue<string>;
    selectedName?: EditableValue<string>;
    selectedPayload?: EditableValue<string>;
    onClick?: ActionValue;
    onSelectionChanged?: ActionValue;
}

export interface AxBarChartPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    title: string;
    height: number | null;
    jsonData: string;
    dataFormat: DataFormatEnum;
    showTitle: boolean;
    showLegend: boolean;
    showTooltip: boolean;
    selectedId: string;
    selectedName: string;
    selectedPayload: string;
    onClick: {} | null;
    onSelectionChanged: {} | null;
}
