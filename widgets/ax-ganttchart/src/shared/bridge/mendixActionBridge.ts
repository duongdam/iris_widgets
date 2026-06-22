import type { ActionValue, EditableValue } from "mendix";
import type Big from "big.js";
import { resolveTaskTypeForOutput, type AxGanttTask } from "../types/axGanttTask";

export interface MendixActionBridgeProps {
    outItemId?: EditableValue<string>;
    outType?: EditableValue<string>;
    outChangedNum?: EditableValue<Big>;
    onClicked?: ActionValue;
    onDoubleClicked?: ActionValue;
    onChanged?: ActionValue;
    onAdded?: ActionValue;
    onDropped?: ActionValue;
}

export interface MendixActionBridge {
    fireClicked(task: AxGanttTask): void;
    fireDoubleClicked(task: AxGanttTask): void;
    fireChanged(task: AxGanttTask, changedNum: number): void;
    fireAdded(task: AxGanttTask): void;
    fireDropped(task: AxGanttTask): void;
}

export function computeChangedNum(oldStart: Date, newStart: Date): number {
    const oldMonths = oldStart.getFullYear() * 12 + oldStart.getMonth();
    const newMonths = newStart.getFullYear() * 12 + newStart.getMonth();
    return newMonths - oldMonths;
}

function executeAction(action?: ActionValue): void {
    if (action?.canExecute !== false && !action?.isExecuting) {
        action?.execute?.();
    }
}

function writeOut(
    props: MendixActionBridgeProps,
    itemId: string,
    type: string,
    changedNum?: number
): void {
    props.outItemId?.setValue(itemId);
    props.outType?.setValue(type);

    if (changedNum != null) {
        props.outChangedNum?.setValue(changedNum as unknown as Big);
    }
}

export type MendixActionBridgePropsSource = MendixActionBridgeProps | (() => MendixActionBridgeProps);

function resolveBridgeProps(source: MendixActionBridgePropsSource): MendixActionBridgeProps {
    return typeof source === "function" ? source() : source;
}

export function createMendixActionBridge(propsOrGetter: MendixActionBridgePropsSource): MendixActionBridge {
    const fire = (task: AxGanttTask, action?: ActionValue, changedNum?: number): void => {
        const props = resolveBridgeProps(propsOrGetter);
        writeOut(props, task.id, resolveTaskTypeForOutput(task), changedNum);
        executeAction(action);
    };

    return {
        fireClicked(task: AxGanttTask): void {
            fire(task, resolveBridgeProps(propsOrGetter).onClicked);
        },
        fireDoubleClicked(task: AxGanttTask): void {
            fire(task, resolveBridgeProps(propsOrGetter).onDoubleClicked);
        },
        fireChanged(task: AxGanttTask, changedNum: number): void {
            fire(task, resolveBridgeProps(propsOrGetter).onChanged, changedNum);
        },
        fireAdded(task: AxGanttTask): void {
            fire(task, resolveBridgeProps(propsOrGetter).onAdded);
        },
        fireDropped(task: AxGanttTask): void {
            fire(task, resolveBridgeProps(propsOrGetter).onDropped);
        }
    };
}
