import Big from "big.js";

/** Convert antd InputNumber value to Mendix Decimal (Big). */
export function convertNumberToBig(next: number | null | undefined): Big | undefined {
    if (next == null || Number.isNaN(next)) {
        return undefined;
    }
    return new Big(next);
}
