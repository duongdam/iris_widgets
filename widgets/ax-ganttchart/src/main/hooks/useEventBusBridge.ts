import { useEffect, useMemo } from "react";
import { gantt } from "../components/GanttConfiguration";
import {
    fitTimeline,
    incomingEventToViewMode,
    scrollToToday,
    scrollToTask
} from "../components/TimelineManager";
import {
    GanttIncomingEvents,
    type GanttEventBus,
    type ScrollToTaskData,
    type SetDateData
} from "../eventbus/eventTypes";
import type { GanttStore } from "../../stores/GanttStore";
import { createExportService, type ExportService } from "../services/ExportService";
import { createFullscreenService } from "../services/FullscreenService";
import type { WidgetEventBridge } from "../services/WidgetEventBridge";

export interface UseEventBusBridgeOptions {
    store: GanttStore;
    eventBus: GanttEventBus;
    widgetId: string;
    bridge: WidgetEventBridge;
    containerRef: React.RefObject<HTMLDivElement>;
    exportServerUrl?: string;
    onRefresh?: () => void;
}

export function useEventBusBridge(options: UseEventBusBridgeOptions): void {
    const { store, eventBus, widgetId, bridge, containerRef, exportServerUrl, onRefresh } = options;

    const exportService: ExportService = useMemo(() => createExportService(exportServerUrl), [exportServerUrl]);
    const fullscreenService = useMemo(() => createFullscreenService(), []);

    useEffect(() => {
        const unsubscribers = [
            eventBus.on(GanttIncomingEvents.REFRESH, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                onRefresh?.();
            }),

            eventBus.on(GanttIncomingEvents.LOAD_DATA, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                onRefresh?.();
            }),

            eventBus.on(GanttIncomingEvents.EXPAND_ALL, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                gantt.eachTask(task => gantt.open(task.id));
            }),

            eventBus.on(GanttIncomingEvents.COLLAPSE_ALL, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                gantt.eachTask(task => gantt.close(task.id));
            }),

            eventBus.on(GanttIncomingEvents.ENTER_FULLSCREEN, async payload => {
                if (payload.widgetId !== widgetId || !containerRef.current) {
                    return;
                }
                await fullscreenService.enter(containerRef.current);
            }),

            eventBus.on(GanttIncomingEvents.EXIT_FULLSCREEN, async payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                await fullscreenService.exit();
            }),

            eventBus.on(GanttIncomingEvents.SCROLL_TO_TODAY, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                scrollToToday(gantt);
            }),

            eventBus.on(GanttIncomingEvents.SCROLL_TO_TASK, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                const data = payload.data as ScrollToTaskData | undefined;
                if (data?.taskId) {
                    scrollToTask(gantt, data.taskId);
                }
            }),

            eventBus.on(GanttIncomingEvents.FIT_TIMELINE, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                fitTimeline(gantt);
                bridge.handleTimelineChanged();
            }),

            eventBus.on(GanttIncomingEvents.SET_START_DATE, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                const data = payload.data as SetDateData | undefined;
                if (data?.date) {
                    store.setTimelineStart(new Date(data.date));
                    bridge.handleTimelineChanged();
                }
            }),

            eventBus.on(GanttIncomingEvents.SET_END_DATE, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                const data = payload.data as SetDateData | undefined;
                if (data?.date) {
                    store.setTimelineEnd(new Date(data.date));
                    bridge.handleTimelineChanged();
                }
            }),

            eventBus.on(GanttIncomingEvents.SHOW_GRID, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                store.setShowGrid(true);
            }),

            eventBus.on(GanttIncomingEvents.HIDE_GRID, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                store.setShowGrid(false);
            }),

            eventBus.on(GanttIncomingEvents.SHOW_TIMELINE, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                store.setShowTimeline(true);
            }),

            eventBus.on(GanttIncomingEvents.HIDE_TIMELINE, payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                store.setShowTimeline(false);
            }),

            eventBus.on(GanttIncomingEvents.EXPORT_PDF, async payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                await exportService.exportPdf({ name: "gantt.pdf" });
            }),

            eventBus.on(GanttIncomingEvents.EXPORT_PNG, async payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                await exportService.exportPng({ name: "gantt.png" });
            }),

            eventBus.on(GanttIncomingEvents.EXPORT_JPEG, async payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                await exportService.exportJpeg({ name: "gantt.jpeg" });
            }),

            eventBus.on(GanttIncomingEvents.EXPORT_EXCEL, async payload => {
                if (payload.widgetId !== widgetId) {
                    return;
                }
                await exportService.exportExcel({ name: "gantt.xlsx" });
            })
        ];

        const zoomEvents = [
            GanttIncomingEvents.ZOOM_DAY,
            GanttIncomingEvents.ZOOM_WEEK,
            GanttIncomingEvents.ZOOM_MONTH,
            GanttIncomingEvents.ZOOM_QUARTER
        ];

        for (const zoomEvent of zoomEvents) {
            unsubscribers.push(
                eventBus.on(zoomEvent, payload => {
                    if (payload.widgetId !== widgetId) {
                        return;
                    }
                    const mode = incomingEventToViewMode(zoomEvent);
                    if (mode) {
                        store.setViewMode(mode);
                    }
                })
            );
        }

        const removeFullscreenListener = fullscreenService.onChange(fullscreen => {
            store.setFullscreen(fullscreen);
            bridge.handleFullscreenChanged(fullscreen);
        });

        return () => {
            for (const unsubscribe of unsubscribers) {
                unsubscribe();
            }
            removeFullscreenListener();
        };
    }, [store, eventBus, widgetId, bridge, containerRef, exportService, fullscreenService, onRefresh]);
}
