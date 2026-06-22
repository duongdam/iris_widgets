let previousHoverRow: HTMLElement | null = null;
let previousHoverCells: HTMLElement[] = [];

export function clearCrossHighlight(): void {
    previousHoverRow?.classList.remove("gantt-cross-hover-row");
    for (const cell of previousHoverCells) {
        cell.classList.remove("gantt-cross-hover-col");
    }
    previousHoverRow = null;
    previousHoverCells = [];
}

export function applyCrossHighlight(taskId: string): void {
    clearCrossHighlight();

    const row = document.querySelector(`[task_id="${taskId}"]`) as HTMLElement | null;
    if (row) {
        row.classList.add("gantt-cross-hover-row");
        previousHoverRow = row;
    }

    const cells = Array.from(
        document.querySelectorAll(`.gantt_task_row[task_id="${taskId}"] .gantt_task_cell`)
    ) as HTMLElement[];

    for (const cell of cells) {
        cell.classList.add("gantt-cross-hover-col");
    }
    previousHoverCells = cells;
}
