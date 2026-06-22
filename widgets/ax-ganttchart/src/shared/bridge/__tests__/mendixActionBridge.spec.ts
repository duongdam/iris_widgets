import { computeChangedNum, createMendixActionBridge, type MendixActionBridgeProps } from "../mendixActionBridge";
import type { ActionValue, EditableValue } from "mendix";

describe("computeChangedNum", () => {
    it("returns 0 when start month is unchanged", () => {
        const start = new Date(2026, 2, 15);
        expect(computeChangedNum(start, new Date(2026, 2, 28))).toBe(0);
    });

    it("returns positive delta when dragged forward by months", () => {
        const oldStart = new Date(2026, 0, 10);
        const newStart = new Date(2026, 2, 1);
        expect(computeChangedNum(oldStart, newStart)).toBe(2);
    });

    it("returns negative delta when dragged backward by months", () => {
        const oldStart = new Date(2026, 5, 1);
        const newStart = new Date(2026, 3, 30);
        expect(computeChangedNum(oldStart, newStart)).toBe(-2);
    });

    it("counts calendar month boundaries across years", () => {
        const oldStart = new Date(2025, 11, 31);
        const newStart = new Date(2026, 1, 1);
        expect(computeChangedNum(oldStart, newStart)).toBe(2);
    });
});

describe("createMendixActionBridge", () => {
    it("reads latest props from a getter source", () => {
        const propsRef = {
            current: {
                outItemId: createMockOut("a1"),
                outType: createMockOut("TASK"),
                onClicked: createMockAction()
            } as MendixActionBridgeProps
        };

        const bridge = createMendixActionBridge(() => propsRef.current);
        bridge.fireClicked({ id: "t1", text: "Task", type: "TASK" });

        expect(propsRef.current.outItemId?.setValue).toHaveBeenCalledWith("t1");
        expect(propsRef.current.onClicked?.execute).toHaveBeenCalled();

        propsRef.current = {
            ...propsRef.current,
            onClicked: createMockAction()
        };
        bridge.fireClicked({ id: "t2", text: "Task 2", type: "TASK" });
        expect(propsRef.current.onClicked?.execute).toHaveBeenCalled();
    });
});

function createMockOut(_initial: string): EditableValue<string> {
    return {
        setValue: jest.fn()
    } as unknown as EditableValue<string>;
}

function createMockAction(): ActionValue {
    return {
        canExecute: true,
        isExecuting: false,
        execute: jest.fn()
    };
}
