import {
    GanttIncomingEvents,
    GanttOutgoingEvents,
    type GanttEventBus,
    type GanttEventPayload,
} from "../../../widgets/ax-ganttchart/src/main/eventbus/eventTypes";
import { useEffect } from "react";

const MONITORED_EVENTS = [
    ...Object.values(GanttOutgoingEvents),
    ...Object.values(GanttIncomingEvents),
];

export interface GanttEventMonitorProps {
    eventBus: GanttEventBus;
    onGanttEvent?: (payload: GanttEventPayload) => void;
}

export function GanttEventMonitor({
    eventBus,
    onGanttEvent,
}: GanttEventMonitorProps): JSX.Element | null {
    useEffect(() => {
        if (!onGanttEvent) {
            return undefined;
        }

        const unsubscribers = MONITORED_EVENTS.map(type =>
            eventBus.on(type, payload => onGanttEvent(payload))
        );

        return () => {
            for (const unsubscribe of unsubscribers) {
                unsubscribe();
            }
        };
    }, [eventBus, onGanttEvent]);

    return null;
}
