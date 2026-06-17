import { Button, Layout, Select, Switch, Typography } from "antd";
import { JSX, useCallback, useMemo, useState } from "react";
import type { GanttContextValue } from "../../widgets/ax-ganttchart/src/main/providers/GanttProvider";
import type { GanttEventPayload } from "../../widgets/ax-ganttchart/src/main/eventbus/eventTypes";
import type { GanttTask } from "../../widgets/ax-ganttchart/src/main/eventbus/eventTypes";
import type { TimelineViewModeEnum } from "../../widgets/ax-ganttchart/src/typings/AxGanttChartProps";
import { ComboBoxDemo } from "./demos/ComboBoxDemo";
import { DatePickerDemo } from "./demos/DatePickerDemo";
import { GanttChartDemo } from "./demos/GanttChartDemo";
import { GANTT_DATASETS, getGanttDataset } from "./mocks/ganttDatasets";
import { useMockGanttSelectionFields } from "./mocks/ganttSelection";
import "./App.css";

const { Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const GANTT_WIDGET_ID = "mock-ganttchart";

type DemoTab = "gantt" | "datepicker" | "combobox";

const TAB_LABELS: Record<DemoTab, string> = {
    gantt: "Gantt Chart",
    datepicker: "Date Picker",
    combobox: "Combo Box",
};

const GANTT_VIEW_OPTIONS: { value: TimelineViewModeEnum; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
];

function extractTaskFromEventData(data: unknown): GanttTask | undefined {
    if (!data || typeof data !== "object") {
        return undefined;
    }
    const record = data as Record<string, unknown>;
    if (record.task && typeof record.task === "object") {
        return record.task as GanttTask;
    }
    return undefined;
}

function formatEventSummary(payload: GanttEventPayload): string {
    const task = extractTaskFromEventData(payload.data);
    if (task) {
        return `${payload.type} — ${task.text} (${task.id})`;
    }
    if (payload.data !== undefined) {
        return `${payload.type} — ${JSON.stringify(payload.data)}`;
    }
    return payload.type;
}

export function App(): JSX.Element {
    const [tab, setTab] = useState<DemoTab>("gantt");
    const [ganttDataset, setGanttDataset] = useState("default");
    const [ganttViewMode, setGanttViewMode] = useState<TimelineViewModeEnum>("month");
    const [ganttShowToolbar, setGanttShowToolbar] = useState(true);
    const [ganttShowGrid, setGanttShowGrid] = useState(true);
    const [ganttShowTimeline, setGanttShowTimeline] = useState(true);
    const [ganttShowProgress, setGanttShowProgress] = useState(false);
    const [ganttShowTodayMarker, setGanttShowTodayMarker] = useState(true);
    const [ganttShowCriticalPath, setGanttShowCriticalPath] = useState(false);
    const [ganttShowBaseline, setGanttShowBaseline] = useState(false);
    const [ganttAllowDrag, setGanttAllowDrag] = useState(true);
    const [ganttAllowResize, setGanttAllowResize] = useState(false);
    const [ganttReadOnly, setGanttReadOnly] = useState(false);
    const [ganttContext, setGanttContext] = useState<GanttContextValue | null>(null);
    const [ganttEvents, setGanttEvents] = useState<GanttEventPayload[]>([]);
    const [lastGanttEvent, setLastGanttEvent] = useState<GanttEventPayload | null>(null);
    const [registryLastEvent, setRegistryLastEvent] = useState<GanttEventPayload | null>(null);
    const { selectionSummary, resetSelection, applySelection } = useMockGanttSelectionFields();

    const ganttTasks = getGanttDataset(ganttDataset).tasks;

    const handleGanttEvent = useCallback(
        (payload: GanttEventPayload) => {
            setGanttEvents(prev => [payload, ...prev].slice(0, 20));
            setLastGanttEvent(payload);

            const task = extractTaskFromEventData(payload.data);
            if (task) {
                applySelection(task);
            }
        },
        [applySelection]
    );

    const refreshRegistryLastEvent = useCallback(() => {
        const registry = (window as Window & { __AX_GANTT__?: { getLastEvent: (id: string) => GanttEventPayload | undefined } })
            .__AX_GANTT__;
        setRegistryLastEvent(registry?.getLastEvent(GANTT_WIDGET_ID) ?? null);
    }, []);

    const emitGanttCommand = useCallback(
        (command: string, payload?: unknown) => {
            if (ganttContext?.eventBus) {
                ganttContext.eventBus.emit({
                    widgetId: GANTT_WIDGET_ID,
                    type: command as GanttEventPayload["type"],
                    data: payload,
                });
                return;
            }
            const registry = (window as Window & { __AX_GANTT__?: { emit: (id: string, cmd: string, data?: unknown) => void } })
                .__AX_GANTT__;
            registry?.emit(GANTT_WIDGET_ID, command, payload);
        },
        [ganttContext]
    );

    const ganttRemountKey = useMemo(
        () =>
            [
                ganttDataset,
                ganttViewMode,
                ganttShowToolbar,
                ganttShowGrid,
                ganttShowTimeline,
                ganttShowProgress,
                ganttShowTodayMarker,
                ganttShowCriticalPath,
                ganttShowBaseline,
                ganttAllowDrag,
                ganttAllowResize,
                ganttReadOnly,
            ].join("|"),
        [
            ganttDataset,
            ganttViewMode,
            ganttShowToolbar,
            ganttShowGrid,
            ganttShowTimeline,
            ganttShowProgress,
            ganttShowTodayMarker,
            ganttShowCriticalPath,
            ganttShowBaseline,
            ganttAllowDrag,
            ganttAllowResize,
            ganttReadOnly,
        ]
    );

    const isFormTab = tab === "datepicker" || tab === "combobox";

    return (
        <Layout className="mock-ui-layout">
            <Sider width={320} className="mock-ui-sider">
                <div className="mock-ui-sider-inner">
                    <Title level={4} style={{ marginTop: 0 }}>
                        Iris Widgets
                    </Title>
                    <Paragraph type="secondary" style={{ fontSize: 13 }}>
                        Preview widgets without Mendix Studio Pro.
                    </Paragraph>

                    <div style={{ marginBottom: 24 }}>
                        {(Object.keys(TAB_LABELS) as DemoTab[]).map(key => (
                            <Button
                                key={key}
                                type={tab === key ? "primary" : "default"}
                                block
                                style={{ marginBottom: 8, textAlign: "left" }}
                                onClick={() => setTab(key)}
                            >
                                {TAB_LABELS[key]}
                            </Button>
                        ))}
                    </div>

                    {tab === "gantt" && (
                        <>
                            <Title level={5}>Selection (event bus)</Title>
                            <Paragraph type="secondary" style={{ fontSize: 12 }}>
                                Click or double-click tasks. In Mendix, use a single <Text code>onEvent</Text> action
                                and read <Text code>window.__AX_GANTT__.getLastEvent(widgetName)</Text>.
                            </Paragraph>
                            <div className="mock-ui-selection">
                                <Text type="secondary">Task ID</Text>
                                <div className="mock-ui-selection-value">{selectionSummary.taskId || "—"}</div>
                                <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                                    Payload
                                </Text>
                                <pre className="mock-ui-selection-value" style={{ whiteSpace: "pre-wrap", margin: "8px 0 0" }}>
                                    {selectionSummary.payload || "—"}
                                </pre>
                                <Button size="small" style={{ marginTop: 8 }} onClick={resetSelection}>
                                    Clear
                                </Button>
                            </div>

                            <Title level={5} style={{ marginTop: 16 }}>
                                getLastEvent (Mendix nanoflow)
                            </Title>
                            <Button size="small" onClick={refreshRegistryLastEvent} style={{ marginBottom: 8 }}>
                                Refresh from registry
                            </Button>
                            <pre className="mock-ui-selection-value" style={{ whiteSpace: "pre-wrap", fontSize: 11 }}>
                                {registryLastEvent ? JSON.stringify(registryLastEvent, null, 2) : "—"}
                            </pre>

                            <Title level={5} style={{ marginTop: 16 }}>
                                Event log
                            </Title>
                            <div style={{ maxHeight: 200, overflow: "auto", fontSize: 11 }}>
                                {ganttEvents.length === 0 ? (
                                    <Text type="secondary">No events yet</Text>
                                ) : (
                                    ganttEvents.map((event, index) => (
                                        <div key={`${event.type}-${index}`} style={{ marginBottom: 6 }}>
                                            {formatEventSummary(event)}
                                        </div>
                                    ))
                                )}
                            </div>
                            {lastGanttEvent && (
                                <pre
                                    className="mock-ui-selection-value"
                                    style={{ whiteSpace: "pre-wrap", fontSize: 10, marginTop: 8 }}
                                >
                                    {JSON.stringify(lastGanttEvent, null, 2)}
                                </pre>
                            )}

                            <Title level={5} style={{ marginTop: 24 }}>
                                Dataset
                            </Title>
                            <Select
                                value={ganttDataset}
                                onChange={setGanttDataset}
                                style={{ width: "100%", marginBottom: 16 }}
                                options={GANTT_DATASETS.map(dataset => ({
                                    value: dataset.id,
                                    label: dataset.label,
                                }))}
                            />

                            <Title level={5}>View mode</Title>
                            <Select
                                value={ganttViewMode}
                                onChange={setGanttViewMode}
                                style={{ width: "100%", marginBottom: 16 }}
                                options={GANTT_VIEW_OPTIONS}
                            />

                            <Title level={5}>Display</Title>
                            {(
                                [
                                    ["Toolbar", ganttShowToolbar, setGanttShowToolbar],
                                    ["Grid", ganttShowGrid, setGanttShowGrid],
                                    ["Timeline", ganttShowTimeline, setGanttShowTimeline],
                                    ["Progress", ganttShowProgress, setGanttShowProgress],
                                    ["Today marker", ganttShowTodayMarker, setGanttShowTodayMarker],
                                    ["Critical path", ganttShowCriticalPath, setGanttShowCriticalPath],
                                    ["Baseline", ganttShowBaseline, setGanttShowBaseline],
                                ] as const
                            ).map(([label, checked, setter]) => (
                                <div key={label} className="mock-ui-toggle-row">
                                    <Text>{label}</Text>
                                    <Switch checked={checked} onChange={setter} />
                                </div>
                            ))}

                            <Title level={5}>Editing</Title>
                            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
                                Create, update, and delete are always enabled unless read-only. MTO/K/O events are
                                move-only (no resize). Use toolbar <Text code>Reorder</Text> to drag child rows between
                                parents.
                            </Paragraph>
                            {(
                                [
                                    ["Allow drag", ganttAllowDrag, setGanttAllowDrag],
                                    ["Allow resize", ganttAllowResize, setGanttAllowResize],
                                    ["Read only", ganttReadOnly, setGanttReadOnly],
                                ] as const
                            ).map(([label, checked, setter]) => (
                                <div key={label} className="mock-ui-toggle-row">
                                    <Text>{label}</Text>
                                    <Switch checked={checked} onChange={setter} />
                                </div>
                            ))}

                            <Title level={5}>Commands</Title>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                                {[
                                    "FIT_TIMELINE",
                                    "SCROLL_TO_TODAY",
                                    "EXPAND_ALL",
                                    "COLLAPSE_ALL",
                                    "ENTER_FULLSCREEN",
                                    "EXIT_FULLSCREEN",
                                ].map(cmd => (
                                    <Button key={cmd} size="small" onClick={() => emitGanttCommand(cmd)}>
                                        {cmd}
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}

                    {isFormTab && (
                        <Paragraph type="secondary" style={{ fontSize: 13 }}>
                            Controls for {TAB_LABELS[tab]} are in the demo panel.
                        </Paragraph>
                    )}
                </div>
            </Sider>

            <Content className="mock-ui-content">
                {tab === "gantt" && (
                    <div className="mock-ui-chart-panel">
                        <GanttChartDemo
                            key={ganttRemountKey}
                            tasks={ganttTasks}
                            height={560}
                            defaultViewMode={ganttViewMode}
                            showToolbar={ganttShowToolbar}
                            showGrid={ganttShowGrid}
                            showTimeline={ganttShowTimeline}
                            showProgress={ganttShowProgress}
                            showTodayMarker={ganttShowTodayMarker}
                            showCriticalPath={ganttShowCriticalPath}
                            showBaseline={ganttShowBaseline}
                            allowDrag={ganttAllowDrag}
                            allowResize={ganttAllowResize}
                            allowGridReorder
                            readOnly={ganttReadOnly}
                            onGanttEvent={handleGanttEvent}
                            onContextReady={setGanttContext}
                        />
                    </div>
                )}
                {tab === "datepicker" && (
                    <div className="mock-ui-form-panel-wrap">
                        <DatePickerDemo />
                    </div>
                )}
                {tab === "combobox" && (
                    <div className="mock-ui-form-panel-wrap">
                        <ComboBoxDemo />
                    </div>
                )}
            </Content>
        </Layout>
    );
}
