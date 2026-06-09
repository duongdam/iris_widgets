import {
  createChartEventBus,
  createChartStore,
  createWidgetEventBridge,
  type ChartEventBus,
  type ChartStore,
  type WidgetEventBridge,
} from "@iris/chart-core";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AxStackAreaChartProps } from "../../typings/AxStackAreaChartProps";

export interface StackAreaChartContextValue {
  store: ChartStore;
  eventBus: ChartEventBus;
  bridge: WidgetEventBridge;
  widgetId: string;
}

const StackAreaChartContext = createContext<StackAreaChartContextValue | null>(
  null,
);

export interface StackAreaChartProviderProps {
  children: ReactNode;
  widgetProps: AxStackAreaChartProps;
}

export function StackAreaChartProvider({
  children,
  widgetProps,
}: StackAreaChartProviderProps): JSX.Element {
  const value = useMemo<StackAreaChartContextValue>(() => {
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
    <StackAreaChartContext.Provider value={value}>
      {children}
    </StackAreaChartContext.Provider>
  );
}

export function useStackAreaChartContext(): StackAreaChartContextValue {
  const context = useContext(StackAreaChartContext);
  if (!context) {
    throw new Error(
      "useStackAreaChartContext must be used within StackAreaChartProvider",
    );
  }
  return context;
}
