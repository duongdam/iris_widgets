import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import type { GanttStore } from "../../stores/GanttStore";
import type { GanttTask } from "../eventbus/eventTypes";
import type { WidgetEventBridge } from "../services/WidgetEventBridge";

export interface WritableStringAttribute {
    readOnly: boolean;
    setValue(value: string): void;
}

function isWritable(attr?: WritableStringAttribute): attr is WritableStringAttribute {
    return attr != null && !attr.readOnly;
}

function syncSelectionToMendix(
    task: GanttTask | undefined,
    selectedTaskId?: WritableStringAttribute,
    selectedPayload?: WritableStringAttribute,
    bridge?: WidgetEventBridge
): void {
    if (!task) {
        if (isWritable(selectedTaskId)) {
            selectedTaskId.setValue("");
        }
        if (isWritable(selectedPayload)) {
            selectedPayload.setValue("");
        }
        bridge?.handleSelectionChanged(undefined);
        return;
    }

    if (isWritable(selectedTaskId)) {
        selectedTaskId.setValue(task.id);
    }
    if (isWritable(selectedPayload)) {
        selectedPayload.setValue(JSON.stringify(task));
    }
    bridge?.handleSelectionChanged(task);
}

export function useSelectionSync(
    store: GanttStore,
    selectedTaskId?: WritableStringAttribute,
    selectedPayload?: WritableStringAttribute,
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
