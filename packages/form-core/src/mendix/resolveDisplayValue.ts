import type { Big } from "big.js";
import type { EditableValue } from "mendix";

/** Resolve string display value; empty string is preserved when explicitly set. */
export function resolveStringValue(
    value?: EditableValue<string>,
    defaultValue?: EditableValue<string>
): string {
    if (value?.status === "available") {
        return value.value ?? "";
    }
    if (defaultValue?.status === "available") {
        return defaultValue.value ?? "";
    }
    return "";
}

/** Resolve boolean display value; false is preserved. */
export function resolveBooleanValue(
    value?: EditableValue<boolean>,
    defaultValue?: EditableValue<boolean>
): boolean {
    if (value?.status === "available" && value.value != null) {
        return value.value;
    }
    if (defaultValue?.status === "available" && defaultValue.value != null) {
        return defaultValue.value;
    }
    return false;
}

/** Resolve numeric display value from Big-backed Mendix attributes. */
export function resolveNumericValue(
    value?: EditableValue<Big>,
    defaultValue?: EditableValue<Big>
): number | null {
    if (value?.status === "available") {
        return readBigNumber(value.value);
    }
    if (defaultValue?.status === "available") {
        return readBigNumber(defaultValue.value);
    }
    return null;
}

function readBigNumber(value?: Big): number | null {
    if (value == null) {
        return null;
    }
    return value.toNumber();
}

/** Resolve DateTime display value. */
export function resolveDateValue(
    value?: EditableValue<Date>,
    defaultValue?: EditableValue<Date>
): Date | undefined {
    if (value?.status === "available" && value.value) {
        return value.value;
    }
    if (defaultValue?.status === "available" && defaultValue.value) {
        return defaultValue.value;
    }
    return undefined;
}
