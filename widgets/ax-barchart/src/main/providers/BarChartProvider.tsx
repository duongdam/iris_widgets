import {
    createChartEventBus,
    createChartStore,
    createWidgetEventBridge,
    type ChartEventBus,
    type ChartStore,
    type WidgetEventBridge
} from "@iris/chart-core";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AxBarChartProps } from "../../typings/AxBarChartProps";

export interface BarChartContextValue {
    store: ChartStore;
    eventBus: ChartEventBus;
    bridge: WidgetEventBridge;
    widgetId: string;
}

const BarChartContext = createContext<BarChartContextValue | null>(null);

export interface BarChartProviderProps {
    children: ReactNode;
    widgetProps: AxBarChartProps;
}

export function BarChartProvider({ children, widgetProps }: BarChartProviderProps): JSX.Element {
    const value = useMemo<BarChartContextValue>(() => {
        const store = createChartStore();
        const eventBus = createChartEventBus();
        const widgetId = widgetProps.name;

        const bridge = createWidgetEventBridge({
            widgetId,
            eventBus,
            onClick: widgetProps.onClick,
            onSelectionChanged: widgetProps.onSelectionChanged
        });

        return { store, eventBus, bridge, widgetId };
    }, [widgetProps.name, widgetProps.onClick, widgetProps.onSelectionChanged]);

    return <BarChartContext.Provider value={value}>{children}</BarChartContext.Provider>;
}

export function useBarChartContext(): BarChartContextValue {
    const context = useContext(BarChartContext);
    if (!context) {
        throw new Error("useBarChartContext must be used within BarChartProvider");
    }
    return context;
}
