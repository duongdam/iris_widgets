import type { GanttEventBus, GanttEventPayload, GanttIncomingEvents } from "../eventbus/eventTypes";
import { GANTT_COMMAND_NAMES, ganttCommandToEvent, parseGanttCommandEnum } from "../../shared/commands/GanttCommand";

const registry = new Map<string, GanttEventBus>();
const lastOutgoingEvents = new Map<string, GanttEventPayload>();
const outgoingListeners = new Map<string, Set<(payload: GanttEventPayload) => void>>();

export interface AxGanttGlobalApi {
    /** Emit a command to a registered Gantt widget by its Mendix widget name. */
    emit: (widgetId: string, type: GanttIncomingEvents | string, data?: unknown) => boolean;
    /** List widget names currently registered on the page. */
    list: () => string[];
    /** All supported incoming command names. */
    commands: readonly string[];
    /** Last outgoing event for a widget (read in nanoflow after On event). */
    getLastEvent: (widgetId: string) => GanttEventPayload | undefined;
    /** Subscribe to outgoing events from nanoflow JavaScript. */
    on: (widgetId: string, handler: (payload: GanttEventPayload) => void) => () => void;
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
    lastOutgoingEvents.delete(widgetId);
    outgoingListeners.delete(widgetId);
}

export function recordGanttOutgoingEvent(payload: GanttEventPayload): void {
    lastOutgoingEvents.set(payload.widgetId, payload);
}

export function getLastGanttOutgoingEvent(widgetId: string): GanttEventPayload | undefined {
    return lastOutgoingEvents.get(widgetId);
}

export function notifyGanttOutgoingEvent(payload: GanttEventPayload): void {
    const listeners = outgoingListeners.get(payload.widgetId);
    if (!listeners) {
        return;
    }

    for (const listener of listeners) {
        listener(payload);
    }
}

export function subscribeGanttOutgoingEvent(
    widgetId: string,
    handler: (payload: GanttEventPayload) => void
): () => void {
    const listeners = outgoingListeners.get(widgetId) ?? new Set();
    listeners.add(handler);
    outgoingListeners.set(widgetId, listeners);

    return () => {
        listeners.delete(handler);
        if (listeners.size === 0) {
            outgoingListeners.delete(widgetId);
        }
    };
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
        commands: GANTT_COMMAND_NAMES,
        getLastEvent: getLastGanttOutgoingEvent,
        on: subscribeGanttOutgoingEvent
    };
}
