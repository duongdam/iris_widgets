import type { ChartRecord, ChartStore } from "@iris/chart-core";
import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import { isWritableAttribute } from "../utils/chartInteraction";

export interface WritableStringAttribute {
    readOnly: boolean;
    setValue(value: string): void;
}

export interface SelectionSyncBridge {
    handleSelectionChanged: (record?: ChartRecord) => void;
}

export interface UseSelectionSyncOptions {
    store: ChartStore;
    selectedId?: WritableStringAttribute;
    selectedName?: WritableStringAttribute;
    selectedPayload?: WritableStringAttribute;
    bridge?: SelectionSyncBridge;
}

function syncSelectionToMendix(
    record: ChartRecord | undefined,
    options: UseSelectionSyncOptions
): void {
    const { selectedId, selectedName, selectedPayload, bridge } = options;

    if (!record) {
        if (isWritableAttribute(selectedId)) {
            selectedId.setValue("");
        }
        if (isWritableAttribute(selectedName)) {
            selectedName.setValue("");
        }
        if (isWritableAttribute(selectedPayload)) {
            selectedPayload.setValue("");
        }
        bridge?.handleSelectionChanged(undefined);
        return;
    }

    if (isWritableAttribute(selectedId)) {
        selectedId.setValue(record.id);
    }
    if (isWritableAttribute(selectedName)) {
        selectedName.setValue(record.name);
    }
    if (isWritableAttribute(selectedPayload)) {
        selectedPayload.setValue(JSON.stringify(record));
    }

    bridge?.handleSelectionChanged(record);
}

export function useSelectionSync(options: UseSelectionSyncOptions): void {
    const { store, selectedId, selectedName, selectedPayload, bridge } = options;
    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        const dispose = reaction(
            () => store.selectedRecord,
            record => syncSelectionToMendix(record, optionsRef.current)
        );

        syncSelectionToMendix(store.selectedRecord, optionsRef.current);

        return dispose;
    }, [store, selectedId, selectedName, selectedPayload, bridge]);
}
