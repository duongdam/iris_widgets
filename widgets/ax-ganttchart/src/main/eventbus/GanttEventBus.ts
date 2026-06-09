import { type GanttEventBus, type GanttEventHandler, type GanttEventPayload, type GanttEventType } from "./eventTypes";

type HandlerEntry = {
    handler: GanttEventHandler;
    once: boolean;
};

export class GanttEventBusImpl implements GanttEventBus {
    private readonly handlers = new Map<GanttEventType, Set<HandlerEntry>>();

    emit(payload: GanttEventPayload): void {
        const entries = this.handlers.get(payload.type);
        if (!entries) {
            return;
        }

        const toRemove: HandlerEntry[] = [];

        for (const entry of entries) {
            entry.handler(payload);
            if (entry.once) {
                toRemove.push(entry);
            }
        }

        for (const entry of toRemove) {
            entries.delete(entry);
        }
    }

    on(type: GanttEventType, handler: GanttEventHandler): () => void {
        this.addHandler(type, handler, false);
        return () => this.off(type, handler);
    }

    off(type: GanttEventType, handler: GanttEventHandler): void {
        const entries = this.handlers.get(type);
        if (!entries) {
            return;
        }

        for (const entry of entries) {
            if (entry.handler === handler) {
                entries.delete(entry);
                break;
            }
        }
    }

    once(type: GanttEventType, handler: GanttEventHandler): void {
        this.addHandler(type, handler, true);
    }

    clear(): void {
        this.handlers.clear();
    }

    private addHandler(type: GanttEventType, handler: GanttEventHandler, once: boolean): void {
        const entries = this.handlers.get(type) ?? new Set<HandlerEntry>();
        entries.add({ handler, once });
        this.handlers.set(type, entries);
    }
}

export function createGanttEventBus(): GanttEventBus {
    return new GanttEventBusImpl();
}
