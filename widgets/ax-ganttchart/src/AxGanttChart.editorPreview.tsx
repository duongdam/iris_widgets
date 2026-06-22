import { JSX, useRef } from "react";
import { ValueStatus, type ListValue } from "mendix";
import { AxGanttInner } from "./AxGanttInner";
import { AxGanttChartView } from "./main/AxGanttChartView";
import { GANTT_TEST_TASKS } from "./shared/mock/ganttTestData";
import type { AxGanttChartProps } from "./typings/AxGanttChartProps";
import "./styles/gantt.scss";

const previewDatasource = {
    status: ValueStatus.Available,
    offset: 0,
    limit: 100,
    setOffset: () => undefined,
    setLimit: () => undefined,
    requestTotalCount: () => undefined,
    items: [],
    sortOrder: [],
    filter: undefined,
    setSortOrder: () => undefined,
    setFilter: () => undefined,
    reload: () => undefined
} as unknown as ListValue;

const previewProps: AxGanttChartProps = {
    name: "ax-ganttchart-preview",
    class: "ax-ganttchart-preview",
    height: { status: ValueStatus.Available, value: { toNumber: () => 600 } } as unknown as AxGanttChartProps["height"],
    defaultViewMode: { status: ValueStatus.Available, value: "month" } as unknown as AxGanttChartProps["defaultViewMode"],
    roadmapItems: previewDatasource,
    aidAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["aidAttribute"],
    itemIdAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["itemIdAttribute"],
    parentIdAttribute: (() => ({
        status: ValueStatus.Unavailable
    })) as unknown as AxGanttChartProps["parentIdAttribute"],
    groupAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["groupAttribute"],
    typeAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["typeAttribute"],
    nameAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["nameAttribute"],
    textAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["textAttribute"],
    countAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["countAttribute"],
    orderAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["orderAttribute"],
    customOrderAttribute: (() => ({
        status: ValueStatus.Unavailable
    })) as unknown as AxGanttChartProps["customOrderAttribute"],
    milestoneAttribute: (() => ({
        status: ValueStatus.Unavailable
    })) as unknown as AxGanttChartProps["milestoneAttribute"],
    stndMileMonthAttribute: (() => ({
        status: ValueStatus.Unavailable
    })) as unknown as AxGanttChartProps["stndMileMonthAttribute"],
    hasTuningAttribute: (() => ({
        status: ValueStatus.Unavailable
    })) as unknown as AxGanttChartProps["hasTuningAttribute"],
    hasManualAttribute: (() => ({
        status: ValueStatus.Unavailable
    })) as unknown as AxGanttChartProps["hasManualAttribute"],
    hasCertAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["hasCertAttribute"],
    hasRFAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["hasRFAttribute"],
    showToolbar: true,
    showGrid: true,
    showTimeline: true,
    showProgress: false,
    showTodayMarker: true,
    allowDrag: { status: ValueStatus.Available, value: true } as unknown as AxGanttChartProps["allowDrag"],
    allowResize: { status: ValueStatus.Available, value: false } as unknown as AxGanttChartProps["allowResize"],
    allowGridReorder: { status: ValueStatus.Available, value: true } as unknown as AxGanttChartProps["allowGridReorder"],
    readOnly: { status: ValueStatus.Available, value: false } as unknown as AxGanttChartProps["readOnly"]
};

export function preview(getProps: () => AxGanttChartProps): JSX.Element {
    const props = { ...previewProps, ...getProps() };
    const rootRef = useRef<HTMLDivElement>(null);

    return (
        <AxGanttInner widgetProps={props} previewTasks={GANTT_TEST_TASKS} containerRef={rootRef}>
            <AxGanttChartView widgetProps={props} rootRef={rootRef} />
        </AxGanttInner>
    );
}

export function AxGanttChartPreview(): JSX.Element {
    return preview(() => previewProps);
}
