import {
    ChartEvents,
    type ChartEventBus,
    type ChartEventHandler,
    type ChartEventPayload,
} from "./types";

type HandlerEntry = {
    handler: ChartEventHandler;
    once: boolean;
};

export class ChartEventBusImpl implements ChartEventBus {
    private readonly handlers = new Map<ChartEvents, Set<HandlerEntry>>();

    emit(payload: ChartEventPayload): void {
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

    on(type: ChartEvents, handler: ChartEventHandler): () => void {
        this.addHandler(type, handler, false);
        return () => this.off(type, handler);
    }

    off(type: ChartEvents, handler: ChartEventHandler): void {
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

    once(type: ChartEvents, handler: ChartEventHandler): void {
        this.addHandler(type, handler, true);
    }

    clear(): void {
        this.handlers.clear();
    }

    private addHandler(type: ChartEvents, handler: ChartEventHandler, once: boolean): void {
        const entries = this.handlers.get(type) ?? new Set<HandlerEntry>();
        entries.add({ handler, once });
        this.handlers.set(type, entries);
    }
}

export function createChartEventBus(): ChartEventBus {
    return new ChartEventBusImpl();
}
