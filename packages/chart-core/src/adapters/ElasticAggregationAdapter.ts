import { DataFormat, type ChartRecord } from "../contracts/chart-record";
import type { DataAdapter } from "../contracts/data-adapter";
import { safeJsonParse } from "../utils/jsonParse";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNestedBuckets(root: unknown, path: string[]): unknown[] {
    let current: unknown = root;

    for (const key of path) {
        if (!isRecord(current)) {
            return [];
        }
        current = current[key];
    }

    return Array.isArray(current) ? current : [];
}

function getNumericValue(bucket: Record<string, unknown>): number | null {
    const value = bucket.value;
    if (!isRecord(value)) {
        return null;
    }

    const numeric = value.value;
    return typeof numeric === "number" && Number.isFinite(numeric) ? numeric : null;
}

export class ElasticAggregationAdapter implements DataAdapter {
    readonly format = DataFormat.ELASTIC;

    transform(input: string): ChartRecord[] {
        const parsed = safeJsonParse(input);
        if (!isRecord(parsed)) {
            return [];
        }

        const aggregations = parsed.aggregations;
        if (!isRecord(aggregations)) {
            return [];
        }

        const periodBuckets = getNestedBuckets(aggregations, ["periods", "buckets"]);
        const records: ChartRecord[] = [];

        for (const periodBucket of periodBuckets) {
            if (!isRecord(periodBucket)) {
                continue;
            }

            const period = String(periodBucket.key ?? "");
            if (!period) {
                continue;
            }

            const itemBuckets = getNestedBuckets(periodBucket, ["items", "buckets"]);

            for (const itemBucket of itemBuckets) {
                if (!isRecord(itemBucket)) {
                    continue;
                }

                const name = String(itemBucket.key ?? "");
                const pm = getNumericValue(itemBucket);

                if (!name || pm === null) {
                    continue;
                }

                records.push({
                    id: `${period}:${name}`,
                    name,
                    period,
                    pm,
                    metadata: { _elastic: { ...itemBucket } },
                });
            }
        }

        return records;
    }

    validate(input: string): boolean {
        const parsed = safeJsonParse(input);
        if (!isRecord(parsed)) {
            return false;
        }

        const aggregations = parsed.aggregations;
        return isRecord(aggregations) && isRecord(aggregations.periods);
    }
}
