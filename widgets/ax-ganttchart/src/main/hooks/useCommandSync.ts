import { useEffect, useRef } from "react";
import type { EditableValue } from "mendix";
import { emitEvent } from "../../shared/eventBus/emitEvent";
import { parseGanttCommand } from "../services/ganttCommandParser";

export interface UseCommandSyncOptions {
    command?: EditableValue<string>;
    commandPayload?: EditableValue<string>;
    widgetId: string;
    enabled: boolean;
}

/**
 * Executes Mendix-driven commands when the writable `command` attribute changes.
 */
export function useCommandSync(options: UseCommandSyncOptions): void {
    const { command, commandPayload, widgetId, enabled } = options;
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
        emitEvent(parsed.type, {
            widgetId,
            payload: parsed.data as Record<string, unknown> | undefined
        });
    }, [command?.value, commandPayload?.value, widgetId, enabled]);
}
