import type { EditableValue } from "mendix";
import type { Big } from "big.js";

export function createMockStringValue(
    value: string,
    onChange?: (next: string) => void
): EditableValue<string> {
    return {
        value,
        status: "available",
        readOnly: onChange === undefined,
        displayValue: value,
        formatter: { format: (v: string) => v, parse: (v: string) => v },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: onChange ?? (() => undefined),
        setValue: onChange ?? (() => undefined),
        isList: false as const,
        validation: undefined,
        universe: undefined,
    } as unknown as EditableValue<string>;
}

export function createMockBooleanValue(
    value: boolean,
    onChange?: (next: boolean) => void
): EditableValue<boolean> {
    return {
        value,
        status: "available",
        readOnly: onChange === undefined,
        displayValue: String(value),
        formatter: { format: (v: boolean) => String(v), parse: (v: string) => v === "true" },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: () => undefined,
        setValue: (next?: boolean) => onChange?.(next ?? false),
        isList: false as const,
        validation: undefined,
        universe: undefined,
    } as unknown as EditableValue<boolean>;
}

export function createMockNumberValue(
    value: number,
    onChange?: (next: number | undefined) => void
): EditableValue<Big> {
    const bigValue = {
        toNumber: () => value,
        toString: () => String(value),
    } as Big;

    return {
        value: bigValue,
        status: "available",
        readOnly: onChange === undefined,
        displayValue: String(value),
        formatter: {
            format: (v: Big) => String(v.toNumber()),
            parse: (v: string) => ({ toNumber: () => Number(v), toString: () => v } as Big),
        },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: () => undefined,
        setValue: (next?: Big) => onChange?.(next?.toNumber()),
        isList: false as const,
        validation: undefined,
        universe: undefined,
    } as unknown as EditableValue<Big>;
}
