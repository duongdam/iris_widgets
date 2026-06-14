import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { chartCommandToEvent, parseChartCommand } from "../commands/ChartCommand";
import type { ChartStore } from "../stores/ChartStore";
import { createFullscreenService } from "../services/FullscreenService";
import { ChartEvents, type ChartEventBus } from "../eventbus/types";

export interface ChartCommandProps {
    command?: { value?: string };
    commandPayload?: { value?: string };
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

        const parsed = parseChartCommand(commandValue);
        if (!parsed) {
            return;
        }

        lastCommandRef.current = commandValue;
        eventBus.emit({
            widgetId,
            type: chartCommandToEvent(parsed),
        });
    }, [command?.value, enabled, eventBus, widgetId]);

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const unsubscribers = [
            eventBus.on(ChartEvents.ENTER_FULLSCREEN, async payload => {
                if (payload.widgetId !== widgetId || !containerRef.current) {
                    return;
                }

                await fullscreenService.enter(containerRef.current);
            }),
            eventBus.on(ChartEvents.EXIT_FULLSCREEN, async payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }

                await fullscreenService.exit();
            }),
        ];

        const removeFullscreenListener = fullscreenService.onChange(fullscreen => {
            store.setFullscreen(fullscreen);
            eventBus.emit({
                widgetId,
                type: ChartEvents.FULLSCREEN_CHANGED,
                data: { fullscreen },
            });
        });

        return () => {
            for (const unsubscribe of unsubscribers) {
                unsubscribe();
            }
            removeFullscreenListener();
        };
    }, [containerRef, enabled, eventBus, fullscreenService, store, widgetId]);
}
