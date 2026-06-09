import { Empty } from "antd";

export interface ChartEmptyStateProps {
    message?: string;
}

export function ChartEmptyState({ message = "No chart data available" }: ChartEmptyStateProps): JSX.Element {
    return (
        <div className="iris-chart-empty">
            <Empty
                description={message}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                styles={{
                    description: { color: "var(--iris-text-muted)" },
                }}
            />
        </div>
    );
}
