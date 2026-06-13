import { mapDatasourceToOptions } from "@iris/form-core";
import { useMemo } from "react";
import type { AxComboBoxProps } from "../../typings/AxComboBoxProps";

export interface UseComboboxDatasourceResult {
    options: Array<{ value: string; label: string }>;
    loading: boolean;
}

export function useComboboxDatasource(widgetProps: AxComboBoxProps): UseComboboxDatasourceResult {
    const { datasource, labelAttribute, valueAttribute } = widgetProps;

    return useMemo(() => {
        if (datasource.status === "loading") {
            return { options: [], loading: true };
        }

        if (datasource.status !== "available") {
            return { options: [], loading: false };
        }

        return {
            options: mapDatasourceToOptions(datasource, { labelAttribute, valueAttribute }),
            loading: false
        };
    }, [datasource, labelAttribute, valueAttribute]);
}
