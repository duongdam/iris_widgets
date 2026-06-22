/**
 * Contract: Mendix Action Bridge — Typed scalar write-back
 *
 * Replaces unified onEvent + eventType + eventPayload.
 * Each action writes scalar attributes then executes.
 */

import type { ActionValue, EditableValue } from "mendix";
import type Big from "big.js";

export interface MendixActionBridgeProps {
    /** Write-back: item id of interacted row */
    outItemId?: EditableValue<string>;
    /** Write-back: task type (TASK, SUB_TASK, CUSTOM_GROUP, DISTRICT_GROUP) */
    outType?: EditableValue<string>;
    /** Write-back: month delta after drag (onChanged only) */
    outChangedNum?: EditableValue<Big>;

    onClicked?: ActionValue;
    onDoubleClicked?: ActionValue;
    onChanged?: ActionValue;
    onAdded?: ActionValue;
    onDropped?: ActionValue;
}

export interface MendixActionBridge {
    fireClicked(itemId: string, type: string): void;
    fireDoubleClicked(itemId: string, type: string): void;
    fireChanged(itemId: string, type: string, changedNum: number): void;
    fireAdded(itemId: string, type: string): void;
    fireDropped(itemId: string, type: string): void;
}

/**
 * Write-back sequence (MUST follow this order):
 * 1. outItemId.setValue(itemId)
 * 2. outType.setValue(type)
 * 3. outChangedNum.setValue(changedNum)  // onChanged only
 * 4. action.execute()
 */

export function createMendixActionBridge(props: MendixActionBridgeProps): MendixActionBridge;

/** Compute signed month delta between two dates */
export function computeChangedNum(oldStart: Date, newStart: Date): number;
