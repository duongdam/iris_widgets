import type { EditableValue } from "mendix";
import { writeTaskSelectionContext } from "../writeTaskSelectionContext";
import { createMockEditableValue, sampleTask } from "../../../__tests__/testUtils";

function asEditable(mock: ReturnType<typeof createMockEditableValue>): EditableValue<string> {
    return mock as unknown as EditableValue<string>;
}

describe("writeTaskSelectionContext", () => {
    it("writes task id and JSON payload when attributes are writable", () => {
        const selectedTaskId = createMockEditableValue();
        const selectedPayload = createMockEditableValue();

        writeTaskSelectionContext(sampleTask, asEditable(selectedTaskId), asEditable(selectedPayload));

        expect(selectedTaskId.setValue).toHaveBeenCalledWith("task-1");
        expect(selectedPayload.setValue).toHaveBeenCalledWith(JSON.stringify(sampleTask));
    });

    it("clears attributes when task is undefined", () => {
        const selectedTaskId = createMockEditableValue("task-1");
        const selectedPayload = createMockEditableValue('{"id":"task-1"}');

        writeTaskSelectionContext(undefined, asEditable(selectedTaskId), asEditable(selectedPayload));

        expect(selectedTaskId.setValue).toHaveBeenCalledWith(undefined);
        expect(selectedPayload.setValue).toHaveBeenCalledWith(undefined);
    });

    it("skips write when attribute status is not available", () => {
        const selectedTaskId = createMockEditableValue(undefined, { status: "loading" });
        const selectedPayload = createMockEditableValue(undefined, { status: "unavailable" });

        writeTaskSelectionContext(sampleTask, asEditable(selectedTaskId), asEditable(selectedPayload));

        expect(selectedTaskId.setValue).not.toHaveBeenCalled();
        expect(selectedPayload.setValue).not.toHaveBeenCalled();
    });

    it("skips write when attribute is read-only", () => {
        const selectedTaskId = createMockEditableValue(undefined, { readOnly: true });
        const selectedPayload = createMockEditableValue(undefined, { readOnly: true });

        writeTaskSelectionContext(sampleTask, asEditable(selectedTaskId), asEditable(selectedPayload));

        expect(selectedTaskId.setValue).not.toHaveBeenCalled();
        expect(selectedPayload.setValue).not.toHaveBeenCalled();
    });
});
