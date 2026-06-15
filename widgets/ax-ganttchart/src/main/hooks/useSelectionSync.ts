import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import type { Big } from "big.js";
import type { EditableValue } from "mendix";
import type { GanttStore } from "../../stores/GanttStore";
import type { GanttTask } from "../eventbus/eventTypes";
import type { WidgetEventBridge } from "../services/WidgetEventBridge";
import { writeTaskSelectionContext } from "../services/writeTaskSelectionContext";

type WritableTaskId = EditableValue<string | Big>;

function syncSelectionToMendix(
    task: GanttTask | undefined,
    selectedTaskId?: WritableTaskId,
    selectedPayload?: EditableValue<string>,
    bridge?: WidgetEventBridge
): void {
    writeTaskSelectionContext(task, selectedTaskId, selectedPayload);
    bridge?.handleSelectionChanged(task);
}

export function useSelectionSync(
    store: GanttStore,
    selectedTaskId?: WritableTaskId,
    selectedPayload?: EditableValue<string>,
    bridge?: WidgetEventBridge
): void {
    const bridgeRef = useRef(bridge);
    bridgeRef.current = bridge;

    useEffect(() => {
        const dispose = reaction(
            () => store.selectedTask,
            task => syncSelectionToMendix(task, selectedTaskId, selectedPayload, bridgeRef.current)
        );

        syncSelectionToMendix(store.selectedTask, selectedTaskId, selectedPayload, bridgeRef.current);

        return dispose;
    }, [store, selectedTaskId, selectedPayload]);
}
