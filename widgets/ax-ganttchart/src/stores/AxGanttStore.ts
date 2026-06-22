import { makeAutoObservable } from "mobx";
import type { AxGanttTask } from "../shared/types/axGanttTask";
import { TimelineViewMode } from "../shared/types/timelineViewMode";
import { getDefaultTimelineEnd, getDefaultTimelineStart } from "../main/components/TimelineManager";

export { TimelineViewMode };

let nextStoreInstanceId = 1;

export class AxGanttStore {
    readonly instanceId = nextStoreInstanceId++;
    tasks: AxGanttTask[] = [];
    selectedTask?: AxGanttTask;
    viewMode: TimelineViewMode = TimelineViewMode.MONTH;
    fullscreen = false;
    expandHeight = false;
    gridReorderMode = false;
    expandLevel = 0;
    loading = false;
    showGrid = true;
    showTimeline = true;
    hoveredTaskId?: string;
    timelineStart: Date = getDefaultTimelineStart();
    timelineEnd: Date = getDefaultTimelineEnd();
    dragStartDates = new Map<string, Date>();

    constructor(defaultViewMode: TimelineViewMode = TimelineViewMode.MONTH) {
        this.viewMode = defaultViewMode;
        makeAutoObservable(this, { dragStartDates: false });
    }

    get taskById(): Map<string, AxGanttTask> {
        return new Map(this.tasks.map(task => [task.id, task]));
    }

    get hasTasks(): boolean {
        return this.tasks.length > 0;
    }

    getTask(id: string): AxGanttTask | undefined {
        return this.tasks.find(task => task.id === id);
    }

    get rootTasks(): AxGanttTask[] {
        return this.tasks.filter(task => !task.parent || task.parent === "0");
    }

    setTasks(tasks: AxGanttTask[]): void {
        this.tasks = cloneTasksForStore(tasks);
    }

    setTasksIfChanged(tasks: AxGanttTask[]): void {
        const nextTasks = cloneTasksForStore(tasks);
        if (!areTasksEqual(this.tasks, nextTasks)) {
            this.tasks = nextTasks;
        }
    }

    selectTask(task: AxGanttTask | undefined): void {
        this.selectedTask = task ? cloneTaskForStore(task) : undefined;
    }

    setViewMode(mode: TimelineViewMode): void {
        this.viewMode = mode;
    }

    setFullscreen(value: boolean): void {
        this.fullscreen = value;
    }

    setExpandHeight(value: boolean): void {
        this.expandHeight = value;
    }

    toggleExpandHeight(): void {
        this.expandHeight = !this.expandHeight;
    }

    setGridReorderMode(value: boolean): void {
        this.gridReorderMode = value;
    }

    toggleGridReorderMode(): void {
        this.gridReorderMode = !this.gridReorderMode;
    }

    updateTaskParent(taskId: string, parentId: string | undefined): void {
        this.tasks = this.tasks.map(task => (task.id === taskId ? { ...task, parent: parentId } : task));
    }

    updateTaskFromTimeline(task: AxGanttTask): void {
        const index = this.tasks.findIndex(item => item.id === task.id);
        if (index < 0) {
            return;
        }

        const next = [...this.tasks];
        next[index] = cloneTaskForStore(task);
        this.tasks = next;
    }

    setExpandLevel(level: number): void {
        this.expandLevel = level;
    }

    resetExpandLevel(): void {
        this.expandLevel = 0;
    }

    setLoading(value: boolean): void {
        this.loading = value;
    }

    setShowGrid(value: boolean): void {
        this.showGrid = value;
    }

    setShowTimeline(value: boolean): void {
        this.showTimeline = value;
    }

    setHoveredTaskId(id: string | undefined): void {
        this.hoveredTaskId = id;
    }

    setTimelineStart(date: Date): void {
        this.timelineStart = date;
    }

    setTimelineEnd(date: Date): void {
        this.timelineEnd = date;
    }

    setTimelineRange(start: Date, end: Date): void {
        this.timelineStart = start;
        this.timelineEnd = end;
    }

    snapshotDragStart(id: string, date: Date): void {
        this.dragStartDates.set(id, new Date(date.getTime()));
    }

    clearDragSnapshot(id: string): void {
        this.dragStartDates.delete(id);
    }

    getDragStartDate(id: string): Date | undefined {
        return this.dragStartDates.get(id);
    }
}

export function createAxGanttStore(defaultViewMode?: TimelineViewMode): AxGanttStore {
    return new AxGanttStore(defaultViewMode);
}

/** @deprecated Use createAxGanttStore */
export const createGanttStore = createAxGanttStore;

/** @deprecated Use AxGanttStore */
export type GanttStore = AxGanttStore;

function cloneTaskForStore(task: AxGanttTask): AxGanttTask {
    return {
        ...task,
        metadata: task.metadata ? { ...task.metadata } : undefined
    };
}

function cloneTasksForStore(tasks: AxGanttTask[]): AxGanttTask[] {
    return tasks.map(cloneTaskForStore);
}

function areTasksEqual(a: AxGanttTask[], b: AxGanttTask[]): boolean {
    if (a.length !== b.length) {
        return false;
    }

    for (let index = 0; index < a.length; index += 1) {
        if (JSON.stringify(a[index]) !== JSON.stringify(b[index])) {
            return false;
        }
    }

    return true;
}
