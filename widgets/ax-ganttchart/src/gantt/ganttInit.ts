import type { GanttStatic } from "dhtmlx-gantt";
import { applyColumns, getDefaultColumns } from "../main/components/ColumnManager";
import { applyTimelineRange, getScales } from "../main/components/TimelineManager";
import { installTodayMarkerSync } from "../main/components/TodayMarker";
import { installMtoMarkerSync } from "../main/components/MtoMarker";
import { TimelineViewMode } from "../events/ganttEvents";
import { applyGanttConfig, buildGanttInitConfig } from "../shared/constants/ganttConfig";
import { applyGanttTemplates } from "./ganttTemplates";
import { enablePlugins, syncDhtmlxTooltip } from "./ganttTooltip";
import { gantt } from "./ganttInstance";

export interface GanttDisplayConfig {
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    viewMode: TimelineViewMode;
    taskCount?: number;
    timelineStart?: Date;
    timelineEnd?: Date;
    useDhtmlxTooltip?: boolean;
    customConfig?: Record<string, unknown>;
}

let linkBlockingEnabled = false;

export function initGantt(container: HTMLElement, display: GanttDisplayConfig): void {
    enablePlugins();
    const teardownTooltip = syncDhtmlxTooltip(!!display.useDhtmlxTooltip);

    applyGanttConfig(gantt, buildGanttInitConfig(display));
    applyGanttTemplates(gantt);
    applyColumns(gantt, getDefaultColumns());
    gantt.config.scales = getScales(display.viewMode) as typeof gantt.config.scales;
    applyTimelineRange(gantt, display.viewMode, display.timelineStart, display.timelineEnd);

    gantt.init(container);
    blockTaskLinking(gantt);

    (gantt as GanttStatic & { __axTooltipTeardown?: () => void }).__axTooltipTeardown?.();
    (gantt as GanttStatic & { __axTooltipTeardown?: () => void }).__axTooltipTeardown = teardownTooltip;
}

function blockTaskLinking(target: GanttStatic): void {
    if (linkBlockingEnabled) {
        return;
    }

    target.attachEvent("onBeforeLinkAdd", () => false);
    target.attachEvent("onBeforeLinkDelete", () => false);
    linkBlockingEnabled = true;
}

export function setupTodayMarkerSync(getEnabled: () => boolean, target: GanttStatic = gantt): () => void {
    return installTodayMarkerSync(target, getEnabled);
}

export function setupMtoMarkerSync(target: GanttStatic = gantt): () => void {
    return installMtoMarkerSync(target);
}
