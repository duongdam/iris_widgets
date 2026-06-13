/** Minimal Mendix editable shape for runtime guards. */
export interface MendixEditableLike {
    status?: string;
    readOnly?: boolean;
}

/** True when attribute is loaded, writable, and not read-only. */
export function isEditable(editable?: MendixEditableLike): boolean {
    return editable?.status === "available" && editable.readOnly !== true;
}

/** True when attribute binding is available (value may still be empty). */
export function isValueReady(editable?: MendixEditableLike): boolean {
    return editable?.status === "available";
}
