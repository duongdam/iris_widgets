import type { GanttStatic } from "dhtmlx-gantt";
import {
    GANTT_BAR_HEIGHT,
    GANTT_CELL_SIZE,
    GANTT_ROW_HEIGHT,
    GANTT_SCALE_HEIGHT
} from "./ganttLayout";

/**
 * Complete `gantt.config` property keys from DHTMLX Gantt v9.1.4.
 * @see https://docs.dhtmlx.com/gantt/api/overview/properties-overview/
 */
export const GANTT_CONFIG_PROPERTY_KEYS = [
    "auto_scheduling",
    "auto_scheduling_compatibility",
    "auto_scheduling_descendant_links",
    "auto_scheduling_initial",
    "auto_scheduling_move_projects",
    "auto_scheduling_project_constraint",
    "auto_scheduling_strict",
    "auto_scheduling_use_progress",
    "auto_types",
    "autofit",
    "autoscroll",
    "autoscroll_speed",
    "autosize",
    "autosize_min_width",
    "bar_height",
    "bar_height_padding",
    "baselines",
    "branch_loading",
    "branch_loading_property",
    "buttons_left",
    "buttons_right",
    "calendar_property",
    "cascade_delete",
    "click_drag",
    "columns",
    "constraint_types",
    "container_resize_method",
    "container_resize_timeout",
    "correct_work_time",
    "csp",
    "date_format",
    "date_grid",
    "date_scale",
    "deadlines",
    "deepcopy_on_parse",
    "details_on_create",
    "details_on_dblclick",
    "drag_lightbox",
    "drag_links",
    "drag_mode",
    "drag_move",
    "drag_multiple",
    "drag_progress",
    "drag_project",
    "drag_resize",
    "drag_timeline",
    "duration_step",
    "duration_unit",
    "dynamic_resource_calendars",
    "editable_property",
    "editor_types",
    "end_date",
    "external_render",
    "fit_tasks",
    "grid_elastic_columns",
    "grid_resize",
    "grid_resizer_attribute",
    "grid_resizer_column_attribute",
    "grid_width",
    "highlight_critical_path",
    "horizontal_scroll_key",
    "inherit_calendar",
    "inherit_scale_class",
    "initial_scroll",
    "inline_editors_date_processing",
    "inline_editors_multiselect_open",
    "keep_grid_width",
    "keyboard_navigation",
    "keyboard_navigation_cells",
    "layer_attribute",
    "layout",
    "lightbox",
    "lightbox_additional_height",
    "link_arrow_size",
    "link_attribute",
    "link_line_width",
    "link_radius",
    "link_wrapper_width",
    "links",
    "min_column_width",
    "min_duration",
    "min_grid_column_width",
    "min_task_grid_row_height",
    "multiselect",
    "multiselect_one_level",
    "open_split_tasks",
    "open_tree_initially",
    "order_branch",
    "order_branch_free",
    "placeholder_task",
    "preserve_scroll",
    "prevent_default_scroll",
    "process_resource_assignments",
    "project_end",
    "project_start",
    "quick_info_detached",
    "quickinfo_buttons",
    "readonly",
    "readonly_property",
    "redo",
    "reorder_grid_columns",
    "resize_rows",
    "resource_assignment_store",
    "resource_attribute",
    "resource_calendars",
    "resource_property",
    "resource_render_empty_cells",
    "resource_store",
    "resources",
    "root_id",
    "round_dnd_dates",
    "row_height",
    "rtl",
    "scale_height",
    "scale_offset_minimal",
    "scale_unit",
    "scales",
    "schedule_from_end",
    "scroll_on_click",
    "scroll_size",
    "select_task",
    "server_utc",
    "show_chart",
    "show_empty_state",
    "show_errors",
    "show_grid",
    "show_links",
    "show_markers",
    "show_progress",
    "show_quick_info",
    "show_task_cells",
    "show_tasks_outside_timescale",
    "show_unscheduled",
    "skip_off_time",
    "smart_rendering",
    "smart_scales",
    "sort",
    "start_date",
    "start_on_monday",
    "static_background",
    "static_background_cells",
    "step",
    "task_attribute",
    "task_date",
    "task_grid_row_resizer_attribute",
    "task_height",
    "task_scroll_offset",
    "time_picker",
    "time_step",
    "timeline_placeholder",
    "tooltip_hide_timeout",
    "tooltip_offset_x",
    "tooltip_offset_y",
    "tooltip_timeout",
    "touch",
    "touch_drag",
    "touch_feedback",
    "touch_feedback_duration",
    "type_renderers",
    "types",
    "undo",
    "undo_actions",
    "undo_steps",
    "undo_types",
    "wai_aria_attributes",
    "wheel_scroll_sensitivity",
    "wide_form",
    "work_time",
    "xml_date"
] as const;

export type GanttConfigPropertyKey = (typeof GANTT_CONFIG_PROPERTY_KEYS)[number];

/** Keys set by `applyEditingConfig`. */
export const GANTT_EDITING_CONFIG_KEYS = [
    "readonly",
    "drag_move",
    "drag_resize",
    "drag_progress",
    "details_on_create",
    "details_on_dblclick"
] as const;

/**
 * Ax Gantt recommended overrides applied on init.
 * Other keys keep DHTMLX library defaults until overridden via `customConfig`.
 */
export const GANTT_AX_CONFIG: Record<string, unknown> = {
    date_format: "%Y-%m-%d %H:%i",
    xml_date: "%Y-%m-%d %H:%i",
    smart_rendering: true,
    smart_scales: true,
    branch_loading: true,
    scroll_on_click: false,
    autosize: false,
    fit_tasks: false,
    start_on_monday: true,
    show_links: false,
    drag_links: false,
    show_unscheduled: false,
    show_quick_info: false,
    details_on_dblclick: false,
    details_on_create: false,
    preserve_scroll: true,
    show_markers: true,
    select_task: true,
    multiselect: false,
    open_tree_initially: false,
    keyboard_navigation: false,
    highlight_critical_path: false,
    baselines: false,
    auto_scheduling: false,
    row_height: GANTT_ROW_HEIGHT,
    bar_height: GANTT_BAR_HEIGHT,
    scale_height: GANTT_SCALE_HEIGHT,
    min_column_width: GANTT_CELL_SIZE
};

export interface GanttInitDisplayOptions {
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    taskCount?: number;
    /** Extra DHTMLX config overrides — merged last. */
    customConfig?: Record<string, unknown>;
}

export function buildGanttInitConfig(display: GanttInitDisplayOptions): Record<string, unknown> {
    const config: Record<string, unknown> = {
        ...GANTT_AX_CONFIG,
        show_progress: display.showProgress,
        show_grid: display.showGrid,
        show_chart: display.showTimeline
    };

    if ((display.taskCount ?? 0) > 500) {
        config.show_task_cells = false;
    }

    if (display.customConfig) {
        Object.assign(config, display.customConfig);
    }

    return config;
}

export function applyGanttConfig(target: GanttStatic, config: Record<string, unknown>): void {
    Object.assign(target.config, config);
}

/** Read config values for all known DHTMLX property keys from a gantt instance. */
export function getGanttConfigSnapshot(
    target: GanttStatic,
    keys: readonly string[] = GANTT_CONFIG_PROPERTY_KEYS
): Record<string, unknown> {
    const snapshot: Record<string, unknown> = {};

    for (const key of keys) {
        snapshot[key] = target.config[key as keyof typeof target.config];
    }

    for (const key of GANTT_EDITING_CONFIG_KEYS) {
        snapshot[key] = target.config[key as keyof typeof target.config];
    }

    return snapshot;
}
