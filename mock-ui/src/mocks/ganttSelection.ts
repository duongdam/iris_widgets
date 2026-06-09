import type { GanttTask } from "../../../widgets/ax-ganttchart/src/main/eventbus/eventTypes";
import { type EditableValue } from "mendix";
import { useCallback, useMemo, useState } from "react";
import { createMockEditableValue } from "./editableValue";

export interface MockGanttSelectionSummary {
    taskId: string;
    payload: string;
}

export function useMockGanttSelectionFields(): {
    selectedTaskId: EditableValue<string>;
    selectedPayload: EditableValue<string>;
    selectionSummary: MockGanttSelectionSummary;
    resetSelection: () => void;
    applySelection: (task?: GanttTask) => void;
} {
    const [selection, setSelection] = useState<MockGanttSelectionSummary>({
        taskId: "",
        payload: "",
    });

    const applySelection = useCallback((task?: GanttTask) => {
        if (!task) {
            setSelection({ taskId: "", payload: "" });
            return;
        }

        setSelection({
            taskId: task.id,
            payload: JSON.stringify(task, null, 2),
        });
    }, []);

    const selectedTaskId = useMemo(
        () =>
            createMockEditableValue("", next =>
                setSelection(current => ({ ...current, taskId: next }))
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
        selectedTaskId,
        selectedPayload,
        selectionSummary: selection,
        resetSelection,
        applySelection,
    };
}
