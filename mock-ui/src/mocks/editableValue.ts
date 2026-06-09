import type { ChartRecord } from "@iris/chart-core";
import { type EditableValue } from "mendix";
import { useCallback, useMemo, useState } from "react";

export function createMockEditableValue(
    value: string,
    onChange?: (next: string) => void
): EditableValue<string> {
    return {
        value,
        status: "available",
        readOnly: onChange === undefined,
        displayValue: value,
        formatter: { format: (v: string) => String(v), parse: (v: string) => v },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: onChange ?? (() => undefined),
        setValue: onChange ?? (() => undefined),
        isList: false as const,
        validation: undefined,
        universe: undefined,
    } as unknown as EditableValue<string>;
}

export interface MockSelectionSummary {
    id: string;
    name: string;
    payload: string;
}

export function useMockSelectionFields(): {
    selectedId: EditableValue<string>;
    selectedName: EditableValue<string>;
    selectedPayload: EditableValue<string>;
    selectionSummary: MockSelectionSummary;
    resetSelection: () => void;
    applySelection: (record?: ChartRecord) => void;
} {
    const [selection, setSelection] = useState<MockSelectionSummary>({
        id: "",
        name: "",
        payload: "",
    });

    const applySelection = useCallback((record?: ChartRecord) => {
        if (!record) {
            setSelection({ id: "", name: "", payload: "" });
            return;
        }

        setSelection({
            id: record.id,
            name: record.name,
            payload: JSON.stringify(record, null, 2),
        });
    }, []);

    const selectedId = useMemo(
        () =>
            createMockEditableValue("", next =>
                setSelection(current => ({ ...current, id: next }))
            ),
        []
    );
    const selectedName = useMemo(
        () =>
            createMockEditableValue("", next =>
                setSelection(current => ({ ...current, name: next }))
            ),
        []
    );
    const selectedPayload = useMemo(
        () =>
            createMockEditableValue("", next =>
                setSelection(current => ({ ...current, payload: next }))
            ),
        []
    );

    const resetSelection = (): void => {
        applySelection(undefined);
    };

    return {
        selectedId,
        selectedName,
        selectedPayload,
        selectionSummary: selection,
        resetSelection,
        applySelection,
    };
}
