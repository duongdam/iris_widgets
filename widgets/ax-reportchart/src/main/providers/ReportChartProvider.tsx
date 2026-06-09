import {
    createChartEventBus,
    createChartStore,
    createWidgetEventBridge,
    type ChartEventBus,
    type ChartStore,
    type WidgetEventBridge,
} from "@iris/chart-core";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AxReportChartProps } from "../../typings/AxReportChartProps";

export interface ReportChartContextValue {
    store: ChartStore;
    eventBus: ChartEventBus;
    bridge: WidgetEventBridge;
    widgetId: string;
}

const ReportChartContext = createContext<ReportChartContextValue | null>(null);

export interface ReportChartProviderProps {
    children: ReactNode;
    widgetProps: AxReportChartProps;
}

export function ReportChartProvider({ children, widgetProps }: ReportChartProviderProps): JSX.Element {
    const value = useMemo<ReportChartContextValue>(() => {
        const store = createChartStore();
        const eventBus = createChartEventBus();
        const widgetId = widgetProps.name;

        const bridge = createWidgetEventBridge({
            widgetId,
            eventBus,
            onClick: widgetProps.onClick,
            onSelectionChanged: widgetProps.onSelectionChanged,
        });

        return { store, eventBus, bridge, widgetId };
    }, [widgetProps.name, widgetProps.onClick, widgetProps.onSelectionChanged]);

    return <ReportChartContext.Provider value={value}>{children}</ReportChartContext.Provider>;
}

export function useReportChartContext(): ReportChartContextValue {
    const context = useContext(ReportChartContext);
    if (!context) {
        throw new Error("useReportChartContext must be used within ReportChartProvider");
    }
    return context;
}
