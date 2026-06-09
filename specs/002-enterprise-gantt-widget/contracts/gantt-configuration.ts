/**
 * Contract: GanttConfiguration — DHTMLX initialization and plugin setup.
 */

import type { GanttInstance } from "./timeline-manager";

export interface GanttDisplayConfig {
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    rowHeight?: number;
    barHeight?: number;
}

export interface GanttConfigurationOptions {
    container: HTMLElement;
    display: GanttDisplayConfig;
    exportServerUrl?: string;
    locale?: string;
}

export interface GanttConfiguration {
    /** One-time init; returns gantt instance bound to container */
    init(options: GanttConfigurationOptions): GanttInstance;

    /** Enable required plugins */
    enablePlugins(gantt: GanttInstance): void;

    /** Attach DHTMLX native event handlers */
    attachNativeEvents(
        gantt: GanttInstance,
        handlers: GanttNativeEventHandlers
    ): () => void;
}

export interface GanttNativeEventHandlers {
    onTaskClick?: (id: string, event: Event) => boolean | void;
    onTaskDblClick?: (id: string, event: Event) => boolean | void;
    onAfterTaskUpdate?: (id: string, task: unknown) => void;
    onAfterTaskAdd?: (id: string, task: unknown) => void;
    onAfterTaskDelete?: (id: string) => void;
    onMouseMove?: (id: string, event: Event) => void;
}
