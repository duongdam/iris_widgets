import {
    createChartEventBus,
    createChartStore,
    createWidgetEventBridge,
    type ChartEventBus,
    type ChartStore,
    type WidgetEventBridge,
} from "@iris/chart-core";
import { JSX, createContext, useContext, useMemo, type ReactNode } from "react";
import type { AxColumnChartProps } from "../../typings/AxColumnChartProps";

export interface ColumnChartContextValue {
    store: ChartStore;
    eventBus: ChartEventBus;
    bridge: WidgetEventBridge;
    widgetId: string;
}

const ColumnChartContext = createContext<ColumnChartContextValue | null>(null);

export interface ColumnChartProviderProps {
    children: ReactNode;
    widgetProps: AxColumnChartProps;
}

export function ColumnChartProvider({ children, widgetProps }: ColumnChartProviderProps): JSX.Element {
    const value = useMemo<ColumnChartContextValue>(() => {
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

    return <ColumnChartContext.Provider value={value}>{children}</ColumnChartContext.Provider>;
}

export function useColumnChartContext(): ColumnChartContextValue {
    const context = useContext(ColumnChartContext);
    if (!context) {
        throw new Error("useColumnChartContext must be used within ColumnChartProvider");
    }
    return context;
}
