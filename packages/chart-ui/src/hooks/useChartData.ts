import {
    DataFormat,
    getAdapter,
    type ChartStore,
} from "@iris/chart-core";
import { useEffect, useState } from "react";

export type ChartDataError = "empty" | "parse-error" | "format-mismatch" | null;

export interface UseChartDataResult {
    error: ChartDataError;
    isEmpty: boolean;
}

export function useChartData(
    store: ChartStore,
    jsonData: string | undefined,
    dataFormat: "flat" | "elastic"
): UseChartDataResult {
    const [error, setError] = useState<ChartDataError>(null);

    useEffect(() => {
        if (!jsonData || jsonData.trim() === "") {
            store.setRecords([]);
            store.setLoading(false);
            setError("empty");
            return;
        }

        store.setLoading(true);

        const format = dataFormat === "elastic" ? DataFormat.ELASTIC : DataFormat.FLAT;
        const adapter = getAdapter(format);
        const alternateFormat = format === DataFormat.FLAT ? DataFormat.ELASTIC : DataFormat.FLAT;
        const alternateAdapter = getAdapter(alternateFormat);

        if (!adapter.validate(jsonData)) {
            if (alternateAdapter.validate(jsonData)) {
                store.setRecords([]);
                store.setLoading(false);
                setError("format-mismatch");
                return;
            }

            store.setRecords([]);
            store.setLoading(false);
            setError("parse-error");
            return;
        }

        const records = adapter.transform(jsonData);
        store.setRecords(records);
        setError(records.length === 0 ? "empty" : null);
    }, [jsonData, dataFormat, store]);

    return {
        error,
        isEmpty: store.records.length === 0,
    };
}
