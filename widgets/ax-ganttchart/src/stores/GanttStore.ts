import { makeAutoObservable } from "mobx";
import { type GanttTask, TimelineViewMode } from "../main/eventbus/eventTypes";
import { getDefaultTimelineEnd, getDefaultTimelineStart } from "../main/components/TimelineManager";

export class GanttStore {
    tasks: GanttTask[] = [];
    selectedTask?: GanttTask;
    viewMode: TimelineViewMode = TimelineViewMode.WEEK;
    fullscreen = false;
    loading = false;
    showGrid = true;
    showTimeline = true;
    hoveredTaskId?: string;
    timelineStart: Date = getDefaultTimelineStart();
    timelineEnd: Date = getDefaultTimelineEnd();

    constructor(defaultViewMode: TimelineViewMode = TimelineViewMode.WEEK) {
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
        this.tasks = tasks;
    }

    setTasksIfChanged(tasks: GanttTask[]): void {
        if (!areGanttTasksEqual(this.tasks, tasks)) {
            this.tasks = tasks;
        }
    }

    selectTask(task: GanttTask | undefined): void {
        this.selectedTask = task;
    }

    setViewMode(mode: TimelineViewMode): void {
        this.viewMode = mode;
    }

    setFullscreen(value: boolean): void {
        this.fullscreen = value;
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
