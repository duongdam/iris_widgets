import { GANTT_TEST_RAW_ITEMS, type RawGanttTestItem } from "./gantt-test.items";
import { isGroupType, normalizeTaskType, type AxGanttTask } from "../types/axGanttTask";
import { normalizeMtoDateField } from "../utils/mtoDate";

function mapRawItem(item: RawGanttTestItem): AxGanttTask {
    const type = normalizeTaskType(item.type);
    const unscheduled = isGroupType(type);

    const task: AxGanttTask = {
        id: item.id,
        text: item.text ?? item.name ?? item.id,
        name: item.name,
        type,
        parent: item.parent ?? undefined,
        order: item.order,
        customOrder: item.customOrder,
        count: item.count,
        unscheduled,
        hasTuning: item.hasTuning,
        hasManual: item.hasManual,
        hasCert: item.hasCert,
        hasRF: item.hasRF,
        canEdit: item.canEdit,
        metadata: {
            metadata1: item.metadata1,
            metadata2: item.metadata2,
            metadata3: item.metadata3,
            metadata4: item.metadata4,
            metadata5: item.metadata5
        }
    };

    if (!unscheduled) {
        if (item.startdate) {
            task.start_date = item.startdate;
        }
        if (item.endDate) {
            task.end_date = item.endDate;
        }
        if (item.milestone) {
            task.milestone = item.milestone;
        }
        if (item.stndMileMonth) {
            task.stndMileMonth = item.stndMileMonth;
        }
        return normalizeMtoDateField(task);
    }

    return task;
}

export const GANTT_TEST_TASKS: AxGanttTask[] = GANTT_TEST_RAW_ITEMS.map(mapRawItem);

/** @deprecated Use GANTT_TEST_TASKS */
export const MOCK_GANTT_TASKS = GANTT_TEST_TASKS;
