/**
 * This file was generated from AxGanttChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export interface AxGanttChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    height: DynamicValue<Big>;
    defaultViewMode: DynamicValue<string>;
    showToolbar: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    optStartDateAttribute?: DynamicValue<string>;
    optEndDateAttribute?: DynamicValue<string>;
    allowDrag: DynamicValue<boolean>;
    allowResize: DynamicValue<boolean>;
    allowGridReorder: DynamicValue<boolean>;
    readOnly: DynamicValue<boolean>;
    roadmapItems: ListValue;
    aidAttribute: ListAttributeValue<string | Big>;
    itemIdAttribute: ListAttributeValue<string | Big>;
    parentIdAttribute: ListAttributeValue<string>;
    groupAttribute: ListAttributeValue<string>;
    typeAttribute: ListAttributeValue<string>;
    nameAttribute: ListAttributeValue<string>;
    textAttribute: ListAttributeValue<string>;
    countAttribute: ListAttributeValue<Big>;
    orderAttribute: ListAttributeValue<Big>;
    customOrderAttribute: ListAttributeValue<string | Big>;
    startDateAttribute?: ListAttributeValue<Date>;
    endDateAttribute?: ListAttributeValue<Date>;
    milestoneAttribute: ListAttributeValue<string>;
    stndMileMonthAttribute: ListAttributeValue<Date>;
    hasTuningAttribute: ListAttributeValue<boolean>;
    hasManualAttribute: ListAttributeValue<boolean>;
    hasCertAttribute: ListAttributeValue<boolean>;
    hasRFAttribute: ListAttributeValue<boolean>;
    canEditAttribute?: ListAttributeValue<boolean>;
    metadata1Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata2Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata3Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata4Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata5Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    command?: EditableValue<string>;
    commandPayload?: EditableValue<string>;
    outItemId?: EditableValue<string>;
    outType?: EditableValue<string>;
    outChangedNum?: EditableValue<Big>;
    onClicked?: ActionValue;
    onDoubleClicked?: ActionValue;
    onChanged?: ActionValue;
    onAdded?: ActionValue;
    onDropped?: ActionValue;
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
    height: string;
    defaultViewMode: string;
    showToolbar: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    optStartDateAttribute: string;
    optEndDateAttribute: string;
    allowDrag: string;
    allowResize: string;
    allowGridReorder: string;
    readOnly: string;
    roadmapItems: {} | { caption: string } | { type: string } | null;
    aidAttribute: string;
    itemIdAttribute: string;
    parentIdAttribute: string;
    groupAttribute: string;
    typeAttribute: string;
    nameAttribute: string;
    textAttribute: string;
    countAttribute: string;
    orderAttribute: string;
    customOrderAttribute: string;
    startDateAttribute: string;
    endDateAttribute: string;
    milestoneAttribute: string;
    stndMileMonthAttribute: string;
    hasTuningAttribute: string;
    hasManualAttribute: string;
    hasCertAttribute: string;
    hasRFAttribute: string;
    canEditAttribute: string;
    metadata1Attribute: string;
    metadata2Attribute: string;
    metadata3Attribute: string;
    metadata4Attribute: string;
    metadata5Attribute: string;
    command: string;
    commandPayload: string;
    outItemId: string;
    outType: string;
    outChangedNum: string;
    onClicked: {} | null;
    onDoubleClicked: {} | null;
    onChanged: {} | null;
    onAdded: {} | null;
    onDropped: {} | null;
}
