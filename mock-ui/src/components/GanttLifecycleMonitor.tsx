import { Typography } from "antd";
import { observer } from "mobx-react-lite";
import { JSX } from "react";
import { useAxGanttContext } from "../../../widgets/ax-ganttchart/src/AxGanttInner";

const { Text } = Typography;

export interface GanttLifecycleMonitorProps {
    parentRenderCount: number;
    actionPropsVersion: number;
}

export const GanttLifecycleMonitor = observer(function GanttLifecycleMonitor({
    parentRenderCount,
    actionPropsVersion
}: GanttLifecycleMonitorProps): JSX.Element {
    const { store } = useAxGanttContext();

    return (
        <div className="mock-ui-lifecycle-panel">
            <Text strong>Store lifecycle</Text>
            <div className="mock-ui-lifecycle-grid">
                <Text type="secondary">Store instance</Text>
                <Text code>#{store.instanceId}</Text>
                <Text type="secondary">Parent renders</Text>
                <Text code>{parentRenderCount}</Text>
                <Text type="secondary">Action props version</Text>
                <Text code>{actionPropsVersion}</Text>
                <Text type="secondary">Expand level</Text>
                <Text code>{store.expandLevel}</Text>
                <Text type="secondary">Selected task</Text>
                <Text code>{store.selectedTask?.id ?? "—"}</Text>
                <Text type="secondary">Task count</Text>
                <Text code>{store.tasks.length}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 8 }}>
                Expand rows, select a task, then click &quot;Simulate Mendix re-render&quot;. Store instance and UI
                state should stay the same.
            </Text>
        </div>
    );
});
