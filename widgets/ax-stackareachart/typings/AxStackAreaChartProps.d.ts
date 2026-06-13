/**
 * This file was generated from AxStackAreaChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export interface AxStackAreaChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
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
    referenceLineValue?: EditableValue<Big>;
    referenceLineLabel: string;
    selectedId?: EditableValue<string>;
    selectedName?: EditableValue<string>;
    selectedPayload?: EditableValue<string>;
    onClick?: ActionValue;
    onSelectionChanged?: ActionValue;
}

export interface AxStackAreaChartPreviewProps {
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
    datasource: {} | { caption: string } | { type: string } | null;
    idAttribute: string;
    nameAttribute: string;
    periodAttribute: string;
    valueAttribute: string;
    showTitle: boolean;
    showLegend: boolean;
    showTooltip: boolean;
    referenceLineValue: string;
    referenceLineLabel: string;
    selectedId: string;
    selectedName: string;
    selectedPayload: string;
    onClick: {} | null;
    onSelectionChanged: {} | null;
}
