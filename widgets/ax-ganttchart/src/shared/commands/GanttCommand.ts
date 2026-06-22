import { GanttEvent as GanttCommand, parseGanttCommandEnum, GANTT_COMMAND_NAMES, warnUnsupportedCommand } from "../../events/ganttEvents";
import type { GanttEvent } from "../../events/ganttEvents";

export { GanttCommand, parseGanttCommandEnum, GANTT_COMMAND_NAMES, warnUnsupportedCommand };

/** @deprecated Commands and events share {@link GanttEvent} */
export function ganttCommandToEvent(command: GanttEvent): GanttEvent {
    return command;
}
