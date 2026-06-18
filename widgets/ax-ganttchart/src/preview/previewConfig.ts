import type { GanttTask } from "../main/eventbus/eventTypes";
import type { GanttEventTypeTag } from "../shared/utils/mtoDate";
import { computePreviewEventSpan } from "./previewEventSpans";

export const PREVIEW_HEIGHT = 600;
export const PREVIEW_VIEW_MODE = "month" as const;

function previewEventTask(input: {
    id: string;
    text: string;
    parent: string;
    mto_date: string;
    eventType: GanttEventTypeTag;
    progress: number;
    extraTags?: string[];
}): GanttTask {
    const milestone = new Date(input.mto_date.replace(" ", "T"));
    const span = computePreviewEventSpan(milestone, input.eventType);

    return {
        id: input.id,
        text: input.text,
        parent: input.parent,
        start_date: span.start_date,
        end_date: span.end_date,
        mto_date: span.mto_date,
        progress: input.progress,
        tags: [input.eventType, ...(input.extraTags ?? [])]
    };
}

/**
 * 3-level hierarchy: Program → Phase → Task.
 * Preview mock data includes explicit start_date, end_date, and mto_date per task.
 */
export const MOCK_GANTT_TASKS: GanttTask[] = [
    {
        id: "1",
        text: "Enterprise Platform Rollout",
        type: "project",
        start_date: "2026-01-01 00:00",
        end_date: "2027-12-31 00:00",
        progress: 0.38,
        open: true,
        tags: ["Process"]
    },
    {
        id: "2",
        text: "Phase A · Discovery & Design",
        parent: "1",
        start_date: "2026-01-01 00:00",
        end_date: "2026-06-30 00:00",
        progress: 0.9,
        open: true,
        tags: ["Process"]
    },
    previewEventTask({
        id: "2-1",
        text: "Stakeholder workshops",
        parent: "2",
        mto_date: "2026-03-15 00:00",
        eventType: "MTO",
        progress: 1,
        extraTags: ["Manual"]
    }),
    previewEventTask({
        id: "2-2",
        text: "Business process mapping",
        parent: "2",
        mto_date: "2026-04-01 00:00",
        eventType: "K/O",
        progress: 1,
        extraTags: ["Process"]
    }),
    previewEventTask({
        id: "2-3",
        text: "Solution design",
        parent: "2",
        mto_date: "2026-04-20 00:00",
        eventType: "MTO",
        progress: 0.8
    }),
    previewEventTask({
        id: "2-4",
        text: "Architecture review board",
        parent: "2",
        mto_date: "2026-05-10 00:00",
        eventType: "K/O",
        progress: 0.6
    }),
    previewEventTask({
        id: "2-5",
        text: "Sign-off & baseline",
        parent: "2",
        mto_date: "2026-06-01 00:00",
        eventType: "MTO",
        progress: 0.4
    }),
    {
        id: "m1",
        text: "Design Sign-off",
        parent: "2",
        type: "milestone",
        start_date: "2026-06-30 00:00",
        end_date: "2026-06-30 00:00",
        duration: 0,
        progress: 0
    },
    {
        id: "3",
        text: "Phase B · Core Build",
        parent: "1",
        start_date: "2026-07-01 00:00",
        end_date: "2027-03-31 00:00",
        progress: 0.45,
        open: true,
        tags: ["Process"]
    },
    previewEventTask({
        id: "3-1",
        text: "API gateway setup",
        parent: "3",
        mto_date: "2026-08-01 00:00",
        eventType: "MTO",
        progress: 1
    }),
    previewEventTask({
        id: "3-2",
        text: "Data model migration",
        parent: "3",
        mto_date: "2026-09-01 00:00",
        eventType: "K/O",
        progress: 0.9,
        extraTags: ["Manual"]
    }),
    previewEventTask({
        id: "3-3",
        text: "Gantt widget development",
        parent: "3",
        mto_date: "2026-10-15 00:00",
        eventType: "MTO",
        progress: 0.7,
        extraTags: ["Manual"]
    }),
    previewEventTask({
        id: "3-4",
        text: "Report & chart widgets",
        parent: "3",
        mto_date: "2026-11-20 00:00",
        eventType: "K/O",
        progress: 0.4
    }),
    previewEventTask({
        id: "3-5",
        text: "Integration & E2E flow",
        parent: "3",
        mto_date: "2027-01-15 00:00",
        eventType: "MTO",
        progress: 0.2
    }),
    {
        id: "m2",
        text: "Core Build Complete",
        parent: "3",
        type: "milestone",
        start_date: "2027-03-31 00:00",
        end_date: "2027-03-31 00:00",
        duration: 0,
        progress: 0
    },
    {
        id: "4",
        text: "Phase C · Testing & Rollout",
        parent: "1",
        start_date: "2027-04-01 00:00",
        end_date: "2027-12-31 00:00",
        progress: 0.05,
        open: true,
        tags: ["Manual"]
    },
    previewEventTask({
        id: "4-1",
        text: "System integration test",
        parent: "4",
        mto_date: "2027-05-01 00:00",
        eventType: "MTO",
        progress: 0.2,
        extraTags: ["Process"]
    }),
    previewEventTask({
        id: "4-2",
        text: "UAT & bug-fix sprint",
        parent: "4",
        mto_date: "2027-06-15 00:00",
        eventType: "K/O",
        progress: 0
    }),
    previewEventTask({
        id: "4-3",
        text: "Production cutover",
        parent: "4",
        mto_date: "2027-08-01 00:00",
        eventType: "MTO",
        progress: 0
    }),
    previewEventTask({
        id: "4-4",
        text: "User training & handover",
        parent: "4",
        mto_date: "2027-10-01 00:00",
        eventType: "K/O",
        progress: 0
    }),
    {
        id: "m3",
        text: "Go-Live",
        parent: "1",
        type: "milestone",
        start_date: "2027-12-31 00:00",
        end_date: "2027-12-31 00:00",
        duration: 0,
        progress: 0
    }
];

export function generateLargeMockTasks(count: number): GanttTask[] {
    const tasks: GanttTask[] = [];
    const rangeStart = new Date(2026, 0, 1).getTime();
    const rangeEnd = new Date(2028, 11, 31).getTime();
    const rangeMs = rangeEnd - rangeStart;

    for (let i = 0; i < count; i += 1) {
        const offset = Math.floor((i / Math.max(count - 1, 1)) * rangeMs);
        const milestone = new Date(rangeStart + offset);
        const eventType: GanttEventTypeTag = i % 2 === 0 ? "MTO" : "K/O";
        const span = computePreviewEventSpan(milestone, eventType);

        tasks.push({
            id: `task-${i + 1}`,
            text: `Project ${i + 1}`,
            start_date: span.start_date,
            end_date: span.end_date,
            mto_date: span.mto_date,
            progress: (i % 10) / 10,
            parent: i % 20 === 0 ? undefined : `task-${Math.floor(i / 20) * 20 + 1}`,
            open: i % 20 === 0,
            tags: [eventType, ...(i % 7 === 0 ? ["Manual"] : i % 11 === 0 ? ["Process"] : [])]
        });
    }

    return tasks;
}
