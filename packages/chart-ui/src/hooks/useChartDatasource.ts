import {
    mapDatasourceToRecords,
    type ChartStore,
    type DatasourceMapping,
} from "@iris/chart-core";
import type { ListValue } from "mendix";
import { useEffect } from "react";
import type { UseChartDataResult } from "./useChartData";

export function useChartDatasource(
    store: ChartStore,
    datasource: ListValue | undefined,
    mapping: DatasourceMapping
): UseChartDataResult {
    const { idAttribute, nameAttribute, periodAttribute, valueAttribute } = mapping;

    useEffect(() => {
        if (!datasource) {
            store.setRecords([]);
            store.setLoading(false);
            return;
        }

        if (datasource.status === "loading") {
            store.setLoading(true);
            return;
        }

        if (datasource.status === "unavailable") {
            store.setRecords([]);
            store.setLoading(false);
            return;
        }

        const records = mapDatasourceToRecords(datasource, {
            idAttribute,
            nameAttribute,
            periodAttribute,
            valueAttribute,
        });
        store.setRecords(records);
    }, [
        datasource,
        datasource?.status,
        datasource?.items,
        store,
        idAttribute,
        nameAttribute,
        periodAttribute,
        valueAttribute,
    ]);

    return {
        error: !store.loading && store.records.length === 0 ? "empty" : null,
        isEmpty: store.records.length === 0,
    };
}
