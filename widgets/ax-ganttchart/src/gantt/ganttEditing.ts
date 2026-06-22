import type { GanttStatic } from "dhtmlx-gantt";
import type { GanttTask } from "../events/ganttEvents";
import type { GanttEditingConfig } from "../shared/types/editingConfig";
import { getEventTypeTag } from "../shared/utils/mtoDate";
import { gantt } from "./ganttInstance";

/** Apply Mendix editing flags to DHTMLX Gantt. Returns detach function for event handlers. */
export function applyEditingConfig(config: GanttEditingConfig, target: GanttStatic = gantt): () => void {
    const editable = !config.readOnly;

    target.config.readonly = config.readOnly;
    target.config.drag_move = config.allowDrag && editable;
    target.config.drag_resize = config.allowResize && editable;
    target.config.drag_progress = config.allowUpdate && editable;
    target.config.details_on_create = config.allowCreate && editable;
    target.config.details_on_dblclick = false;

    const eventIds: string[] = [];

    eventIds.push(
        target.attachEvent("onBeforeTaskAdd", () => {
            return config.allowCreate && editable;
        })
    );

    eventIds.push(
        target.attachEvent("onBeforeTaskDelete", () => {
            return config.allowDelete && editable;
        })
    );

    eventIds.push(
        target.attachEvent("onBeforeTaskChanged", (_id, mode, task) => {
            const typedTask = task as GanttTask;

            if (mode === "resize" || mode === "progress") {
                if (getEventTypeTag(typedTask.milestone)) {
                    return false;
                }

                if (mode === "resize") {
                    return config.allowResize && editable;
                }

                return config.allowUpdate && editable;
            }

            if (mode === "move") {
                return config.allowDrag && editable;
            }

            return config.allowUpdate && editable;
        })
    );

    return () => {
        for (const eventId of eventIds) {
            target.detachEvent(eventId);
        }
    };
}
