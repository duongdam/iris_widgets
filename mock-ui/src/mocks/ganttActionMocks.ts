import type { ActionValue, DynamicValue, EditableValue } from "mendix";
import type { Big } from "big.js";
import { useCallback, useMemo, useRef, useState } from "react";

export type GanttActionName = "onClicked" | "onDoubleClicked" | "onChanged" | "onAdded" | "onDropped";

export interface MockGanttActionOutput {
    itemId: string;
    type: string;
    changedNum: string;
}

export interface MockGanttActionLogEntry extends MockGanttActionOutput {
    action: GanttActionName;
    at: string;
}

function createMockEditableValue(
    initial: string,
    onChange: (next: string) => void
): EditableValue<string> {
    return {
        value: initial,
        status: "available",
        readOnly: false,
        displayValue: initial,
        formatter: { format: (v: string) => String(v), parse: (v: string) => v },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: onChange,
        setValue: onChange,
        isList: false as const,
        validation: undefined,
        universe: undefined
    } as unknown as EditableValue<string>;
}

function createMockNumberEditableValue(
    initial: string,
    onChange: (next: string) => void
): EditableValue<Big> {
    return {
        value: initial as unknown as Big,
        status: "available",
        readOnly: false,
        displayValue: initial,
        formatter: { format: (v: Big) => String(v), parse: (v: string) => v as unknown as Big },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: () => undefined,
        setValue: (next?: Big) => onChange(next != null ? String(next) : ""),
        isList: false as const,
        validation: undefined,
        universe: undefined
    } as unknown as EditableValue<Big>;
}

export function createMockDynamicBoolean(value: boolean): DynamicValue<boolean> {
    return { status: "available", value } as DynamicValue<boolean>;
}

export function createMockDynamicString(value: string): DynamicValue<string> {
    return { status: "available", value } as DynamicValue<string>;
}

export function createMockDynamicHeight(value: number): DynamicValue<Big> {
    return {
        status: "available",
        value: { toNumber: () => value } as Big
    } as DynamicValue<Big>;
}

export function useMockGanttActions(): {
    output: MockGanttActionOutput;
    actionLog: MockGanttActionLogEntry[];
    resetActions: () => void;
    actionPropsVersion: number;
    refreshActionProps: () => void;
    actionProps: {
        outItemId: EditableValue<string>;
        outType: EditableValue<string>;
        outChangedNum: EditableValue<Big>;
        onClicked: ActionValue;
        onDoubleClicked: ActionValue;
        onChanged: ActionValue;
        onAdded: ActionValue;
        onDropped: ActionValue;
    };
} {
    const outputRef = useRef<MockGanttActionOutput>({ itemId: "", type: "", changedNum: "" });
    const [output, setOutput] = useState<MockGanttActionOutput>(outputRef.current);
    const [actionLog, setActionLog] = useState<MockGanttActionLogEntry[]>([]);
    const [actionPropsVersion, setActionPropsVersion] = useState(0);

    const syncOutput = useCallback(() => {
        setOutput({ ...outputRef.current });
    }, []);

    const recordAction = useCallback(
        (action: GanttActionName) => {
            setActionLog(prev =>
                [
                    {
                        action,
                        itemId: outputRef.current.itemId,
                        type: outputRef.current.type,
                        changedNum: outputRef.current.changedNum,
                        at: new Date().toISOString()
                    },
                    ...prev
                ].slice(0, 20)
            );
            syncOutput();
        },
        [syncOutput]
    );

    const actionProps = useMemo(() => {
        const createAction = (action: GanttActionName): ActionValue => ({
            canExecute: true,
            isExecuting: false,
            execute: () => recordAction(action)
        });

        return {
            outItemId: createMockEditableValue("", value => {
                outputRef.current.itemId = value;
                syncOutput();
            }),
            outType: createMockEditableValue("", value => {
                outputRef.current.type = value;
                syncOutput();
            }),
            outChangedNum: createMockNumberEditableValue("", value => {
                outputRef.current.changedNum = value;
                syncOutput();
            }),
            onClicked: createAction("onClicked"),
            onDoubleClicked: createAction("onDoubleClicked"),
            onChanged: createAction("onChanged"),
            onAdded: createAction("onAdded"),
            onDropped: createAction("onDropped")
        };
    }, [recordAction, syncOutput, actionPropsVersion]);

    const refreshActionProps = useCallback(() => {
        setActionPropsVersion(version => version + 1);
    }, []);

    const resetActions = useCallback(() => {
        outputRef.current = { itemId: "", type: "", changedNum: "" };
        setOutput({ itemId: "", type: "", changedNum: "" });
        setActionLog([]);
        actionProps.outItemId.setValue?.("");
        actionProps.outType.setValue?.("");
        actionProps.outChangedNum.setValue?.("" as unknown as Big);
    }, [actionProps]);

    return { output, actionLog, resetActions, actionPropsVersion, refreshActionProps, actionProps };
}
