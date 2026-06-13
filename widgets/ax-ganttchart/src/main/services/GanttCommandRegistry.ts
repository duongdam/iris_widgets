import type { GanttEventBus, GanttIncomingEvents } from "../eventbus/eventTypes";
import { GANTT_COMMAND_NAMES, ganttCommandToEvent, parseGanttCommandEnum } from "../../shared/commands/GanttCommand";

const registry = new Map<string, GanttEventBus>();

export interface AxGanttGlobalApi {
    /** Emit a command to a registered Gantt widget by its Mendix widget name. */
    emit: (widgetId: string, type: GanttIncomingEvents | string, data?: unknown) => boolean;
    /** List widget names currently registered on the page. */
    list: () => string[];
    /** All supported incoming command names. */
    commands: readonly string[];
}

declare global {
    interface Window {
        __AX_GANTT__?: AxGanttGlobalApi;
    }
}

let globalInstalled = false;

export function registerGanttWidget(widgetId: string, eventBus: GanttEventBus): void {
    registry.set(widgetId, eventBus);
}

export function unregisterGanttWidget(widgetId: string): void {
    registry.delete(widgetId);
}

export function emitGanttCommand(widgetId: string, type: GanttIncomingEvents, data?: unknown): boolean {
    const eventBus = registry.get(widgetId);
    if (!eventBus) {
        return false;
    }

    eventBus.emit({ widgetId, type, data });
    return true;
}

export function listGanttWidgets(): string[] {
    return [...registry.keys()];
}

export function installGanttGlobalApi(): void {
    if (globalInstalled || typeof window === "undefined") {
        return;
    }

    globalInstalled = true;
    window.__AX_GANTT__ = {
        emit(widgetId: string, type: GanttIncomingEvents | string, data?: unknown): boolean {
            if (typeof type === "string") {
                const command = parseGanttCommandEnum(type);
                if (!command) {
                    return false;
                }
                return emitGanttCommand(widgetId, ganttCommandToEvent(command), data);
            }

            return emitGanttCommand(widgetId, type, data);
        },
        list: listGanttWidgets,
        commands: GANTT_COMMAND_NAMES
    };
}
