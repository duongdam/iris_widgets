import { useEffect, useRef } from "react";
import type { EditableValue } from "mendix";
import type { GanttEventBus } from "../eventbus/eventTypes";
import { parseGanttCommand } from "../services/ganttCommandParser";

export interface UseCommandSyncOptions {
    command?: EditableValue<string>;
    commandPayload?: EditableValue<string>;
    eventBus: GanttEventBus;
    widgetId: string;
    enabled: boolean;
}

/**
 * Executes Mendix-driven commands when the writable `command` attribute changes.
 * Clear the attribute after each trigger so the same command can fire again.
 */
export function useCommandSync(options: UseCommandSyncOptions): void {
    const { command, commandPayload, eventBus, widgetId, enabled } = options;
    const lastCommandRef = useRef<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const commandValue = command?.value?.trim() ?? "";
        if (!commandValue) {
            lastCommandRef.current = null;
            return;
        }

        if (commandValue === lastCommandRef.current) {
            return;
        }

        const parsed = parseGanttCommand(commandValue, commandPayload?.value ?? undefined);
        if (!parsed) {
            return;
        }

        lastCommandRef.current = commandValue;
        eventBus.emit({
            widgetId,
            type: parsed.type,
            data: parsed.data
        });
    }, [command?.value, commandPayload?.value, eventBus, widgetId, enabled]);
}
