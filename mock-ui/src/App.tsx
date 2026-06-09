import { Button, Layout, Segmented, Select, Space, Switch, Tabs, Typography } from "antd";
import type { ChartRecord } from "@iris/chart-core";
import { ChartEvents, type ChartEventPayload } from "@iris/chart-core";
import { useCallback, useMemo, useRef, useState } from "react";
import { BarChartDemo } from "./demos/BarChartDemo";
import { ColumnChartDemo } from "./demos/ColumnChartDemo";
import { GanttChartDemo } from "./demos/GanttChartDemo";
import { ReportChartDemo } from "./demos/ReportChartDemo";
import { StackAreaChartDemo } from "./demos/StackAreaChartDemo";
import type { GanttContextValue } from "../../widgets/ax-ganttchart/src/main/providers/GanttProvider";
import {
    GanttIncomingEvents,
    GanttOutgoingEvents,
    type GanttEventPayload,
    type TaskEventData,
} from "../../widgets/ax-ganttchart/src/main/eventbus/eventTypes";
import type { TimelineViewModeEnum } from "../../widgets/ax-ganttchart/src/typings/AxGanttChartProps";
import { getDatasetJson, MOCK_DATASETS, type DataSourceKind } from "./mocks/datasets";
import { GANTT_DATASETS, getGanttDataset } from "./mocks/ganttDatasets";
import { useMockGanttSelectionFields } from "./mocks/ganttSelection";
import { createMockEditableValue, useMockSelectionFields } from "./mocks/editableValue";
import "./App.css";

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

const CHART_HEIGHT = 440;
const GANTT_HEIGHT = 560;

type ChartTab = "bar" | "column" | "stack" | "report" | "gantt";

export function App(): JSX.Element {
    const [chartTab, setChartTab] = useState<ChartTab>("bar");
    const [dataSource, setDataSource] = useState<DataSourceKind>("flat");
    const [datasetId, setDatasetId] = useState("infra");
    const { selectedId, selectedName, selectedPayload, selectionSummary, resetSelection, applySelection } =
        useMockSelectionFields();
    const [recentEvents, setRecentEvents] = useState<ChartEventPayload[]>([]);
    const [showTitle, setShowTitle] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);
    const [ganttDatasetId, setGanttDatasetId] = useState("default");
    const [ganttViewMode, setGanttViewMode] = useState<TimelineViewModeEnum>("week");
    const [ganttShowToolbar, setGanttShowToolbar] = useState(true);
    const [ganttShowGrid, setGanttShowGrid] = useState(true);
    const [ganttShowTimeline, setGanttShowTimeline] = useState(true);
    const [ganttShowProgress, setGanttShowProgress] = useState(true);
    const [ganttShowTodayMarker, setGanttShowTodayMarker] = useState(true);
    const [ganttEvents, setGanttEvents] = useState<GanttEventPayload[]>([]);
    const ganttContextRef = useRef<GanttContextValue | null>(null);
    const {
        selectedTaskId: ganttSelectedTaskId,
        selectedPayload: ganttSelectedPayload,
        selectionSummary: ganttSelectionSummary,
        resetSelection: resetGanttSelection,
        applySelection: applyGanttSelection,
    } = useMockGanttSelectionFields();

    const handleChartEvent = useCallback(
        (payload: ChartEventPayload) => {
            setRecentEvents(current => [...current.slice(-4), payload]);

            if (
                payload.type === ChartEvents.CHART_CLICK ||
                (payload.type === ChartEvents.CHART_SELECTION_CHANGED &&
                    (payload.data as { record?: ChartRecord }).record)
            ) {
                const record = (payload.data as { record?: ChartRecord }).record;
                applySelection(record);
            }
        },
        [applySelection]
    );

    const jsonString = useMemo(
        () => getDatasetJson(datasetId, dataSource),
        [datasetId, dataSource]
    );
    const jsonData = useMemo(() => createMockEditableValue(jsonString), [jsonString]);

    const dataset = MOCK_DATASETS.find(d => d.id === datasetId) ?? MOCK_DATASETS[0];
    const ganttDataset = getGanttDataset(ganttDatasetId);

    const handleGanttEvent = useCallback(
        (payload: GanttEventPayload) => {
            setGanttEvents(current => [...current.slice(-4), payload]);

            if (
                payload.type === GanttOutgoingEvents.TASK_CLICKED ||
                (payload.type === GanttOutgoingEvents.TASK_SELECTED &&
                    (payload.data as TaskEventData | undefined)?.task)
            ) {
                const task = (payload.data as TaskEventData | undefined)?.task;
                applyGanttSelection(task);
            }
        },
        [applyGanttSelection]
    );

    const emitGanttCommand = useCallback((type: GanttIncomingEvents) => {
        const context = ganttContextRef.current;
        if (!context) {
            return;
        }

        context.eventBus.emit({
            widgetId: context.widgetId,
            type,
        });
    }, []);

    const chartTitle = useMemo(() => {
        const labels: Record<ChartTab, string> = {
            bar: "Bar Chart",
            column: "Column Chart",
            stack: "Stacked Area Chart",
            report: "Report Chart",
            gantt: "Gantt Chart",
        };
        return `${labels[chartTab]} — ${dataset.label} (${dataSource})`;
    }, [chartTab, dataset.label, dataSource]);

    const demoProps = {
        title: chartTitle,
        showTitle,
        showTooltip,
        height: CHART_HEIGHT,
        jsonData,
        dataFormat: dataSource,
        selectedId,
        selectedName,
        selectedPayload,
        onChartEvent: handleChartEvent,
    };

    const remountKey = `${datasetId}-${dataSource}-${showTitle}-${showTooltip}`;
    const ganttRemountKey = `${ganttDatasetId}-${ganttViewMode}-${ganttShowToolbar}-${ganttShowGrid}-${ganttShowTimeline}-${ganttShowProgress}-${ganttShowTodayMarker}`;
    const isGanttTab = chartTab === "gantt";

    return (
        <Layout className="mock-ui-layout">
            <Sider width={320} className="mock-ui-sider" theme="light">
                <div className="mock-ui-sider-inner">
                    <Title level={4}>{isGanttTab ? "Gantt Mock UI" : "Chart Mock UI"}</Title>
                    <Paragraph type="secondary">
                        {isGanttTab
                            ? "Preview ax-ganttchart with Mendix datasource mocks, selection, and event bus commands."
                            : "Preview widget main/components with flat JSON or Elasticsearch aggregation mocks."}
                    </Paragraph>

                    {isGanttTab ? (
                        <>
                            <Text strong>Dataset</Text>
                            <Select
                                style={{ width: "100%", marginBottom: 8 }}
                                value={ganttDatasetId}
                                onChange={setGanttDatasetId}
                                options={GANTT_DATASETS.map(d => ({
                                    value: d.id,
                                    label: d.label,
                                }))}
                            />
                            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 20 }}>
                                {ganttDataset.description}
                            </Paragraph>

                            <Text strong>Default view mode</Text>
                            <Segmented
                                block
                                value={ganttViewMode}
                                onChange={value => setGanttViewMode(value as TimelineViewModeEnum)}
                                options={[
                                    { label: "Day", value: "day" },
                                    { label: "Week", value: "week" },
                                    { label: "Month", value: "month" },
                                ]}
                                style={{ marginBottom: 16 }}
                            />

                            <div className="mock-ui-toggle-row">
                                <Text strong>Show toolbar</Text>
                                <Switch checked={ganttShowToolbar} onChange={setGanttShowToolbar} />
                            </div>
                            <div className="mock-ui-toggle-row">
                                <Text strong>Show grid</Text>
                                <Switch checked={ganttShowGrid} onChange={setGanttShowGrid} />
                            </div>
                            <div className="mock-ui-toggle-row">
                                <Text strong>Show timeline</Text>
                                <Switch
                                    checked={ganttShowTimeline}
                                    onChange={setGanttShowTimeline}
                                />
                            </div>
                            <div className="mock-ui-toggle-row">
                                <Text strong>Show progress</Text>
                                <Switch
                                    checked={ganttShowProgress}
                                    onChange={setGanttShowProgress}
                                />
                            </div>
                            <div className="mock-ui-toggle-row">
                                <Text strong>Today marker</Text>
                                <Switch
                                    checked={ganttShowTodayMarker}
                                    onChange={setGanttShowTodayMarker}
                                />
                            </div>

                            <Text strong>Event bus commands</Text>
                            <Space wrap style={{ margin: "8px 0 16px" }}>
                                <Button size="small" onClick={() => emitGanttCommand(GanttIncomingEvents.ZOOM_DAY)}>
                                    Day
                                </Button>
                                <Button size="small" onClick={() => emitGanttCommand(GanttIncomingEvents.ZOOM_WEEK)}>
                                    Week
                                </Button>
                                <Button size="small" onClick={() => emitGanttCommand(GanttIncomingEvents.ZOOM_MONTH)}>
                                    Month
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => emitGanttCommand(GanttIncomingEvents.SCROLL_TO_TODAY)}
                                >
                                    Today
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => emitGanttCommand(GanttIncomingEvents.FIT_TIMELINE)}
                                >
                                    Fit
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => emitGanttCommand(GanttIncomingEvents.EXPAND_ALL)}
                                >
                                    Expand
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => emitGanttCommand(GanttIncomingEvents.COLLAPSE_ALL)}
                                >
                                    Collapse
                                </Button>
                            </Space>

                            <Text strong>Selection (click task)</Text>
                            <div className="mock-ui-selection">
                                <div>
                                    <Text type="secondary">Task ID</Text>
                                    <div>{ganttSelectionSummary.taskId || "—"}</div>
                                </div>
                                <div>
                                    <Text type="secondary">Payload</Text>
                                    <pre>{ganttSelectionSummary.payload || "—"}</pre>
                                </div>
                            </div>

                            <Text strong style={{ display: "block", marginTop: 20 }}>
                                Event bus (latest)
                            </Text>
                            <div className="mock-ui-events">
                                {ganttEvents.length === 0 ? (
                                    <Text type="secondary">Interact with Gantt to emit events</Text>
                                ) : (
                                    ganttEvents.map((event, index) => (
                                        <div key={`${event.type}-${index}`} className="mock-ui-event-row">
                                            <code>{event.type}</code>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button type="button" className="mock-ui-reset" onClick={resetGanttSelection}>
                                Clear selection
                            </button>
                        </>
                    ) : (
                        <>
                            <Text strong>Data source</Text>
                            <Segmented
                                block
                                value={dataSource}
                                onChange={value => setDataSource(value as DataSourceKind)}
                                options={[
                                    { label: "Flat JSON", value: "flat" },
                                    { label: "Elasticsearch", value: "elastic" },
                                ]}
                                style={{ marginBottom: 16 }}
                            />

                            <Text strong>Dataset</Text>
                            <Select
                                style={{ width: "100%", marginBottom: 8 }}
                                value={datasetId}
                                onChange={setDatasetId}
                                options={MOCK_DATASETS.map(d => ({ value: d.id, label: d.label }))}
                            />
                            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 20 }}>
                                {dataset.description}
                            </Paragraph>

                            <div className="mock-ui-toggle-row">
                                <Text strong>Show chart title</Text>
                                <Switch checked={showTitle} onChange={setShowTitle} />
                            </div>

                            <div className="mock-ui-toggle-row">
                                <Text strong>Show tooltip</Text>
                                <Switch checked={showTooltip} onChange={setShowTooltip} />
                            </div>

                            <Text strong>Selection (click chart)</Text>
                            <div className="mock-ui-selection">
                                <div>
                                    <Text type="secondary">ID</Text>
                                    <div>{selectionSummary.id || "—"}</div>
                                </div>
                                <div>
                                    <Text type="secondary">Name</Text>
                                    <div>{selectionSummary.name || "—"}</div>
                                </div>
                                <div>
                                    <Text type="secondary">Payload</Text>
                                    <pre>{selectionSummary.payload || "—"}</pre>
                                </div>
                            </div>

                            <Text strong style={{ display: "block", marginTop: 20 }}>
                                Event bus (latest)
                            </Text>
                            <div className="mock-ui-events">
                                {recentEvents.length === 0 ? (
                                    <Text type="secondary">Click chart to emit events</Text>
                                ) : (
                                    recentEvents.map((event, index) => (
                                        <div key={`${event.type}-${index}`} className="mock-ui-event-row">
                                            <code>{event.type}</code>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button type="button" className="mock-ui-reset" onClick={resetSelection}>
                                Clear selection
                            </button>
                        </>
                    )}
                </div>
            </Sider>

            <Layout>
                <Content className="mock-ui-content">
                    <Tabs
                        activeKey={chartTab}
                        destroyOnHidden
                        onChange={key => setChartTab(key as ChartTab)}
                        items={[
                            {
                                key: "bar",
                                label: "Bar Chart",
                                children: (
                                    <div className="mock-ui-chart-panel" key={`bar-${remountKey}`}>
                                        <BarChartDemo {...demoProps} />
                                    </div>
                                ),
                            },
                            {
                                key: "column",
                                label: "Column Chart",
                                children: (
                                    <div className="mock-ui-chart-panel" key={`column-${remountKey}`}>
                                        <ColumnChartDemo {...demoProps} />
                                    </div>
                                ),
                            },
                            {
                                key: "stack",
                                label: "Stack Area",
                                children: (
                                    <div className="mock-ui-chart-panel" key={`stack-${remountKey}`}>
                                        <StackAreaChartDemo {...demoProps} />
                                    </div>
                                ),
                            },
                            {
                                key: "report",
                                label: "Report Chart",
                                children: (
                                    <div className="mock-ui-chart-panel" key={`report-${remountKey}`}>
                                        <ReportChartDemo {...demoProps} />
                                    </div>
                                ),
                            },
                            {
                                key: "gantt",
                                label: "Gantt Chart",
                                children: (
                                    <div className="mock-ui-chart-panel" key={`gantt-${ganttRemountKey}`}>
                                        <GanttChartDemo
                                            tasks={ganttDataset.tasks}
                                            height={GANTT_HEIGHT}
                                            defaultViewMode={ganttViewMode}
                                            showToolbar={ganttShowToolbar}
                                            showGrid={ganttShowGrid}
                                            showTimeline={ganttShowTimeline}
                                            showProgress={ganttShowProgress}
                                            showTodayMarker={ganttShowTodayMarker}
                                            selectedTaskId={ganttSelectedTaskId}
                                            selectedPayload={ganttSelectedPayload}
                                            onGanttEvent={handleGanttEvent}
                                            onContextReady={context => {
                                                ganttContextRef.current = context;
                                            }}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}
