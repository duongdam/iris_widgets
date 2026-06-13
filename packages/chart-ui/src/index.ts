export { ThemeProvider, type ThemeProviderProps } from "./theme/ThemeProvider";

export { ChartContainer, type ChartContainerProps } from "./components/ChartContainer";
export { DeferredChartMount, type DeferredChartMountProps } from "./components/DeferredChartMount";
export { ChartEmptyState, type ChartEmptyStateProps } from "./components/ChartEmptyState";
export { ChartLoadingOverlay, type ChartLoadingOverlayProps } from "./components/ChartLoadingOverlay";

export { useChartDimensions, type ChartDimensions } from "./hooks/useChartDimensions";
export { useStableCallback } from "./hooks/useStableCallback";
export { useChartData, type ChartDataError, type UseChartDataResult } from "./hooks/useChartData";
export { useChartDatasource } from "./hooks/useChartDatasource";
export {
    useSelectionSync,
    type SelectionSyncBridge,
    type UseSelectionSyncOptions,
    type WritableStringAttribute,
} from "./hooks/useSelectionSync";
export { useChartPointerEvents, type ChartPointerLookup } from "./hooks/useChartPointerEvents";
export {
    handleChartRecordSelect,
    isWritableAttribute,
    resolvePointerParamsFromPixel,
    resolveRecordFromClick,
    type ChartDataPoint,
    type EchartsPointerParams,
} from "./utils/chartInteraction";
