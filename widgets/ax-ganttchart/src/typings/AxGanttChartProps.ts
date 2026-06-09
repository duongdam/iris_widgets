import type { ActionValue, EditableValue, ListAttributeValue, ListValue, ObjectItem } from "mendix";
import type { CSSProperties } from "react";
import type { Big } from "big.js";

export type TimelineViewModeEnum = "day" | "week" | "month" | "quarter";

export interface AxGanttChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxGanttChartProps extends AxGanttChartContainerProps {
    height: number;
    tasksDatasource: ListValue;
    idAttribute: ListAttributeValue<string | Big>;
    textAttribute: ListAttributeValue<string>;
    startDateAttribute: ListAttributeValue<Date>;
    endDateAttribute?: ListAttributeValue<Date>;
    durationAttribute?: ListAttributeValue<Big>;
    progressAttribute?: ListAttributeValue<Big>;
    parentAttribute?: ListAttributeValue<string>;
    openAttribute?: ListAttributeValue<boolean>;
    typeAttribute?: ListAttributeValue<string>;
    showToolbar: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    defaultViewMode: TimelineViewModeEnum;
    selectedTaskId?: EditableValue<string>;
    selectedPayload?: EditableValue<string>;
    exportServerUrl?: string;
    onTaskClick?: ActionValue;
    onTaskDoubleClick?: ActionValue;
    onTaskCreated?: ActionValue;
    onTaskUpdated?: ActionValue;
    onTaskDeleted?: ActionValue;
    onSelectionChanged?: ActionValue;
}

export type { ObjectItem };
