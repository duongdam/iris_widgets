import { Layout, Segmented, Select, Switch, Tabs, Typography } from "antd";
import type { ChartRecord } from "@iris/chart-core";
import { ChartEvents, type ChartEventPayload } from "@iris/chart-core";
import { useCallback, useMemo, useState } from "react";
import { BarChartDemo } from "./demos/BarChartDemo";
import { ColumnChartDemo } from "./demos/ColumnChartDemo";
import { ReportChartDemo } from "./demos/ReportChartDemo";
import { StackAreaChartDemo } from "./demos/StackAreaChartDemo";
import { getDatasetJson, MOCK_DATASETS, type DataSourceKind } from "./mocks/datasets";
import { createMockEditableValue, useMockSelectionFields } from "./mocks/editableValue";
import "./App.css";

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

const CHART_HEIGHT = 440;

type ChartTab = "bar" | "column" | "stack" | "report";

export function App(): JSX.Element {
    const [chartTab, setChartTab] = useState<ChartTab>("bar");
    const [dataSource, setDataSource] = useState<DataSourceKind>("flat");
    const [datasetId, setDatasetId] = useState("infra");
    const { selectedId, selectedName, selectedPayload, selectionSummary, resetSelection, applySelection } =
        useMockSelectionFields();
    const [recentEvents, setRecentEvents] = useState<ChartEventPayload[]>([]);
    const [showTitle, setShowTitle] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);

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

    const chartTitle = useMemo(() => {
        const labels: Record<ChartTab, string> = {
            bar: "Bar Chart",
            column: "Column Chart",
            stack: "Stacked Area Chart",
            report: "Report Chart",
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

    return (
        <Layout className="mock-ui-layout">
            <Sider width={320} className="mock-ui-sider" theme="light">
                <div className="mock-ui-sider-inner">
                    <Title level={4}>Chart Mock UI</Title>
                    <Paragraph type="secondary">
                        Preview widget <code>main/components</code> with flat JSON or Elasticsearch
                        aggregation mocks.
                    </Paragraph>

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
                        ]}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}
