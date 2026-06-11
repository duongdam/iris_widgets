import {
    createChartEventBus,
    createChartStore,
    createWidgetEventBridge,
    type ChartEventBus,
    type ChartStore,
    type WidgetEventBridge,
} from "@iris/chart-core";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AxNegativeBarChartProps } from "../../typings/AxNegativeBarChartProps";

export interface NegativeBarChartContextValue {
    store: ChartStore;
    eventBus: ChartEventBus;
    bridge: WidgetEventBridge;
    widgetId: string;
}

const NegativeBarChartContext = createContext<NegativeBarChartContextValue | null>(null);

export interface NegativeBarChartProviderProps {
    children: ReactNode;
    widgetProps: AxNegativeBarChartProps;
}

export function NegativeBarChartProvider({
    children,
    widgetProps,
}: NegativeBarChartProviderProps): JSX.Element {
    const value = useMemo<NegativeBarChartContextValue>(() => {
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

    return (
        <NegativeBarChartContext.Provider value={value}>
            {children}
        </NegativeBarChartContext.Provider>
    );
}

export function useNegativeBarChartContext(): NegativeBarChartContextValue {
    const context = useContext(NegativeBarChartContext);
    if (!context) {
        throw new Error("useNegativeBarChartContext must be used within NegativeBarChartProvider");
    }
    return context;
}
