import { useEffect } from "react";
import type { GanttStore } from "../../stores/GanttStore";
import type { AxGanttChartProps } from "../../typings/AxGanttChartProps";
import {
    isDatasourceLoading,
    isDatasourceUnavailable,
    mapMendixDatasourceToGanttTasks,
    validateDatasourceMapping
} from "../services/MendixTaskAdapter";

export function useDatasourceSync(store: GanttStore, props: AxGanttChartProps, enabled = true): boolean {
    const { tasksDatasource } = props;
    const mappingValidation = validateDatasourceMapping(props);
    const mappingValid = mappingValidation.valid;

    useEffect(() => {
        if (!enabled) {
            return;
        }

        if (!mappingValid) {
            store.setTasksIfChanged([]);
            store.setLoading(false);
            return;
        }

        store.setLoading(isDatasourceLoading(tasksDatasource));

        if (isDatasourceUnavailable(tasksDatasource)) {
            store.setTasksIfChanged([]);
            store.setLoading(false);
            return;
        }

        if (isDatasourceLoading(tasksDatasource)) {
            return;
        }

        const result = mapMendixDatasourceToGanttTasks(props);
        store.setTasksIfChanged(result.tasks);
        store.setLoading(false);

        if (store.selectedTask && !result.tasks.some(task => task.id === store.selectedTask?.id)) {
            store.selectTask(undefined);
        }
    }, [
        enabled,
        mappingValid,
        store,
        tasksDatasource,
        tasksDatasource.status,
        tasksDatasource.items,
        props.idAttribute,
        props.textAttribute,
        props.startDateAttribute,
        props.endDateAttribute,
        props.durationAttribute,
        props.progressAttribute,
        props.parentAttribute,
        props.openAttribute,
        props.typeAttribute,
        props.tagsAttribute
    ]);

    return mappingValid;
}
