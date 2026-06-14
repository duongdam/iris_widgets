import type { ChartEventBus } from "@iris/chart-core";
import { useEffect } from "react";

export interface ChartDemoContext {
    eventBus: ChartEventBus;
    widgetId: string;
}

export interface ChartContextExporterProps {
    eventBus: ChartEventBus;
    widgetId: string;
    onContextReady?: (context: ChartDemoContext) => void;
}

export function ChartContextExporter({
    eventBus,
    widgetId,
    onContextReady,
}: ChartContextExporterProps): null {
    useEffect(() => {
        onContextReady?.({ eventBus, widgetId });
    }, [eventBus, onContextReady, widgetId]);

    return null;
}
