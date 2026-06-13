import type Big from "big.js";

/** Normalize Mendix Decimal/Integer progress (0–1 or 0–100) to DHTMLX 0–1 range. */
export function convertProgress(value: number | Big | undefined): number | undefined {
    if (value == null) {
        return undefined;
    }

    const numeric = typeof value === "object" && "toNumber" in value ? value.toNumber() : Number(value);
    if (!Number.isFinite(numeric)) {
        return undefined;
    }

    if (numeric > 1 && numeric <= 100) {
        return Math.min(1, Math.max(0, numeric / 100));
    }

    return Math.min(1, Math.max(0, numeric));
}
