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
    parentAttribute?: ListAttributeValue<string | Big>;
    openAttribute?: ListAttributeValue<boolean>;
    typeAttribute?: ListAttributeValue<string>;
    /** Optional JSON array or comma-separated tag labels (e.g. Manual, Process). */
    tagsAttribute?: ListAttributeValue<string>;
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
    defaultViewMode: TimelineViewModeEnum;
    selectedTaskId?: EditableValue<string | Big>;
    selectedPayload?: EditableValue<string>;
    command?: EditableValue<string>;
    commandPayload?: EditableValue<string>;
    exportServerUrl?: string;
    onTaskClick?: ActionValue;
    onTaskDoubleClick?: ActionValue;
    onTaskCreated?: ActionValue;
    onTaskUpdated?: ActionValue;
    onTaskDeleted?: ActionValue;
    onSelectionChanged?: ActionValue;
    onAddTask?: ActionValue;
}

export type { ObjectItem };
