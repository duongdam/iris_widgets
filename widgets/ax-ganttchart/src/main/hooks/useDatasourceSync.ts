import { useEffect } from "react";
import type { AxGanttStore } from "../../stores/AxGanttStore";
import type { AxGanttChartProps } from "../../typings/AxGanttChartProps";
import {
    isDatasourceLoading,
    isDatasourceUnavailable,
    mapMendixDatasourceToGanttTasks,
    validateDatasourceMapping
} from "../services/MendixTaskAdapter";
import { preserveBranchOpenState } from "../../shared/utils/preserveBranchOpenState";

export function useDatasourceSync(store: AxGanttStore, props: AxGanttChartProps, enabled = true): boolean {
    const { roadmapItems } = props;
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

        store.setLoading(isDatasourceLoading(roadmapItems));

        if (isDatasourceUnavailable(roadmapItems)) {
            store.setTasksIfChanged([]);
            store.setLoading(false);
            return;
        }

        if (isDatasourceLoading(roadmapItems)) {
            return;
        }

        const result = mapMendixDatasourceToGanttTasks(props);
        store.setTasksIfChanged(preserveBranchOpenState(store.tasks, result.tasks));
        store.setLoading(false);

        if (store.selectedTask && !result.tasks.some(task => task.id === store.selectedTask?.id)) {
            store.selectTask(undefined);
        }
    }, [enabled, mappingValid, store, roadmapItems, roadmapItems.status, roadmapItems.items, props]);

    return mappingValid;
}
