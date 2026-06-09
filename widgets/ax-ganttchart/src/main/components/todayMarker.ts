import type { GanttStatic } from "dhtmlx-gantt";
import { MOCK_TIMELINE_END, MOCK_TIMELINE_START } from "./TimelineManager";

export const TODAY_MARKER_ID = "ax-gantt-today-marker";
const MARKER_AREA_CLASS = "gantt_marker_area";

type GanttWithDom = GanttStatic & { $task_data?: HTMLElement };

function getTodayDate(): Date {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return today;
}

function isTodayInConfigRange(gantt: GanttStatic): boolean {
    const today = getTodayDate().getTime();
    const start = gantt.config.start_date?.getTime() ?? MOCK_TIMELINE_START.getTime();
    const end = gantt.config.end_date?.getTime() ?? MOCK_TIMELINE_END.getTime();
    return today >= start && today <= end;
}

function isTodayInVisibleRange(gantt: GanttStatic): boolean {
    const today = getTodayDate().getTime();
    const state = gantt.getState?.();

    if (!state?.min_date || !state?.max_date) {
        return true;
    }

    return today >= state.min_date.getTime() && today <= state.max_date.getTime();
}

function getMarkerHeight(gantt: GanttStatic): number {
    const visibleCount = gantt.getVisibleTaskCount?.() ?? 0;
    if (visibleCount > 0) {
        return Math.max(gantt.getRowTop(visibleCount), 0);
    }

    const taskData = (gantt as GanttWithDom).$task_data;
    return taskData?.scrollHeight ?? 0;
}

function ensureMarkerArea(gantt: GanttStatic): HTMLElement | null {
    const taskData = (gantt as GanttWithDom).$task_data;
    if (!taskData) {
        return null;
    }

    let area = taskData.querySelector<HTMLElement>(`.${MARKER_AREA_CLASS}`);
    if (!area) {
        area = document.createElement("div");
        area.className = MARKER_AREA_CLASS;
        taskData.appendChild(area);
    }

    return area;
}

function removeTodayMarkerElement(gantt: GanttStatic): void {
    const taskData = (gantt as GanttWithDom).$task_data;
    taskData?.querySelector(`#${TODAY_MARKER_ID}`)?.remove();
}

function renderTodayMarker(gantt: GanttStatic): void {
    if (!isTodayInConfigRange(gantt) || !isTodayInVisibleRange(gantt)) {
        removeTodayMarkerElement(gantt);
        return;
    }

    const area = ensureMarkerArea(gantt);
    if (!area) {
        return;
    }

    const height = getMarkerHeight(gantt);
    if (height <= 0) {
        return;
    }

    const left = gantt.posFromDate(getTodayDate());
    let marker = area.querySelector<HTMLElement>(`#${TODAY_MARKER_ID}`);

    if (!marker) {
        marker = document.createElement("div");
        marker.id = TODAY_MARKER_ID;
        marker.className = "gantt_marker today";
        marker.title = "Today";
        marker.innerHTML = "<div class='gantt_marker_content'>Today</div>";
        area.appendChild(marker);
    }

    marker.style.left = `${left}px`;
    marker.style.height = `${height}px`;
}

export function syncTodayMarker(gantt: GanttStatic, enabled: boolean): void {
    if (!enabled) {
        removeTodayMarkerElement(gantt);
        return;
    }

    renderTodayMarker(gantt);
}

export function scheduleTodayMarkerRefresh(gantt: GanttStatic, enabled: boolean): void {
    requestAnimationFrame(() => {
        syncTodayMarker(gantt, enabled);
    });
}

export function installTodayMarkerSync(gantt: GanttStatic, getEnabled: () => boolean): () => void {
    const eventIds: string[] = [];
    const refresh = (): void => {
        syncTodayMarker(gantt, getEnabled());
    };

    for (const eventName of ["onGanttRender", "onDataRender", "onGanttScroll"] as const) {
        eventIds.push(gantt.attachEvent(eventName, refresh));
    }

    scheduleTodayMarkerRefresh(gantt, getEnabled());

    return () => {
        for (const eventId of eventIds) {
            gantt.detachEvent(eventId);
        }
        removeTodayMarkerElement(gantt);
    };
}
