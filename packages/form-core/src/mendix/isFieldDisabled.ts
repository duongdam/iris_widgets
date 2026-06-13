import { isEditable, type MendixEditableLike } from "./isEditable";

/** Mendix validation message for the bound attribute, if any. */
export function getValidationMessage(editable?: MendixEditableLike & { validation?: string }): string | undefined {
    return editable?.validation;
}

/** Combine widget disabled flag with Mendix attribute read-only / unavailable state. */
export function isFieldDisabled(disabled: boolean, value?: MendixEditableLike): boolean {
    return disabled || !isEditable(value);
}
