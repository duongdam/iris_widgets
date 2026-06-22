export const AX_EVENT_BUS_KEY = "AX_EVENT_BUS";

export interface AxEvent {
    widgetId: string;
    payload?: Record<string, unknown>;
}

export interface AxEventBus {
    emit(topic: string, event: AxEvent): void;
    on(topic: string, handler: (event: AxEvent) => void): () => void;
    removeListener(topic: string, handler: (event: AxEvent) => void): void;
    clear(): void;
}

type HandlerEntry = {
    handler: (event: AxEvent) => void;
};

interface GlobalScope {
    [AX_EVENT_BUS_KEY]?: AxEventBus;
}

function getGlobalScope(): GlobalScope {
    if (typeof window !== "undefined") {
        return window as unknown as GlobalScope;
    }

    return globalThis as GlobalScope;
}

export function createBus(): AxEventBus {
    const handlers = new Map<string, Set<HandlerEntry>>();

    return {
        emit(topic: string, event: AxEvent): void {
            const entries = handlers.get(topic);
            if (!entries) {
                return;
            }

            for (const entry of entries) {
                entry.handler(event);
            }
        },

        on(topic: string, handler: (event: AxEvent) => void): () => void {
            const entries = handlers.get(topic) ?? new Set<HandlerEntry>();
            const entry: HandlerEntry = { handler };
            entries.add(entry);
            handlers.set(topic, entries);

            return () => {
                entries.delete(entry);
            };
        },

        removeListener(topic: string, handler: (event: AxEvent) => void): void {
            const entries = handlers.get(topic);
            if (!entries) {
                return;
            }

            for (const entry of entries) {
                if (entry.handler === handler) {
                    entries.delete(entry);
                    break;
                }
            }
        },

        clear(): void {
            handlers.clear();
        }
    };
}

export function initEventBus(): AxEventBus {
    const scope = getGlobalScope();
    const bus = createBus();
    scope[AX_EVENT_BUS_KEY] = bus;
    return bus;
}

export function getEventBus(): AxEventBus | undefined {
    return getGlobalScope()[AX_EVENT_BUS_KEY];
}

export function emitEvent(topic: string, event: AxEvent): void {
    getEventBus()?.emit(topic, event);
}
