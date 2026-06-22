import type { GanttStatic } from "dhtmlx-gantt";
import { gantt } from "./ganttInstance";

/** Toolbar row height subtracted from widget height for the gantt container. */
export const GANTT_TOOLBAR_HEIGHT = 41;
export const GANTT_MIN_CONTAINER_HEIGHT = 120;

export function resolveGanttShellHeight(height: number, expandHeight: boolean): number | string {
    return expandHeight ? "100vh" : `${height}px`;
}

export function resolveGanttContainerHeight(
    height: number,
    expandHeight: boolean,
    showToolbar: boolean
): number | string {
    const toolbarOffset = showToolbar ? GANTT_TOOLBAR_HEIGHT : 0;

    if (expandHeight) {
        return `calc(100vh - ${toolbarOffset}px)`;
    }

    return Math.max(height - toolbarOffset, GANTT_MIN_CONTAINER_HEIGHT);
}

export function scheduleGanttLayoutRefresh(target: GanttStatic = gantt): void {
    requestAnimationFrame(() => {
        target.render();
    });
}

export function installGanttLayoutSync(container: HTMLElement, target: GanttStatic = gantt): () => void {
    const refresh = (): void => {
        scheduleGanttLayoutRefresh(target);
    };

    refresh();

    if (typeof ResizeObserver === "undefined") {
        return () => undefined;
    }

    const observer = new ResizeObserver(refresh);
    observer.observe(container);
    return () => observer.disconnect();
}

export function updateLayout(
    display: { showGrid: boolean; showTimeline: boolean },
    target: GanttStatic = gantt
): void {
    target.config.show_grid = display.showGrid;
    target.config.show_chart = display.showTimeline;
    target.render();
}

/**
 * Soft-reset the gantt instance for React remounts.
 * Do NOT call destructor() on the module singleton.
 */
export function resetGantt(target: GanttStatic = gantt): void {
    if ((target as GanttStatic & { $destroyed?: boolean }).$destroyed) {
        return;
    }

    (target as GanttStatic & { __axTooltipTeardown?: () => void }).__axTooltipTeardown?.();
    (target as GanttStatic & { __axTooltipTeardown?: () => void }).__axTooltipTeardown = undefined;

    try {
        target.clearAll();
    } catch {
        // Instance may not be initialized yet.
    }

    if (target.$root) {
        target.$root.innerHTML = "";
    }
}
