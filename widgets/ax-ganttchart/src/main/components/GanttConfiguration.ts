/** @deprecated Import from `gantt/` modules directly. Barrel kept for existing imports. */
export { gantt } from "../../gantt/ganttInstance";
export type { GanttDisplayConfig } from "../../gantt/ganttInit";
export { initGantt, setupTodayMarkerSync, setupMtoMarkerSync } from "../../gantt/ganttInit";
export { applyEditingConfig } from "../../gantt/ganttEditing";
export {
    attachNativeEvents,
    attachTaskInteractionDelegation,
    attachAddButtonDelegation,
    type GanttNativeEventHandlers,
    type TaskInteractionHandlers
} from "../../gantt/ganttDomEvents";
export {
    resolveGanttShellHeight,
    resolveGanttContainerHeight,
    scheduleGanttLayoutRefresh,
    installGanttLayoutSync,
    updateLayout,
    resetGantt,
    GANTT_TOOLBAR_HEIGHT,
    GANTT_MIN_CONTAINER_HEIGHT
} from "../../gantt/ganttLayout";
export { getGanttConfigSnapshot } from "../../shared/constants/ganttConfig";

/** @deprecated Use resetGantt */
export { resetGantt as destroyGantt } from "../../gantt/ganttLayout";
