import { ValueStatus, type ListValue } from "mendix";
import { AxGanttChartView } from "./main/components/AxGanttChartView";
import { GanttProvider } from "./main/providers/GanttProvider";
import { ThemeProvider } from "./main/providers/ThemeProvider";
import { MOCK_GANTT_TASKS, PREVIEW_HEIGHT, PREVIEW_VIEW_MODE } from "./preview/previewConfig";
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
    height: PREVIEW_HEIGHT,
    tasksDatasource: previewDatasource,
    idAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["idAttribute"],
    textAttribute: (() => ({ status: ValueStatus.Unavailable })) as unknown as AxGanttChartProps["textAttribute"],
    startDateAttribute: (() => ({
        status: ValueStatus.Unavailable
    })) as unknown as AxGanttChartProps["startDateAttribute"],
    showToolbar: true,
    showGrid: true,
    showTimeline: true,
    showProgress: true,
    showTodayMarker: true,
    showCriticalPath: false,
    showBaseline: false,
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    allowDrag: true,
    allowResize: true,
    readOnly: false,
    defaultViewMode: PREVIEW_VIEW_MODE
};

export function preview(getProps: () => AxGanttChartProps): JSX.Element {
    const props = { ...previewProps, ...getProps() };
    return (
        <ThemeProvider>
            <GanttProvider widgetProps={props} previewTasks={MOCK_GANTT_TASKS}>
                <AxGanttChartView widgetProps={props} />
            </GanttProvider>
        </ThemeProvider>
    );
}

export function AxGanttChartPreview(): JSX.Element {
    return preview(() => previewProps);
}
