import {
    JSX,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    type ReactNode,
    type RefObject
} from "react";
import { initEventBus } from "./events/eventBus";
import {
    createMendixActionBridge,
    type MendixActionBridge,
    type MendixActionBridgeProps
} from "./shared/bridge/mendixActionBridge";
import { createAxGanttStore, TimelineViewMode, type AxGanttStore } from "./stores/AxGanttStore";
import type { AxGanttChartProps } from "./typings/AxGanttChartProps";
import { readWidgetViewMode } from "./typings/AxGanttChartProps";
import { parseViewMode } from "./main/components/TimelineManager";
import type { AxGanttTask } from "./shared/types/axGanttTask";
import { GANTT_TEST_TASKS } from "./shared/mock/ganttTestData";
import { useCommandSync } from "./main/hooks/useCommandSync";
import { useEventBusBridge } from "./main/hooks/useEventBusBridge";

export interface AxGanttContextValue {
    store: AxGanttStore;
    actionBridge: MendixActionBridge;
    widgetId: string;
    isPreview: boolean;
    allowGridReorder: boolean;
    containerRef: RefObject<HTMLDivElement>;
    customGanttConfig?: Record<string, unknown>;
    useDhtmlxTooltip?: boolean;
}

const AxGanttContext = createContext<AxGanttContextValue | null>(null);

export interface AxGanttInnerProps {
    children: ReactNode;
    widgetProps: AxGanttChartProps;
    previewTasks?: AxGanttTask[];
    containerRef: RefObject<HTMLDivElement>;
    onRefresh?: () => void;
    /** Extra DHTMLX gantt.config overrides merged on init. */
    customGanttConfig?: Record<string, unknown>;
    /** Use DHTMLX built-in tooltip instead of the React overlay. */
    useDhtmlxTooltip?: boolean;
}

function useStableAxGanttStore(widgetProps: AxGanttChartProps, previewTasks?: AxGanttTask[]): AxGanttStore {
    const storeRef = useRef<AxGanttStore | null>(null);
    const boundWidgetIdRef = useRef<string | null>(null);

    if (!storeRef.current || boundWidgetIdRef.current !== widgetProps.name) {
        boundWidgetIdRef.current = widgetProps.name;
        const viewMode = parseViewMode(readWidgetViewMode(widgetProps)) as TimelineViewMode;
        storeRef.current = createAxGanttStore(viewMode);

        if (previewTasks) {
            storeRef.current.setTasks(previewTasks);
        }
    }

    useEffect(() => {
        const store = storeRef.current;
        if (!store) {
            return;
        }

        const viewMode = parseViewMode(readWidgetViewMode(widgetProps)) as TimelineViewMode;
        if (store.viewMode !== viewMode) {
            store.setViewMode(viewMode);
        }
    }, [widgetProps.defaultViewMode]);

    useEffect(() => {
        if (previewTasks && storeRef.current) {
            storeRef.current.setTasks(previewTasks);
        }
    }, [previewTasks]);

    return storeRef.current!;
}

function useStableMendixActionBridge(widgetProps: AxGanttChartProps): MendixActionBridge {
    const bridgePropsRef = useRef<MendixActionBridgeProps>({});
    bridgePropsRef.current = {
        outItemId: widgetProps.outItemId,
        outType: widgetProps.outType,
        outChangedNum: widgetProps.outChangedNum,
        onClicked: widgetProps.onClicked,
        onDoubleClicked: widgetProps.onDoubleClicked,
        onChanged: widgetProps.onChanged,
        onAdded: widgetProps.onAdded,
        onDropped: widgetProps.onDropped
    };

    const bridgeRef = useRef<MendixActionBridge | null>(null);
    if (!bridgeRef.current) {
        bridgeRef.current = createMendixActionBridge(() => bridgePropsRef.current);
    }

    return bridgeRef.current;
}

export function AxGanttInner({
    children,
    widgetProps,
    previewTasks,
    containerRef,
    onRefresh,
    customGanttConfig,
    useDhtmlxTooltip
}: AxGanttInnerProps): JSX.Element {
    const store = useStableAxGanttStore(widgetProps, previewTasks);
    const actionBridge = useStableMendixActionBridge(widgetProps);
    const widgetId = widgetProps.name;
    const isPreview = previewTasks != null;
    const allowGridReorder = widgetProps.allowGridReorder?.value ?? true;

    const contextValue = useMemo<AxGanttContextValue>(
        () => ({
            store,
            actionBridge,
            widgetId,
            isPreview,
            allowGridReorder,
            containerRef,
            customGanttConfig,
            useDhtmlxTooltip
        }),
        [store, actionBridge, widgetId, isPreview, allowGridReorder, containerRef, customGanttConfig, useDhtmlxTooltip]
    );

    useEffect(() => {
        initEventBus();
    }, []);

    useCommandSync({
        command: widgetProps.command,
        commandPayload: widgetProps.commandPayload,
        widgetId,
        enabled: !isPreview
    });

    useEventBusBridge({
        store,
        widgetId,
        containerRef,
        onRefresh,
        isPreview
    });

    return <AxGanttContext.Provider value={contextValue}>{children}</AxGanttContext.Provider>;
}

export function useAxGanttContext(): AxGanttContextValue {
    const context = useContext(AxGanttContext);
    if (!context) {
        throw new Error("useAxGanttContext must be used within AxGanttInner");
    }
    return context;
}

export { GANTT_TEST_TASKS };
