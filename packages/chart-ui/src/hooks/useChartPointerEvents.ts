import type { ChartStore } from "@iris/chart-core";
import type { EChartsType } from "echarts";
import type ReactECharts from "echarts-for-react";
import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";
import type { SelectionSyncBridge } from "./useSelectionSync";
import {
    handleChartRecordSelect,
    resolvePointerParamsFromPixel,
    resolveRecordFromClick,
} from "../utils/chartInteraction";

export interface ChartPointerLookup {
    periods?: string[];
    names?: string[];
}

export interface ChartPointerBridge extends SelectionSyncBridge {
    handleClick: (record: import("@iris/chart-core").ChartRecord) => void;
    handleHover: (record: import("@iris/chart-core").ChartRecord) => void;
}

export interface ChartPointerOptions {
    allowedSeriesIndexes?: number[];
}

interface PointerBinding {
    dispose: () => void;
}

function bindPointerEvents(
    instance: EChartsType,
    contextRef: MutableRefObject<{
        store: ChartStore;
        bridge: ChartPointerBridge;
        lookup: ChartPointerLookup;
        options?: ChartPointerOptions;
    }>
): PointerBinding {
    const dom = instance.getDom();
    const lastOffset = { x: 0, y: 0 };

    const handlePointer = (offsetX: number, offsetY: number, mode: "click" | "hover") => {
        const { store, bridge, lookup, options } = contextRef.current;
        const params = resolvePointerParamsFromPixel(
            instance,
            offsetX,
            offsetY,
            options?.allowedSeriesIndexes
        );

        if (!params) {
            return;
        }

        handleChartRecordSelect(
            resolveRecordFromClick(store.records, params, lookup),
            {
                selectRecord: store.selectRecord.bind(store),
                handleClick: bridge.handleClick,
                handleHover: bridge.handleHover,
            },
            mode
        );
    };

    const onDomMouseMove = (event: MouseEvent): void => {
        const rect = dom.getBoundingClientRect();
        lastOffset.x = event.clientX - rect.left;
        lastOffset.y = event.clientY - rect.top;
    };

    const onAxisPointerUpdate = (): void => {
        handlePointer(lastOffset.x, lastOffset.y, "hover");
    };

    const onZrClick = (event: { offsetX: number; offsetY: number }): void => {
        handlePointer(event.offsetX, event.offsetY, "click");
    };

    dom.addEventListener("mousemove", onDomMouseMove, { passive: true });
    instance.off("updateAxisPointer", onAxisPointerUpdate);
    instance.on("updateAxisPointer", onAxisPointerUpdate);

    const zr = instance.getZr();
    zr.off("click");
    zr.on("click", onZrClick);

    return {
        dispose: () => {
            dom.removeEventListener("mousemove", onDomMouseMove);
            instance.off("updateAxisPointer", onAxisPointerUpdate);
            zr.off("click", onZrClick);
        },
    };
}

export function useChartPointerEvents(
    store: ChartStore,
    bridge: ChartPointerBridge,
    lookup: ChartPointerLookup,
    options?: ChartPointerOptions
): {
    chartRef: RefObject<ReactECharts>;
    onChartReady: (instance: EChartsType) => void;
} {
    const chartRef = useRef<ReactECharts>(null);
    const bindingRef = useRef<PointerBinding | undefined>(undefined);
    const contextRef = useRef({ store, bridge, lookup, options });
    contextRef.current = { store, bridge, lookup, options };

    const onChartReady = (instance: EChartsType): void => {
        bindingRef.current?.dispose();
        bindingRef.current = bindPointerEvents(instance, contextRef);
    };

    useEffect(() => {
        const instance = chartRef.current?.getEchartsInstance();
        if (instance) {
            bindingRef.current?.dispose();
            bindingRef.current = bindPointerEvents(instance, contextRef);
        }

        return () => {
            bindingRef.current?.dispose();
            bindingRef.current = undefined;
        };
    }, [store.records, lookup.periods, lookup.names, options?.allowedSeriesIndexes]);

    return { chartRef, onChartReady };
}
