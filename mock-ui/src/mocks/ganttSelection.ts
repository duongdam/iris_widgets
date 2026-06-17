import type { GanttTask } from "../../../widgets/ax-ganttchart/src/main/eventbus/eventTypes";
import { useCallback, useState } from "react";

export interface MockGanttSelectionSummary {
    taskId: string;
    payload: string;
}

export function useMockGanttSelectionFields(): {
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

    const resetSelection = (): void => {
        applySelection(undefined);
    };

    return {
        selectionSummary: selection,
        resetSelection,
        applySelection,
    };
}
