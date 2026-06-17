import type { GanttStatic } from "dhtmlx-gantt";
import type { GanttTask } from "../eventbus/eventTypes";
import {
    computeMtoDate,
    getEventTypeTag,
    parseGanttDate,
    shouldShowTimelineEventBar
} from "../../shared/utils/mtoDate";
import {
    GANTT_BAR_HEIGHT,
    GANTT_ROW_HEIGHT,
    resolveBarTopOffset as computeBarTopOffset
} from "../../shared/constants/ganttLayout";

const MTO_MARKER_LAYER_CLASS = "gantt-mto-marker-layer";
const MARKER_WIDTH = 12;
/** Negative value pulls the marker up toward the task bar. */
const MARKER_OFFSET_FROM_BAR_BOTTOM = -5;

function resolveBarHeight(gantt: GanttStatic): number {
    const barHeight = gantt.config.bar_height ?? GANTT_BAR_HEIGHT;
    return typeof barHeight === "number" ? barHeight : GANTT_BAR_HEIGHT;
}

function getBarTopOffset(gantt: GanttStatic): number {
    const rowHeightRaw = gantt.config.row_height ?? GANTT_ROW_HEIGHT;
    const rowHeight = typeof rowHeightRaw === "number" ? rowHeightRaw : GANTT_ROW_HEIGHT;
    return computeBarTopOffset(rowHeight, resolveBarHeight(gantt));
}

function resolveMarkerTop(gantt: GanttStatic, rowTop: number): number {
    const barHeight = resolveBarHeight(gantt);
    return rowTop + getBarTopOffset(gantt) + barHeight + MARKER_OFFSET_FROM_BAR_BOTTOM;
}

type GanttWithDom = GanttStatic & { $task_data?: HTMLElement };

function resolveMtoDate(task: GanttTask): Date | null {
    const raw = task.mto_date ?? computeMtoDate(task);
    return parseGanttDate(raw);
}

function shouldRenderMarker(task: GanttTask): boolean {
    return getEventTypeTag(task.tags) !== undefined && resolveMtoDate(task) !== null;
}

function renderMarkerShape(): string {
    // Tip at top (points up toward the milestone date); flat base at bottom.
    return (
        '<svg class="gantt-mto-marker__shape" width="12" height="9" viewBox="0 0 12 9" aria-hidden="true">' +
        '<path d="M6 0.8 L11.2 8.4 Q11.8 8.8 11.1 8.8 H0.9 Q0.2 8.8 0.8 8.4 Z" />' +
        "</svg>"
    );
}

function renderMtoMarkers(gantt: GanttStatic): void {
    const taskData = (gantt as GanttWithDom).$task_data;
    if (!taskData) {
        return;
    }

    let layer = taskData.querySelector<HTMLElement>(`.${MTO_MARKER_LAYER_CLASS}`);
    if (!layer) {
        layer = document.createElement("div");
        layer.className = MTO_MARKER_LAYER_CLASS;
        taskData.appendChild(layer);
    }

    layer.replaceChildren();

    gantt.eachTask((task: GanttTask & { $level?: number }) => {
        if (!shouldShowTimelineEventBar(task.$level) || !shouldRenderMarker(task)) {
            return;
        }

        const mtoDate = resolveMtoDate(task);
        const eventType = getEventTypeTag(task.tags);
        if (!mtoDate || !eventType) {
            return;
        }

        const rowTop = gantt.getTaskTop(task.id);
        const left = gantt.posFromDate(mtoDate);
        const marker = document.createElement("div");
        marker.className = `gantt-mto-marker gantt-mto-marker--${eventType === "MTO" ? "mto" : "ko"}`;
        marker.style.top = `${resolveMarkerTop(gantt, rowTop)}px`;
        marker.style.left = `${left - MARKER_WIDTH / 2}px`;
        marker.title = `${eventType} · ${mtoDate.toLocaleDateString()}`;
        marker.innerHTML = renderMarkerShape();
        layer.appendChild(marker);
    });
}

export function syncMtoMarkers(gantt: GanttStatic): void {
    renderMtoMarkers(gantt);
}

export function scheduleMtoMarkerRefresh(gantt: GanttStatic): void {
    requestAnimationFrame(() => {
        syncMtoMarkers(gantt);
    });
}

export function installMtoMarkerSync(gantt: GanttStatic): () => void {
    const eventIds: string[] = [];
    const refresh = (): void => {
        syncMtoMarkers(gantt);
    };

    for (const eventName of ["onGanttRender", "onDataRender", "onGanttScroll"] as const) {
        eventIds.push(gantt.attachEvent(eventName, refresh));
    }

    scheduleMtoMarkerRefresh(gantt);

    return () => {
        for (const eventId of eventIds) {
            gantt.detachEvent(eventId);
        }

        const taskData = (gantt as GanttWithDom).$task_data;
        taskData?.querySelector(`.${MTO_MARKER_LAYER_CLASS}`)?.remove();
    };
}
