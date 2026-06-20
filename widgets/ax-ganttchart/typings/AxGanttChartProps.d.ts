/**
 * This file was generated from AxGanttChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export type DefaultViewModeEnum = "day" | "week" | "month";

export interface AxGanttChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    height: number;
    defaultViewMode: DefaultViewModeEnum;
    showToolbar: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    tasksDatasource: ListValue;
    idAttribute: ListAttributeValue<string | Big>;
    textAttribute: ListAttributeValue<string>;
    startDateAttribute: ListAttributeValue<Date>;
    endDateAttribute?: ListAttributeValue<Date>;
    durationAttribute?: ListAttributeValue<Big>;
    progressAttribute?: ListAttributeValue<Big>;
    parentAttribute?: ListAttributeValue<string | Big>;
    orderNoAttribute?: ListAttributeValue<Big>;
    openAttribute?: ListAttributeValue<boolean>;
    typeAttribute?: ListAttributeValue<string>;
    tagsAttribute?: ListAttributeValue<string>;
    mtoDateAttribute?: ListAttributeValue<Date>;
    eventTypeAttribute?: ListAttributeValue<string>;
    metadata1Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata2Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata3Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata4Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata5Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    allowDrag: boolean;
    allowResize: boolean;
    allowGridReorder: boolean;
    readOnly: boolean;
    command?: EditableValue<string>;
    commandPayload?: EditableValue<string>;
    onEvent?: ActionValue;
    eventType?: EditableValue<string>;
    eventPayload?: EditableValue<string>;
}

export interface AxGanttChartPreviewProps {
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
    height: number | null;
    defaultViewMode: DefaultViewModeEnum;
    showToolbar: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    tasksDatasource: {} | { caption: string } | { type: string } | null;
    idAttribute: string;
    textAttribute: string;
    startDateAttribute: string;
    endDateAttribute: string;
    durationAttribute: string;
    progressAttribute: string;
    parentAttribute: string;
    orderNoAttribute: string;
    openAttribute: string;
    typeAttribute: string;
    tagsAttribute: string;
    mtoDateAttribute: string;
    eventTypeAttribute: string;
    metadata1Attribute: string;
    metadata2Attribute: string;
    metadata3Attribute: string;
    metadata4Attribute: string;
    metadata5Attribute: string;
    allowDrag: boolean;
    allowResize: boolean;
    allowGridReorder: boolean;
    readOnly: boolean;
    command: string;
    commandPayload: string;
    onEvent: {} | null;
    eventType: string;
    eventPayload: string;
}
