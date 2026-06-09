import { useEffect } from "react";
import type { GanttStore } from "../../stores/GanttStore";
import type { AxGanttChartProps } from "../../typings/AxGanttChartProps";
import {
    isDatasourceLoading,
    isDatasourceUnavailable,
    mapMendixDatasourceToGanttTasks
} from "../services/MendixTaskAdapter";

export function useDatasourceSync(store: GanttStore, props: AxGanttChartProps, enabled = true): void {
    const { tasksDatasource } = props;

    useEffect(() => {
        if (!enabled) {
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
        props.typeAttribute
    ]);
}
