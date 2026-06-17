import type { ActionValue, EditableValue, ListAttributeValue, ListValue, ObjectItem } from "mendix";
import type { CSSProperties } from "react";
import type { Big } from "big.js";

export type TimelineViewModeEnum = "day" | "week" | "month";

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
    /** Sibling sort order within the same parent branch. */
    orderNoAttribute?: ListAttributeValue<Big>;
    openAttribute?: ListAttributeValue<boolean>;
    typeAttribute?: ListAttributeValue<string>;
    /** Optional JSON array or comma-separated tag labels (e.g. Manual, Process). */
    tagsAttribute?: ListAttributeValue<string>;
    /** MTO/K/O milestone date (MTO = midpoint, K/O = bar start). */
    mtoDateAttribute?: ListAttributeValue<Date>;
    /** Event marker type: MTO or K/O. */
    eventTypeAttribute?: ListAttributeValue<string>;
    showToolbar: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    showCriticalPath: boolean;
    showBaseline: boolean;
    allowDrag: boolean;
    allowResize: boolean;
    allowGridReorder: boolean;
    readOnly: boolean;
    defaultViewMode: TimelineViewModeEnum;
    command?: EditableValue<string>;
    commandPayload?: EditableValue<string>;
    exportServerUrl?: string;
    onEvent?: ActionValue;
}

export type { ObjectItem };
