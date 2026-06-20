/** Square timeline cells — width and row height use the same value. */
export const GANTT_CELL_SIZE = 24;
export const GANTT_ROW_HEIGHT = GANTT_CELL_SIZE;
export const GANTT_BAR_HEIGHT = 16;
export const GANTT_SCALE_ROW_COUNT = 2;
export const GANTT_SCALE_ROW_HEIGHT = GANTT_CELL_SIZE;
export const GANTT_SCALE_HEIGHT = GANTT_SCALE_ROW_HEIGHT * GANTT_SCALE_ROW_COUNT;

export function resolveBarTopOffset(rowHeight: number, barHeight: number): number {
    return Math.max(0, Math.round((rowHeight - barHeight) / 2));
}

export function applyGanttLayoutConfig(target: { config: Record<string, unknown> }): void {
    target.config.row_height = GANTT_ROW_HEIGHT;
    target.config.bar_height = GANTT_BAR_HEIGHT;
    target.config.scale_height = GANTT_SCALE_HEIGHT;
    target.config.min_column_width = GANTT_CELL_SIZE;
    target.config.column_width = GANTT_CELL_SIZE;
}
