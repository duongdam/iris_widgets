import { Button, Input, InputNumber, Layout, Segmented, Select, Space, Switch, Tabs, Typography } from "antd";
import type { ChartRecord } from "@iris/chart-core";
import { ChartEvents, type ChartEventPayload } from "@iris/chart-core";
import { useCallback, useMemo, useRef, useState } from "react";
import { BarChartDemo } from "./demos/BarChartDemo";
import { ColumnChartDemo } from "./demos/ColumnChartDemo";
import { GanttChartDemo } from "./demos/GanttChartDemo";
import { ReportChartDemo } from "./demos/ReportChartDemo";
import { NegativeBarChartDemo } from "./demos/NegativeBarChartDemo";
import { StackAreaChartDemo } from "./demos/StackAreaChartDemo";
import { DatePickerDemo } from "./demos/DatePickerDemo";
import { ComboBoxDemo } from "./demos/ComboBoxDemo";
import { CascadingComboboxDemo } from "./demos/CascadingComboboxDemo";
import { FormWidgetsDemo } from "./demos/FormWidgetsDemo";
import type { GanttContextValue } from "../../widgets/ax-ganttchart/src/main/providers/GanttProvider";
import {
    GanttIncomingEvents,
    GanttOutgoingEvents,
    type GanttEventPayload,
    type TaskEventData,
} from "../../widgets/ax-ganttchart/src/main/eventbus/eventTypes";
import type { TimelineViewModeEnum } from "../../widgets/ax-ganttchart/src/typings/AxGanttChartProps";
import type { ColumnStackModeEnum } from "../../widgets/ax-columnchart/src/typings/AxColumnChartProps";
import { MOCK_DATASETS, getDatasetRecords } from "./mocks/datasets";
import { GANTT_DATASETS, getGanttDataset } from "./mocks/ganttDatasets";
import { useMockGanttSelectionFields } from "./mocks/ganttSelection";
import { useMockSelectionFields } from "./mocks/editableValue";
import "./App.css";

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

const CHART_HEIGHT = 440;
const GANTT_HEIGHT = 560;

type ChartTab =
    | "bar"
    | "column"
    | "stack"
    | "report"
    | "negative"
    | "gantt"
    | "datepicker"
    | "combobox"
    | "cascading"
    | "form";

export function App(): JSX.Element {
    const [chartTab, setChartTab] = useState<ChartTab>("bar");
    const [datasetId, setDatasetId] = useState("infra");
    const { selectedId, selectedName, selectedPayload, selectionSummary, resetSelection, applySelection } =
        useMockSelectionFields();
    const [recentEvents, setRecentEvents] = useState<ChartEventPayload[]>([]);
    const [showTitle, setShowTitle] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);
    const [columnStackMode, setColumnStackMode] = useState<ColumnStackModeEnum>("grouped");
    const [columnWidthPercent, setColumnWidthPercent] = useState(70);
    const [columnShowSeriesLabels, setColumnShowSeriesLabels] = useState(false);
    const [columnRefLineValue, setColumnRefLineValue] = useState<number | undefined>(110);
    const [columnRefLineLabel, setColumnRefLineLabel] = useState("");
    const [refLineValue, setRefLineValue] = useState<number | undefined>(110);
    const [refLineLabel, setRefLineLabel] = useState("");
    const [negativeBaseline, setNegativeBaseline] = useState<number>(0);
    const [negativeBaselineLabel, setNegativeBaselineLabel] = useState("Target");
    const [ganttDatasetId, setGanttDatasetId] = useState("default");
    const [ganttViewMode, setGanttViewMode] = useState<TimelineViewModeEnum>("week");
    const [ganttShowToolbar, setGanttShowToolbar] = useState(true);
    const [ganttShowGrid, setGanttShowGrid] = useState(true);
    const [ganttShowTimeline, setGanttShowTimeline] = useState(true);
    const [ganttShowProgress, setGanttShowProgress] = useState(true);
    const [ganttShowTodayMarker, setGanttShowTodayMarker] = useState(true);
    const [ganttShowCriticalPath, setGanttShowCriticalPath] = useState(false);
    const [ganttShowBaseline, setGanttShowBaseline] = useState(false);
    const [ganttAllowCreate, setGanttAllowCreate] = useState(true);
    const [ganttAllowUpdate, setGanttAllowUpdate] = useState(true);
    const [ganttAllowDelete, setGanttAllowDelete] = useState(true);
    const [ganttAllowDrag, setGanttAllowDrag] = useState(true);
    const [ganttAllowResize, setGanttAllowResize] = useState(true);
    const [ganttReadOnly, setGanttReadOnly] = useState(false);
    const [ganttEvents, setGanttEvents] = useState<GanttEventPayload[]>([]);
    const ganttContextRef = useRef<GanttContextValue | null>(null);
    const chartContextRef = useRef<{ eventBus: { emit: (payload: ChartEventPayload) => void }; widgetId: string } | null>(null);
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

    const records = useMemo(
        () => getDatasetRecords(datasetId),
        [datasetId]
    );

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

    const emitGanttCommand = useCallback((type: GanttIncomingEvents, data?: unknown) => {
        const context = ganttContextRef.current;
        if (context) {
            context.eventBus.emit({
                widgetId: context.widgetId,
                type,
                data,
            });
            return;
        }

        window.__AX_GANTT__?.emit("mock-ganttchart", type, data);
    }, []);

    const emitChartCommand = useCallback((type: ChartEvents) => {
        const context = chartContextRef.current;
        if (context) {
            context.eventBus.emit({ widgetId: context.widgetId, type });
        }
    }, []);

    const chartTitle = useMemo(() => {
        const labels: Record<ChartTab, string> = {
            bar: "Bar Chart",
            column: "Column Chart",
            stack: "Stacked Area Chart",
            report: "Report Chart",
            negative: "Negative Bar Chart",
            gantt: "Gantt Chart",
            datepicker: "Date Picker",
            combobox: "Combo Box",
            cascading: "Cascading Combo Box",
            form: "Form Widgets",
        };
        return `${labels[chartTab]} — ${dataset.label}`;
    }, [chartTab, dataset.label]);

    const demoProps = {
        title: chartTitle,
        showTitle,
        showTooltip,
        height: CHART_HEIGHT,
        records,
        selectedId,
        selectedName,
        selectedPayload,
        onChartEvent: handleChartEvent,
        onContextReady: (context: { eventBus: { emit: (payload: ChartEventPayload) => void }; widgetId: string }) => {
            chartContextRef.current = context;
        },
    };

    const remountKey = `${datasetId}-${showTitle}-${showTooltip}-${columnStackMode}-${columnWidthPercent}-${columnShowSeriesLabels}-${columnRefLineValue}-${columnRefLineLabel}`;
    const ganttRemountKey = `${ganttDatasetId}-${ganttViewMode}`;
    const isGanttTab = chartTab === "gantt";
    const isFormTab =
        chartTab === "datepicker" ||
        chartTab === "combobox" ||
        chartTab === "cascading" ||
        chartTab === "form";

    return (
        <Layout className="mock-ui-layout">
            <Sider width={320} className="mock-ui-sider" theme="light">
                <div className="mock-ui-sider-inner">
                    <Title level={4}>
                        {isFormTab ? "Form Widget Mock UI" : isGanttTab ? "Gantt Mock UI" : "Chart Mock UI"}
                    </Title>
                    <Paragraph type="secondary">
                        {isFormTab
                            ? "Preview ax form widgets (Input, Number, Switch, TextArea, CheckboxGroup, DatePicker, ComboBox) with antd controls and Mendix attribute mocks."
                            : isGanttTab
                              ? "Preview ax-ganttchart with Mendix datasource mocks, selection, and event bus commands."
                              : "Preview widget main/components with flat JSON or Elasticsearch aggregation mocks."}
                    </Paragraph>

                    {isFormTab ? (
                        <Paragraph type="secondary" style={{ fontSize: 12 }}>
                            Use the tabs to switch between DatePicker, ComboBox, and Cascading demos. Controls
                            are embedded in each demo panel.
                        </Paragraph>
                    ) : isGanttTab ? (
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
                                    { label: "Quarter", value: "quarter" },
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
                            <div className="mock-ui-toggle-row">
                                <Text strong>Critical path</Text>
                                <Switch
                                    checked={ganttShowCriticalPath}
                                    onChange={setGanttShowCriticalPath}
                                />
                            </div>
                            <div className="mock-ui-toggle-row">
                                <Text strong>Baseline</Text>
                                <Switch checked={ganttShowBaseline} onChange={setGanttShowBaseline} />
                            </div>

                            <Text strong style={{ display: "block", marginTop: 12 }}>
                                Editing
                            </Text>
                            <div className="mock-ui-toggle-row">
                                <Text strong>Read only</Text>
                                <Switch checked={ganttReadOnly} onChange={setGanttReadOnly} />
                            </div>
                            <div className="mock-ui-toggle-row">
                                <Text strong>Allow create</Text>
                                <Switch
                                    checked={ganttAllowCreate}
                                    onChange={setGanttAllowCreate}
                                    disabled={ganttReadOnly}
                                />
                            </div>
                            <div className="mock-ui-toggle-row">
                                <Text strong>Allow update</Text>
                                <Switch
                                    checked={ganttAllowUpdate}
                                    onChange={setGanttAllowUpdate}
                                    disabled={ganttReadOnly}
                                />
                            </div>
                            <div className="mock-ui-toggle-row">
                                <Text strong>Allow delete</Text>
                                <Switch
                                    checked={ganttAllowDelete}
                                    onChange={setGanttAllowDelete}
                                    disabled={ganttReadOnly}
                                />
                            </div>
                            <div className="mock-ui-toggle-row">
                                <Text strong>Allow drag</Text>
                                <Switch
                                    checked={ganttAllowDrag}
                                    onChange={setGanttAllowDrag}
                                    disabled={ganttReadOnly}
                                />
                            </div>
                            <div className="mock-ui-toggle-row">
                                <Text strong>Allow resize</Text>
                                <Switch
                                    checked={ganttAllowResize}
                                    onChange={setGanttAllowResize}
                                    disabled={ganttReadOnly}
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
                                <Button
                                    size="small"
                                    onClick={() => emitGanttCommand(GanttIncomingEvents.TOGGLE_EXPAND_HEIGHT)}
                                >
                                    Height
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => emitGanttCommand(GanttIncomingEvents.ENTER_FULLSCREEN)}
                                >
                                    Fullscreen
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => emitGanttCommand(GanttIncomingEvents.REFRESH)}
                                >
                                    Refresh
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => emitGanttCommand(GanttIncomingEvents.EXPORT_PDF)}
                                >
                                    Export PDF
                                </Button>
                            </Space>
                            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
                                Commands also work via{" "}
                                <Text code>window.__AX_GANTT__.emit("mock-ganttchart", "FIT_TIMELINE")</Text>
                            </Paragraph>

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

                            <Text strong style={{ display: "block", marginTop: 12, marginBottom: 8 }}>
                                Chart commands
                            </Text>
                            <Space wrap style={{ marginBottom: 16 }}>
                                <Button size="small" onClick={() => emitChartCommand(ChartEvents.ENTER_FULLSCREEN)}>
                                    Fullscreen
                                </Button>
                                <Button size="small" onClick={() => emitChartCommand(ChartEvents.EXIT_FULLSCREEN)}>
                                    Exit fullscreen
                                </Button>
                                <Button size="small" onClick={() => emitChartCommand(ChartEvents.CHART_REFRESH)}>
                                    Refresh
                                </Button>
                            </Space>

                            {chartTab === "column" && (
                                <>
                                    <Text strong style={{ display: "block", marginTop: 12, marginBottom: 8 }}>
                                        Stack mode
                                    </Text>
                                    <Segmented
                                        block
                                        value={columnStackMode}
                                        onChange={value => setColumnStackMode(value as ColumnStackModeEnum)}
                                        options={[
                                            { label: "Grouped", value: "grouped" },
                                            { label: "Stacked", value: "stacked" },
                                        ]}
                                        style={{ marginBottom: 12 }}
                                    />

                                    <Text strong style={{ display: "block", marginBottom: 4 }}>
                                        Column width (%)
                                    </Text>
                                    <InputNumber
                                        style={{ width: "100%", marginBottom: 12 }}
                                        min={10}
                                        max={100}
                                        value={columnWidthPercent}
                                        onChange={v => setColumnWidthPercent(v ?? 70)}
                                    />

                                    <div className="mock-ui-toggle-row">
                                        <Text strong>Show series labels</Text>
                                        <Switch
                                            checked={columnShowSeriesLabels}
                                            onChange={setColumnShowSeriesLabels}
                                        />
                                    </div>

                                    <Text strong style={{ display: "block", marginTop: 12, marginBottom: 4 }}>
                                        Reference Line
                                    </Text>
                                    <InputNumber
                                        style={{ width: "100%", marginBottom: 6 }}
                                        placeholder="Value (leave empty to hide)"
                                        value={columnRefLineValue}
                                        onChange={v => setColumnRefLineValue(v ?? undefined)}
                                    />
                                    <Input
                                        style={{ marginBottom: 12 }}
                                        placeholder="Label (optional)"
                                        value={columnRefLineLabel}
                                        onChange={e => setColumnRefLineLabel(e.target.value)}
                                    />
                                </>
                            )}

                            {chartTab === "stack" && (
                                <>
                                    <Text strong style={{ display: "block", marginTop: 12, marginBottom: 4 }}>
                                        Reference Line
                                    </Text>
                                    <InputNumber
                                        style={{ width: "100%", marginBottom: 6 }}
                                        placeholder="Value (leave empty to hide)"
                                        value={refLineValue}
                                        onChange={v => setRefLineValue(v ?? undefined)}
                                    />
                                    <Input
                                        style={{ marginBottom: 12 }}
                                        placeholder="Label (optional)"
                                        value={refLineLabel}
                                        onChange={e => setRefLineLabel(e.target.value)}
                                    />
                                </>
                            )}

                            {chartTab === "negative" && (
                                <>
                                    <Text strong style={{ display: "block", marginTop: 12, marginBottom: 4 }}>
                                        Baseline
                                    </Text>
                                    <InputNumber
                                        style={{ width: "100%", marginBottom: 6 }}
                                        placeholder="Baseline value"
                                        value={negativeBaseline}
                                        onChange={v => setNegativeBaseline(v ?? 0)}
                                    />
                                    <Input
                                        style={{ marginBottom: 12 }}
                                        placeholder="Baseline label"
                                        value={negativeBaselineLabel}
                                        onChange={e => setNegativeBaselineLabel(e.target.value)}
                                    />
                                </>
                            )}

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
                                        <ColumnChartDemo
                                            {...demoProps}
                                            stackMode={columnStackMode}
                                            columnWidthPercent={columnWidthPercent}
                                            showSeriesLabels={columnShowSeriesLabels}
                                            referenceLineValue={columnRefLineValue}
                                            referenceLineLabel={columnRefLineLabel}
                                        />
                                    </div>
                                ),
                            },
                            {
                                key: "stack",
                                label: "Stack Area",
                                children: (
                                    <div className="mock-ui-chart-panel" key={`stack-${remountKey}`}>
                                        <StackAreaChartDemo
                                            {...demoProps}
                                            referenceLineValue={refLineValue}
                                            referenceLineLabel={refLineLabel}
                                        />
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
                                key: "negative",
                                label: "Negative Bar",
                                children: (
                                    <div className="mock-ui-chart-panel" key={`negative-${remountKey}`}>
                                        <NegativeBarChartDemo
                                            {...demoProps}
                                            baselineValue={negativeBaseline}
                                            baselineLabel={negativeBaselineLabel}
                                        />
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
                                            showCriticalPath={ganttShowCriticalPath}
                                            showBaseline={ganttShowBaseline}
                                            allowCreate={ganttAllowCreate}
                                            allowUpdate={ganttAllowUpdate}
                                            allowDelete={ganttAllowDelete}
                                            allowDrag={ganttAllowDrag}
                                            allowResize={ganttAllowResize}
                                            readOnly={ganttReadOnly}
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
                            {
                                key: "datepicker",
                                label: "Date Picker",
                                children: (
                                    <div className="mock-ui-form-panel-wrap">
                                        <DatePickerDemo />
                                    </div>
                                ),
                            },
                            {
                                key: "combobox",
                                label: "Combo Box",
                                children: (
                                    <div className="mock-ui-form-panel-wrap">
                                        <ComboBoxDemo />
                                    </div>
                                ),
                            },
                            {
                                key: "cascading",
                                label: "Cascading",
                                children: (
                                    <div className="mock-ui-form-panel-wrap">
                                        <CascadingComboboxDemo />
                                    </div>
                                ),
                            },
                            {
                                key: "form",
                                label: "Form",
                                children: (
                                    <div className="mock-ui-form-panel-wrap">
                                        <FormWidgetsDemo />
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
