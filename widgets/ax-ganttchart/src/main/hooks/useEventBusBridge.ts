import { useEffect, useMemo, useRef } from "react";
import { gantt } from "../components/GanttConfiguration";
import { collapseAllBranches, expandNextLevel } from "../components/TreeExpandManager";
import {
    fitTimeline,
    incomingEventToViewMode,
    scrollToToday,
    scrollToTask
} from "../components/TimelineManager";
import { GanttIncomingEvents, type ScrollToTaskData, type SetDateData } from "../../events/eventTypes";
import type { AxGanttStore } from "../../stores/AxGanttStore";
import { createExportService, type ExportService } from "../services/ExportService";
import { createFullscreenService } from "../services/FullscreenService";
import { getEventBus } from "../../shared/eventBus/getEventBus";
import type { AxEvent } from "../../shared/eventBus/types";

export interface UseEventBusBridgeOptions {
    store: AxGanttStore;
    widgetId: string;
    containerRef: React.RefObject<HTMLDivElement>;
    onRefresh?: () => void;
    isPreview?: boolean;
}

function matchesWidget(event: AxEvent, widgetId: string): boolean {
    return event.widgetId === widgetId;
}

export function useEventBusBridge(options: UseEventBusBridgeOptions): void {
    const { store, widgetId, containerRef, onRefresh, isPreview } = options;

    const onRefreshRef = useRef(onRefresh);
    onRefreshRef.current = onRefresh;

    const exportService: ExportService = useMemo(() => createExportService(), []);
    const fullscreenService = useMemo(() => createFullscreenService(), []);

    useEffect(() => {
        if (isPreview) {
            return undefined;
        }

        const bus = getEventBus();
        if (!bus) {
            return undefined;
        }

        const unsubscribers = [
            bus.on(GanttIncomingEvents.REFRESH, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                onRefreshRef.current?.();
            }),

            bus.on(GanttIncomingEvents.LOAD_DATA, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                onRefreshRef.current?.();
            }),

            bus.on(GanttIncomingEvents.EXPAND_ALL, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                const nextLevel = expandNextLevel(gantt, store.expandLevel);
                store.setExpandLevel(nextLevel);
            }),

            bus.on(GanttIncomingEvents.COLLAPSE_ALL, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                collapseAllBranches(gantt);
                store.resetExpandLevel();
            }),

            bus.on(GanttIncomingEvents.ENTER_FULLSCREEN, async event => {
                if (!matchesWidget(event, widgetId) || !containerRef.current) {
                    return;
                }
                const enteredNativeFullscreen = await fullscreenService.enter(containerRef.current);
                if (!enteredNativeFullscreen) {
                    store.setFullscreen(true);
                }
            }),

            bus.on(GanttIncomingEvents.EXIT_FULLSCREEN, async event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                if (fullscreenService.isFullscreen()) {
                    await fullscreenService.exit();
                }
                if (store.fullscreen) {
                    store.setFullscreen(false);
                }
            }),

            bus.on(GanttIncomingEvents.ENTER_EXPAND_HEIGHT, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                store.setExpandHeight(true);
            }),

            bus.on(GanttIncomingEvents.EXIT_EXPAND_HEIGHT, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                store.setExpandHeight(false);
            }),

            bus.on(GanttIncomingEvents.TOGGLE_EXPAND_HEIGHT, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                store.toggleExpandHeight();
            }),

            bus.on(GanttIncomingEvents.SCROLL_TO_TODAY, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                scrollToToday(gantt);
            }),

            bus.on(GanttIncomingEvents.SCROLL_TO_TASK, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                const data = event.payload as ScrollToTaskData | undefined;
                if (data?.taskId) {
                    scrollToTask(gantt, data.taskId);
                }
            }),

            bus.on(GanttIncomingEvents.FIT_TIMELINE, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                fitTimeline(gantt);
            }),

            bus.on(GanttIncomingEvents.SET_START_DATE, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                const data = event.payload as SetDateData | undefined;
                if (data?.date) {
                    store.setTimelineStart(new Date(data.date));
                }
            }),

            bus.on(GanttIncomingEvents.SET_END_DATE, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                const data = event.payload as SetDateData | undefined;
                if (data?.date) {
                    store.setTimelineEnd(new Date(data.date));
                }
            }),

            bus.on(GanttIncomingEvents.SHOW_GRID, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                store.setShowGrid(true);
            }),

            bus.on(GanttIncomingEvents.HIDE_GRID, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                store.setShowGrid(false);
            }),

            bus.on(GanttIncomingEvents.SHOW_TIMELINE, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                store.setShowTimeline(true);
            }),

            bus.on(GanttIncomingEvents.HIDE_TIMELINE, event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                store.setShowTimeline(false);
            }),

            bus.on(GanttIncomingEvents.EXPORT_PDF, async event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                await exportService.exportPdf({ name: "gantt.pdf" });
            }),

            bus.on(GanttIncomingEvents.EXPORT_PNG, async event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                await exportService.exportPng({ name: "gantt.png" });
            }),

            bus.on(GanttIncomingEvents.EXPORT_EXCEL, async event => {
                if (!matchesWidget(event, widgetId)) {
                    return;
                }
                await exportService.exportExcel({ name: "gantt.xlsx" });
            })
        ];

        const zoomEvents = [
            GanttIncomingEvents.ZOOM_DAY,
            GanttIncomingEvents.ZOOM_WEEK,
            GanttIncomingEvents.ZOOM_MONTH
        ];

        for (const zoomEvent of zoomEvents) {
            unsubscribers.push(
                bus.on(zoomEvent, event => {
                    if (!matchesWidget(event, widgetId)) {
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
        });

        return () => {
            for (const unsubscribe of unsubscribers) {
                unsubscribe();
            }
            removeFullscreenListener();
        };
    }, [store, widgetId, containerRef, exportService, fullscreenService, isPreview]);
}
