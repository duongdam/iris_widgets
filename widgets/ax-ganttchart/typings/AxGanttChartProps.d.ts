/**
 * This file was generated from AxGanttChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export type DefaultViewModeEnum = "day" | "week" | "month" | "quarter";

export interface AxGanttChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    height: number;
    tasksDatasource: ListValue;
    idAttribute: ListAttributeValue<string | Big>;
    textAttribute: ListAttributeValue<string>;
    startDateAttribute: ListAttributeValue<Date>;
    endDateAttribute?: ListAttributeValue<Date>;
    durationAttribute?: ListAttributeValue<Big>;
    progressAttribute?: ListAttributeValue<Big>;
    parentAttribute?: ListAttributeValue<string | Big>;
    openAttribute?: ListAttributeValue<boolean>;
    typeAttribute?: ListAttributeValue<string>;
    showToolbar: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    showCriticalPath: boolean;
    showBaseline: boolean;
    allowCreate: boolean;
    allowUpdate: boolean;
    allowDelete: boolean;
    allowDrag: boolean;
    allowResize: boolean;
    readOnly: boolean;
    defaultViewMode: DefaultViewModeEnum;
    selectedTaskId?: EditableValue<string | Big>;
    selectedPayload?: EditableValue<string>;
    command?: EditableValue<string>;
    commandPayload?: EditableValue<string>;
    onTaskClick?: ActionValue;
    onTaskDoubleClick?: ActionValue;
    onTaskCreated?: ActionValue;
    onTaskUpdated?: ActionValue;
    onTaskDeleted?: ActionValue;
    onSelectionChanged?: ActionValue;
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
    tasksDatasource: {} | { caption: string } | { type: string } | null;
    idAttribute: string;
    textAttribute: string;
    startDateAttribute: string;
    endDateAttribute: string;
    durationAttribute: string;
    progressAttribute: string;
    parentAttribute: string;
    openAttribute: string;
    typeAttribute: string;
    showToolbar: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    showCriticalPath: boolean;
    showBaseline: boolean;
    allowCreate: boolean;
    allowUpdate: boolean;
    allowDelete: boolean;
    allowDrag: boolean;
    allowResize: boolean;
    readOnly: boolean;
    defaultViewMode: DefaultViewModeEnum;
    selectedTaskId: string;
    selectedPayload: string;
    command: string;
    commandPayload: string;
    onTaskClick: {} | null;
    onTaskDoubleClick: {} | null;
    onTaskCreated: {} | null;
    onTaskUpdated: {} | null;
    onTaskDeleted: {} | null;
    onSelectionChanged: {} | null;
}
