import type { Big } from "big.js";
import type { EditableValue } from "mendix";
import type { GanttTask } from "../eventbus/eventTypes";

/** Write selected task id/payload to Mendix before action handlers run. */
export function writeTaskSelectionContext(
    task: GanttTask | undefined,
    selectedTaskId?: EditableValue<string | Big>,
    selectedPayload?: EditableValue<string>
): void {
    if (!task) {
        if (selectedTaskId?.status === "available" && selectedTaskId.readOnly !== true) {
            selectedTaskId.setValue(undefined);
        }
        if (selectedPayload?.status === "available" && selectedPayload.readOnly !== true) {
            selectedPayload.setValue(undefined);
        }
        return;
    }

    if (selectedTaskId?.status === "available" && selectedTaskId.readOnly !== true) {
        selectedTaskId.setValue(task.id);
    }
    if (selectedPayload?.status === "available" && selectedPayload.readOnly !== true) {
        selectedPayload.setValue(JSON.stringify(task));
    }
}
