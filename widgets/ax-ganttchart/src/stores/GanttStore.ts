import { makeAutoObservable } from "mobx";
import { type GanttTask, TimelineViewMode } from "../main/eventbus/eventTypes";
import { getDefaultTimelineEnd, getDefaultTimelineStart } from "../main/components/TimelineManager";

export class GanttStore {
    tasks: GanttTask[] = [];
    selectedTask?: GanttTask;
    viewMode: TimelineViewMode = TimelineViewMode.WEEK;
    fullscreen = false;
    expandHeight = false;
    /** Grid drag mode — move child rows to another parent branch. */
    gridReorderMode = false;
    /** How many hierarchy levels are expanded via toolbar (0 = all branches collapsed). */
    expandLevel = 0;
    loading = false;
    showGrid = true;
    showTimeline = true;
    hoveredTaskId?: string;
    timelineStart: Date = getDefaultTimelineStart();
    timelineEnd: Date = getDefaultTimelineEnd();

    constructor(defaultViewMode: TimelineViewMode = TimelineViewMode.MONTH) {
        this.viewMode = defaultViewMode;
        makeAutoObservable(this);
    }

    get taskById(): Map<string, GanttTask> {
        return new Map(this.tasks.map(task => [task.id, task]));
    }

    get hasTasks(): boolean {
        return this.tasks.length > 0;
    }

    get rootTasks(): GanttTask[] {
        return this.tasks.filter(task => !task.parent || task.parent === "0");
    }

    setTasks(tasks: GanttTask[]): void {
        this.tasks = cloneTasksForStore(tasks);
    }

    setTasksIfChanged(tasks: GanttTask[]): void {
        const nextTasks = cloneTasksForStore(tasks);
        if (!areGanttTasksEqual(this.tasks, nextTasks)) {
            this.tasks = nextTasks;
        }
    }

    selectTask(task: GanttTask | undefined): void {
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
}

export function createGanttStore(defaultViewMode?: TimelineViewMode): GanttStore {
    return new GanttStore(defaultViewMode);
}

function cloneTaskForStore(task: GanttTask): GanttTask {
    return {
        ...task,
        tags: task.tags ? [...task.tags] : undefined,
        metadata: task.metadata ? { ...task.metadata } : undefined
    };
}

function cloneTasksForStore(tasks: GanttTask[]): GanttTask[] {
    return tasks.map(cloneTaskForStore);
}

function areGanttTasksEqual(a: GanttTask[], b: GanttTask[]): boolean {
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
