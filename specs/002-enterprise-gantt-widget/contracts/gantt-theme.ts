/**
 * Contract: GanttThemeTokens — brand color and hierarchy UI rules.
 */

/** Iris brand teal — primary Gantt accent */
export const GANTT_BRAND_COLOR = "#009999";

/** Hover/darken variant for interactive elements */
export const GANTT_BRAND_HOVER = "#007a7a";

/** Muted background for add button */
export const GANTT_BRAND_MUTED = "rgba(0, 153, 153, 0.12)";

/**
 * Hierarchy level (0-indexed DHTMLX `$level`) at which the add (+) button renders.
 * Level 0 = root (e.g. Program), Level 1 = second tier (e.g. Phase) — "cấp 2".
 */
export const GANTT_ADD_BUTTON_LEVEL = 1;

export interface GanttThemeTokens {
    brand: string;
    brandHover: string;
    brandMuted: string;
    taskRegular: string;
    taskProject: string;
    childCountColor: string;
    addButtonLevel: number;
}

export const DEFAULT_GANTT_THEME: GanttThemeTokens = {
    brand: GANTT_BRAND_COLOR,
    brandHover: GANTT_BRAND_HOVER,
    brandMuted: GANTT_BRAND_MUTED,
    taskRegular: GANTT_BRAND_COLOR,
    taskProject: GANTT_BRAND_COLOR,
    childCountColor: GANTT_BRAND_COLOR,
    addButtonLevel: GANTT_ADD_BUTTON_LEVEL,
};
