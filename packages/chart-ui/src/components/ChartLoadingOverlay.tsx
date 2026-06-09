import { Spin } from "antd";

export interface ChartLoadingOverlayProps {
    loading?: boolean;
}

export function ChartLoadingOverlay({ loading = true }: ChartLoadingOverlayProps): JSX.Element | null {
    if (!loading) {
        return null;
    }

    return (
        <div className="iris-chart-loading">
            <div className="iris-chart-loading__shimmer" aria-hidden />
            <Spin />
        </div>
    );
}
