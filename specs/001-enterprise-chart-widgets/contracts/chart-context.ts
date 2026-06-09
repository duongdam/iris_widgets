/**
 * Contract: ChartContext — dashboard state preparation (v1: architecture only).
 */

export interface ChartContextState {
    globalFilter?: string;
    globalTimeRange?: string;
}

export interface ChartContextValue {
    state: ChartContextState;
    setGlobalFilter: (filter: string | undefined) => void;
    setGlobalTimeRange: (range: string | undefined) => void;
}
