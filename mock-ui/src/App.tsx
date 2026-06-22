import { Button, Layout, Select, Switch, Typography } from "antd";
import { JSX, useCallback, useState } from "react";
import { GanttIncomingEvents } from "../../widgets/ax-ganttchart/src/events/eventTypes";
import { emitEvent } from "../../widgets/ax-ganttchart/src/shared/eventBus/emitEvent";
import { initEventBus } from "../../widgets/ax-ganttchart/src/shared/eventBus/initEventBus";
import { GanttChartDemo, type GanttViewMode } from "./demos/GanttChartDemo";
import { ComboBoxDemo } from "./demos/ComboBoxDemo";
import { DatePickerDemo } from "./demos/DatePickerDemo";
import { useMockGanttActions } from "./mocks/ganttActionMocks";
import { GANTT_DATASETS, getGanttDataset } from "./mocks/ganttDatasets";
import type { GanttBusEventLogEntry } from "./components/GanttEventMonitor";
import "./App.css";

const { Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const GANTT_WIDGET_ID = "mock-ganttchart";

type DemoTab = "gantt" | "datepicker" | "combobox";

const TAB_LABELS: Record<DemoTab, string> = {
    gantt: "Gantt Chart",
    datepicker: "Date Picker",
    combobox: "Combo Box"
};

const GANTT_VIEW_OPTIONS: { value: GanttViewMode; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" }
];

const GANTT_COMMANDS = [
    GanttIncomingEvents.FIT_TIMELINE,
    GanttIncomingEvents.SCROLL_TO_TODAY,
    GanttIncomingEvents.EXPAND_ALL,
    GanttIncomingEvents.COLLAPSE_ALL,
    GanttIncomingEvents.ENTER_FULLSCREEN,
    GanttIncomingEvents.EXIT_FULLSCREEN
] as const;

export function App(): JSX.Element {
    const [tab, setTab] = useState<DemoTab>("gantt");
    const [ganttDataset, setGanttDataset] = useState("default");
    const [ganttViewMode, setGanttViewMode] = useState<GanttViewMode>("month");
    const [ganttShowToolbar, setGanttShowToolbar] = useState(true);
    const [ganttShowGrid, setGanttShowGrid] = useState(true);
    const [ganttShowTimeline, setGanttShowTimeline] = useState(true);
    const [ganttShowProgress, setGanttShowProgress] = useState(false);
    const [ganttShowTodayMarker, setGanttShowTodayMarker] = useState(true);
    const [ganttAllowDrag, setGanttAllowDrag] = useState(true);
    const [ganttAllowResize, setGanttAllowResize] = useState(false);
    const [ganttReadOnly, setGanttReadOnly] = useState(false);
    const [ganttUseDhtmlxTooltip, setGanttUseDhtmlxTooltip] = useState(false);
    const [busEvents, setBusEvents] = useState<GanttBusEventLogEntry[]>([]);
    const { output, actionLog, resetActions, actionPropsVersion, refreshActionProps, actionProps } =
        useMockGanttActions();

    const ganttTasks = getGanttDataset(ganttDataset).tasks;

    const handleBusEvent = useCallback((entry: GanttBusEventLogEntry) => {
        setBusEvents(prev => [entry, ...prev].slice(0, 20));
    }, []);

    const emitGanttCommand = useCallback((command: string, payload?: Record<string, unknown>) => {
        initEventBus();
        emitEvent(command, { widgetId: GANTT_WIDGET_ID, payload });
    }, []);

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
                            <Title level={5}>Mendix action output</Title>
                            <Paragraph type="secondary" style={{ fontSize: 12 }}>
                                Click, drag, reorder, or use the (+) button. Write-back attributes mirror Mendix{" "}
                                <Text code>outItemId</Text>, <Text code>outType</Text>, <Text code>outChangedNum</Text>.
                            </Paragraph>
                            <div className="mock-ui-selection">
                                <Text type="secondary">outItemId</Text>
                                <div className="mock-ui-selection-value">{output.itemId || "—"}</div>
                                <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                                    outType
                                </Text>
                                <div className="mock-ui-selection-value">{output.type || "—"}</div>
                                <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                                    outChangedNum
                                </Text>
                                <div className="mock-ui-selection-value">{output.changedNum || "—"}</div>
                                <Button size="small" style={{ marginTop: 8 }} onClick={resetActions}>
                                    Clear
                                </Button>
                            </div>

                            <Title level={5} style={{ marginTop: 16 }}>
                                Action log
                            </Title>
                            <div style={{ maxHeight: 160, overflow: "auto", fontSize: 11 }}>
                                {actionLog.length === 0 ? (
                                    <Text type="secondary">No actions yet</Text>
                                ) : (
                                    actionLog.map((entry, index) => (
                                        <div key={`${entry.action}-${entry.at}-${index}`} style={{ marginBottom: 6 }}>
                                            {entry.action} — {entry.itemId} ({entry.type})
                                            {entry.changedNum ? ` Δ${entry.changedNum}` : ""}
                                        </div>
                                    ))
                                )}
                            </div>

                            <Title level={5} style={{ marginTop: 16 }}>
                                Store lifecycle test
                            </Title>
                            <Paragraph type="secondary" style={{ fontSize: 12 }}>
                                Mimics Mendix passing new action prop objects on each page render.
                            </Paragraph>
                            <Button size="small" block style={{ marginBottom: 16 }} onClick={refreshActionProps}>
                                Simulate Mendix re-render
                            </Button>

                            <Title level={5}>Event bus log</Title>
                            <div style={{ maxHeight: 120, overflow: "auto", fontSize: 11 }}>
                                {busEvents.length === 0 ? (
                                    <Text type="secondary">No bus events yet</Text>
                                ) : (
                                    busEvents.map((entry, index) => (
                                        <div key={`${entry.topic}-${entry.at}-${index}`} style={{ marginBottom: 6 }}>
                                            {entry.topic}
                                        </div>
                                    ))
                                )}
                            </div>

                            <Title level={5} style={{ marginTop: 24 }}>
                                Dataset
                            </Title>
                            <Select
                                value={ganttDataset}
                                onChange={setGanttDataset}
                                style={{ width: "100%", marginBottom: 16 }}
                                options={GANTT_DATASETS.map(dataset => ({
                                    value: dataset.id,
                                    label: dataset.label
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
                                    ["Today marker", ganttShowTodayMarker, setGanttShowTodayMarker]
                                ] as const
                            ).map(([label, checked, setter]) => (
                                <div key={label} className="mock-ui-toggle-row">
                                    <Text>{label}</Text>
                                    <Switch checked={checked} onChange={setter} />
                                </div>
                            ))}

                            <Title level={5}>Editing</Title>
                            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
                                Drag timeline bars to fire <Text code>onChanged</Text>. Use toolbar{" "}
                                <Text code>Reorder</Text> to drag child rows between parents.
                            </Paragraph>
                            {(
                                [
                                    ["Allow drag", ganttAllowDrag, setGanttAllowDrag],
                                    ["Allow resize", ganttAllowResize, setGanttAllowResize],
                                    ["Read only", ganttReadOnly, setGanttReadOnly]
                                ] as const
                            ).map(([label, checked, setter]) => (
                                <div key={label} className="mock-ui-toggle-row">
                                    <Text>{label}</Text>
                                    <Switch checked={checked} onChange={setter} />
                                </div>
                            ))}

                            <Title level={5}>Tooltip</Title>
                            <div className="mock-ui-toggle-row">
                                <Text>DHTMLX tooltip</Text>
                                <Switch checked={ganttUseDhtmlxTooltip} onChange={setGanttUseDhtmlxTooltip} />
                            </div>
                            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
                                Off = React overlay (default). On = DHTMLX built-in extension.
                            </Paragraph>

                            <Title level={5}>Commands</Title>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                                {GANTT_COMMANDS.map(cmd => (
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
                            tasks={ganttTasks}
                            height={560}
                            defaultViewMode={ganttViewMode}
                            showToolbar={ganttShowToolbar}
                            showGrid={ganttShowGrid}
                            showTimeline={ganttShowTimeline}
                            showProgress={ganttShowProgress}
                            showTodayMarker={ganttShowTodayMarker}
                            allowDrag={ganttAllowDrag}
                            allowResize={ganttAllowResize}
                            allowGridReorder
                            readOnly={ganttReadOnly}
                            actionProps={actionProps}
                            actionPropsVersion={actionPropsVersion}
                            onBusEvent={handleBusEvent}
                            useDhtmlxTooltip={ganttUseDhtmlxTooltip}
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
