import { AX_EVENT_BUS_KEY, type AxEventBus } from "./types";

export interface GlobalScope {
    [AX_EVENT_BUS_KEY]?: AxEventBus;
}

export function getGlobalScope(): GlobalScope {
    if (typeof window !== "undefined") {
        return window as unknown as GlobalScope;
    }

    return globalThis as GlobalScope;
}
