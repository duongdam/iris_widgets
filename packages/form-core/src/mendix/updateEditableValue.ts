import { isEditable, type MendixEditableLike } from "./isEditable";

interface WritableMendixAttribute extends MendixEditableLike {
    setValue: (value: unknown) => void;
}

/**
 * Write to a Mendix EditableValue when status is available and not read-only.
 * Returns true when the write was applied.
 */
export function updateEditableValue(editable: MendixEditableLike | undefined, next: unknown): boolean {
    if (!isEditable(editable) || typeof (editable as WritableMendixAttribute).setValue !== "function") {
        return false;
    }
    (editable as WritableMendixAttribute).setValue(next);
    return true;
}
