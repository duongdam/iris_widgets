import { DataFormat, type ChartRecord } from "../contracts/chart-record";
import type { DataAdapter } from "../contracts/data-adapter";
import { generateId } from "../utils/generateId";
import { safeJsonParse } from "../utils/jsonParse";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeFlatItem(item: unknown, index: number): ChartRecord | null {
    if (!isRecord(item)) {
        return null;
    }

    const name = item.name;
    const period = item.period;
    const pm = item.pm;

    if (typeof name !== "string" || typeof period !== "string" || typeof pm !== "number" || !Number.isFinite(pm)) {
        if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
            console.warn(`[chart-core] Skipping invalid flat record at index ${index}`);
        }
        return null;
    }

    const id = typeof item.id === "string" && item.id.length > 0 ? item.id : generateId("flat");

    const record: ChartRecord = {
        id,
        name,
        period,
        pm,
    };

    if (typeof item.parent === "string") {
        record.parent = item.parent;
    }

    if (isRecord(item.metadata)) {
        record.metadata = { ...item.metadata };
    }

    return record;
}

export class FlatDataAdapter implements DataAdapter {
    readonly format = DataFormat.FLAT;

    transform(input: string): ChartRecord[] {
        const parsed = safeJsonParse(input);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .map((item, index) => normalizeFlatItem(item, index))
            .filter((record): record is ChartRecord => record !== null);
    }

    validate(input: string): boolean {
        const parsed = safeJsonParse(input);
        return Array.isArray(parsed);
    }
}
