import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { chartCommandToEvent, parseChartCommand } from "../commands/ChartCommand";
import type { ChartStore } from "../stores/ChartStore";
import { createFullscreenService } from "../services/FullscreenService";
import { ChartEvents, type ChartEventBus } from "../eventbus/types";

export interface MendixAttributeLike {
    status?: string;
    value?: string;
    displayValue?: string;
}

export interface ChartCommandProps {
    command?: MendixAttributeLike;
    commandPayload?: MendixAttributeLike;
}

export interface UseChartCommandSyncOptions {
    command?: ChartCommandProps["command"];
    commandPayload?: ChartCommandProps["commandPayload"];
    eventBus: ChartEventBus;
    widgetId: string;
    store: ChartStore;
    containerRef: RefObject<HTMLElement | null>;
    enabled?: boolean;
}

function readMendixAttributeValue(attribute?: MendixAttributeLike): string {
    if (attribute?.status && attribute.status !== "available") {
        return "";
    }

    return (attribute?.value ?? attribute?.displayValue ?? "").trim();
}

function emitFullscreenChanged(
    eventBus: ChartEventBus,
    widgetId: string,
    fullscreen: boolean
): void {
    eventBus.emit({
        widgetId,
        type: ChartEvents.FULLSCREEN_CHANGED,
        data: { fullscreen },
    });
}

export function useChartCommandSync(options: UseChartCommandSyncOptions): void {
    const {
        command,
        commandPayload: _commandPayload,
        eventBus,
        widgetId,
        store,
        containerRef,
        enabled = true,
    } = options;

    const lastCommandRef = useRef<string | null>(null);
    const fullscreenService = useMemo(() => createFullscreenService(), []);

    // Register fullscreen handlers before processing commands so events are not missed on mount.
    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const unsubscribers = [
            eventBus.on(ChartEvents.ENTER_FULLSCREEN, async payload => {
                if (payload.widgetId !== widgetId || !containerRef.current) {
                    return;
                }

                const enteredNativeFullscreen = await fullscreenService.enter(containerRef.current);
                if (!enteredNativeFullscreen) {
                    store.setFullscreen(true);
                    emitFullscreenChanged(eventBus, widgetId, true);
                }
            }),
            eventBus.on(ChartEvents.EXIT_FULLSCREEN, async payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }

                if (fullscreenService.isFullscreen()) {
                    await fullscreenService.exit();
                }

                if (store.fullscreen) {
                    store.setFullscreen(false);
                    emitFullscreenChanged(eventBus, widgetId, false);
                }
            }),
        ];

        const removeFullscreenListener = fullscreenService.onChange(fullscreen => {
            store.setFullscreen(fullscreen);
            emitFullscreenChanged(eventBus, widgetId, fullscreen);
        });

        return () => {
            for (const unsubscribe of unsubscribers) {
                unsubscribe();
            }
            removeFullscreenListener();
        };
    }, [containerRef, enabled, eventBus, fullscreenService, store, widgetId]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const commandValue = readMendixAttributeValue(command);
        if (!commandValue) {
            lastCommandRef.current = null;
            return;
        }

        if (commandValue === lastCommandRef.current) {
            return;
        }

        const parsed = parseChartCommand(commandValue);
        if (!parsed) {
            return;
        }

        lastCommandRef.current = commandValue;
        eventBus.emit({
            widgetId,
            type: chartCommandToEvent(parsed),
        });
    }, [command, enabled, eventBus, widgetId]);
}
