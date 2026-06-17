import { ChartEvents, type ChartEventBus, type ChartEventPayload } from "@iris/chart-core";
import { JSX, useEffect } from "react";

export interface ChartEventMonitorProps {
    eventBus: ChartEventBus;
    onChartEvent?: (payload: ChartEventPayload) => void;
}

export function ChartEventMonitor({ eventBus, onChartEvent }: ChartEventMonitorProps): JSX.Element | null {
    useEffect(() => {
        if (!onChartEvent) {
            return undefined;
        }

        const unsubscribers = Object.values(ChartEvents).map(type =>
            eventBus.on(type, payload => onChartEvent(payload))
        );

        return () => {
            for (const unsubscribe of unsubscribers) {
                unsubscribe();
            }
        };
    }, [eventBus, onChartEvent]);

    return null;
}
