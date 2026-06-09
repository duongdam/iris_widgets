import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ChartContextState, ChartContextValue } from "./types";

const ChartContext = createContext<ChartContextValue | null>(null);

export interface ChartContextProviderProps {
    children: ReactNode;
    initialState?: ChartContextState;
}

export function ChartContextProvider({ children, initialState }: ChartContextProviderProps): JSX.Element {
    const [state, setState] = useState<ChartContextState>(initialState ?? {});

    const value = useMemo<ChartContextValue>(
        () => ({
            state,
            setGlobalFilter: filter => setState(prev => ({ ...prev, globalFilter: filter })),
            setGlobalTimeRange: range => setState(prev => ({ ...prev, globalTimeRange: range })),
        }),
        [state]
    );

    return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
}

export function useChartContext(): ChartContextValue {
    const context = useContext(ChartContext);
    if (!context) {
        throw new Error("useChartContext must be used within ChartContextProvider");
    }
    return context;
}

export { ChartContext };
