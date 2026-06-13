import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import type { Big } from "big.js";
import type { EditableValue } from "mendix";
import type { GanttStore } from "../../stores/GanttStore";
import type { GanttTask } from "../eventbus/eventTypes";
import type { WidgetEventBridge } from "../services/WidgetEventBridge";

type WritableTaskId = EditableValue<string | Big>;

function isWritable(attr?: WritableTaskId): attr is WritableTaskId {
    return attr?.status === "available" && attr.readOnly !== true;
}

function syncSelectionToMendix(
    task: GanttTask | undefined,
    selectedTaskId?: WritableTaskId,
    selectedPayload?: EditableValue<string>,
    bridge?: WidgetEventBridge
): void {
    if (!task) {
        if (isWritable(selectedTaskId)) {
            selectedTaskId.setValue(undefined);
        }
        if (selectedPayload?.status === "available" && selectedPayload.readOnly !== true) {
            selectedPayload.setValue(undefined);
        }
        bridge?.handleSelectionChanged(undefined);
        return;
    }

    if (isWritable(selectedTaskId)) {
        selectedTaskId.setValue(task.id);
    }
    if (selectedPayload?.status === "available" && selectedPayload.readOnly !== true) {
        selectedPayload.setValue(JSON.stringify(task));
    }
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
