export { DataFormat, type ChartRecord, type SeriesGroup } from "./contracts/chart-record";
export type { DataAdapter, AdapterResult, AdapterError, AdapterRegistry } from "./contracts/data-adapter";

export { FlatDataAdapter } from "./adapters/FlatDataAdapter";
export { ElasticAggregationAdapter } from "./adapters/ElasticAggregationAdapter";
export { AdapterRegistryImpl, adapterRegistry, getAdapter } from "./adapters/AdapterRegistry";
export { mapDatasourceToRecords, type DatasourceMapping } from "./adapters/DatasourceAdapter";

export { ChartStore, createChartStore } from "./stores/ChartStore";

export {
    ChartEvents,
    type ChartEventPayload,
    type ChartEventHandler,
    type ChartEventBus,
    type ChartClickData,
    type ChartSelectionChangedData,
    type ChartLegendSelectData,
    type ChartReadyData,
    type ChartDrilldownData,
} from "./eventbus/types";
export { ChartEventBusImpl, createChartEventBus } from "./eventbus/ChartEventBus";

export type { ChartContextState, ChartContextValue } from "./context/types";
export { ChartContextProvider, useChartContext, ChartContext } from "./context/ChartContext";

export { safeJsonParse } from "./utils/jsonParse";
export { generateId, resetIdCounter } from "./utils/generateId";
export { MOCK_FLAT_JSON, MOCK_ELASTIC_JSON, MOCK_FLAT_RECORDS, createMockDatasource, type MockDatasource } from "./utils/mockData";

export {
    createWidgetEventBridge,
    type WidgetEventBridge,
    type WidgetEventBridgeOptions,
    type MendixActionValue,
} from "./eventbus/widgetEventBridge";

export {
    ChartCommand,
    CHART_COMMAND_NAMES,
    parseChartCommand,
    chartCommandToEvent,
} from "./commands/ChartCommand";
export { createFullscreenService, type FullscreenService } from "./services/FullscreenService";
export { useChartCommandSync, type UseChartCommandSyncOptions } from "./hooks/useChartCommandSync";
