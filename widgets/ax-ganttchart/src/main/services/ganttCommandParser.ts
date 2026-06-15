import { GanttIncomingEvents, type ScrollToTaskData, type SetDateData } from "../eventbus/eventTypes";
import {
    GanttCommand,
    ganttCommandToEvent,
    parseGanttCommandEnum,
    warnUnsupportedCommand
} from "../../shared/commands/GanttCommand";

export interface ParsedGanttCommand {
    type: GanttIncomingEvents;
    command: GanttCommand;
    data?: unknown;
}

function parsePayload(payloadJson?: string): unknown {
    if (payloadJson == null || payloadJson.trim() === "") {
        return undefined;
    }

    try {
        return JSON.parse(payloadJson) as unknown;
    } catch {
        return payloadJson;
    }
}

export function parseGanttCommandType(value: string): GanttIncomingEvents | undefined {
    const command = parseGanttCommandEnum(value);
    return command ? ganttCommandToEvent(command) : undefined;
}

export function parseGanttCommand(command: string, payloadJson?: string): ParsedGanttCommand | undefined {
    const typedCommand = parseGanttCommandEnum(command);
    if (!typedCommand) {
        warnUnsupportedCommand(command);
        return undefined;
    }

    const type = ganttCommandToEvent(typedCommand);
    const rawData = parsePayload(payloadJson);

    if (type === GanttIncomingEvents.SET_START_DATE || type === GanttIncomingEvents.SET_END_DATE) {
        if (rawData && typeof rawData === "object" && "date" in rawData) {
            return { type, command: typedCommand, data: rawData as SetDateData };
        }

        if (typeof rawData === "string" && rawData) {
            return { type, command: typedCommand, data: { date: rawData } satisfies SetDateData };
        }

        return { type, command: typedCommand };
    }

    if (type === GanttIncomingEvents.SCROLL_TO_TASK) {
        if (rawData && typeof rawData === "object" && "taskId" in rawData) {
            return { type, command: typedCommand, data: rawData as ScrollToTaskData };
        }

        if (typeof rawData === "string" && rawData) {
            return { type, command: typedCommand, data: { taskId: rawData } satisfies ScrollToTaskData };
        }

        return { type, command: typedCommand };
    }

    return { type, command: typedCommand, data: rawData };
}

export { GANTT_COMMAND_NAMES } from "../../shared/commands/GanttCommand";
