import { JSX, useEffect } from "react";
import { GanttIncomingEvents } from "../../../widgets/ax-ganttchart/src/events/eventTypes";
import { getEventBus } from "../../../widgets/ax-ganttchart/src/shared/eventBus/getEventBus";
import { initEventBus } from "../../../widgets/ax-ganttchart/src/shared/eventBus/initEventBus";
import type { AxEvent } from "../../../widgets/ax-ganttchart/src/shared/eventBus/types";

const MONITORED_TOPICS = Object.values(GanttIncomingEvents);

export interface GanttBusEventLogEntry {
    topic: string;
    widgetId: string;
    payload?: Record<string, unknown>;
    at: string;
}

export interface GanttEventMonitorProps {
    widgetId: string;
    onBusEvent?: (entry: GanttBusEventLogEntry) => void;
}

export function GanttEventMonitor({ widgetId, onBusEvent }: GanttEventMonitorProps): JSX.Element | null {
    useEffect(() => {
        if (!onBusEvent) {
            return undefined;
        }

        initEventBus();
        const bus = getEventBus();
        if (!bus) {
            return undefined;
        }

        const unsubscribers = MONITORED_TOPICS.map(topic =>
            bus.on(topic, (event: AxEvent) => {
                if (event.widgetId !== widgetId) {
                    return;
                }

                onBusEvent({
                    topic,
                    widgetId: event.widgetId,
                    payload: event.payload,
                    at: new Date().toISOString()
                });
            })
        );

        return () => {
            for (const unsubscribe of unsubscribers) {
                unsubscribe();
            }
        };
    }, [onBusEvent, widgetId]);

    return null;
}
