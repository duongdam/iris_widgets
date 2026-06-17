import { type GanttStore, createGanttStore } from "./GanttStore";
import { TimelineViewMode } from "../main/eventbus/eventTypes";

export class RootStore {
    readonly gantt: GanttStore;

    constructor(defaultViewMode: TimelineViewMode = TimelineViewMode.MONTH) {
        this.gantt = createGanttStore(defaultViewMode);
    }
}

export function createRootStore(defaultViewMode?: TimelineViewMode): RootStore {
    return new RootStore(defaultViewMode);
}
