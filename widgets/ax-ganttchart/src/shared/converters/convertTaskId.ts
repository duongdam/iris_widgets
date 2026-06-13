import type Big from "big.js";

/** Normalize Mendix String or AutoNumber task IDs to DHTMLX string IDs. */
export function convertTaskId(value: string | Big | undefined, displayValue?: string): string | undefined {
    if (value != null) {
        if (typeof value === "object" && "toString" in value) {
            return value.toString();
        }
        return String(value);
    }

    if (displayValue != null && displayValue !== "") {
        return String(displayValue);
    }

    return undefined;
}
