import type { GanttTask } from "../main/eventbus/eventTypes";
import { computeEventDatesFromMilestone, normalizeGanttTasks } from "../shared/utils/mtoDate";

export const PREVIEW_HEIGHT = 600;
export const PREVIEW_VIEW_MODE = "month" as const;

/**
 * 3-level hierarchy: Program → Phase → Task
 * Leaf MTO events span ±10 months from milestone; K/O spans +20 months from milestone.
 */
export const MOCK_GANTT_TASKS: GanttTask[] = normalizeGanttTasks([
    // ── Level 1: Program ──────────────────────────────────────────────────────
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

    // ── Level 2: Phase A ──────────────────────────────────────────────────────
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
    {
        id: "2-1",
        text: "Stakeholder workshops",
        parent: "2",
        mto_date: "2026-03-15 00:00",
        progress: 1,
        tags: ["MTO", "Manual"]
    },
    {
        id: "2-2",
        text: "Business process mapping",
        parent: "2",
        mto_date: "2026-04-01 00:00",
        progress: 1,
        tags: ["K/O", "Process"]
    },
    {
        id: "2-3",
        text: "Solution design",
        parent: "2",
        mto_date: "2026-04-20 00:00",
        progress: 0.8,
        tags: ["MTO"]
    },
    {
        id: "2-4",
        text: "Architecture review board",
        parent: "2",
        mto_date: "2026-05-10 00:00",
        progress: 0.6,
        tags: ["K/O"]
    },
    {
        id: "2-5",
        text: "Sign-off & baseline",
        parent: "2",
        mto_date: "2026-06-01 00:00",
        progress: 0.4,
        tags: ["MTO"]
    },
    {
        id: "m1",
        text: "Design Sign-off",
        parent: "2",
        type: "milestone",
        start_date: "2026-06-30 00:00",
        duration: 0,
        progress: 0
    },

    // ── Level 2: Phase B ──────────────────────────────────────────────────────
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
    {
        id: "3-1",
        text: "API gateway setup",
        parent: "3",
        mto_date: "2026-08-01 00:00",
        progress: 1,
        tags: ["MTO"]
    },
    {
        id: "3-2",
        text: "Data model migration",
        parent: "3",
        mto_date: "2026-09-01 00:00",
        progress: 0.9,
        tags: ["K/O", "Manual"]
    },
    {
        id: "3-3",
        text: "Gantt widget development",
        parent: "3",
        mto_date: "2026-10-15 00:00",
        progress: 0.7,
        tags: ["MTO", "Manual"]
    },
    {
        id: "3-4",
        text: "Report & chart widgets",
        parent: "3",
        mto_date: "2026-11-20 00:00",
        progress: 0.4,
        tags: ["K/O"]
    },
    {
        id: "3-5",
        text: "Integration & E2E flow",
        parent: "3",
        mto_date: "2027-01-15 00:00",
        progress: 0.2,
        tags: ["MTO"]
    },
    {
        id: "m2",
        text: "Core Build Complete",
        parent: "3",
        type: "milestone",
        start_date: "2027-03-31 00:00",
        duration: 0,
        progress: 0
    },

    // ── Level 2: Phase C ──────────────────────────────────────────────────────
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
    {
        id: "4-1",
        text: "System integration test",
        parent: "4",
        mto_date: "2027-05-01 00:00",
        progress: 0.2,
        tags: ["MTO", "Process"]
    },
    {
        id: "4-2",
        text: "UAT & bug-fix sprint",
        parent: "4",
        mto_date: "2027-06-15 00:00",
        progress: 0,
        tags: ["K/O"]
    },
    {
        id: "4-3",
        text: "Production cutover",
        parent: "4",
        mto_date: "2027-08-01 00:00",
        progress: 0,
        tags: ["MTO"]
    },
    {
        id: "4-4",
        text: "User training & handover",
        parent: "4",
        mto_date: "2027-10-01 00:00",
        progress: 0,
        tags: ["K/O"]
    },
    {
        id: "m3",
        text: "Go-Live",
        parent: "1",
        type: "milestone",
        start_date: "2027-12-31 00:00",
        duration: 0,
        progress: 0
    }
] as GanttTask[]);

export function generateLargeMockTasks(count: number): GanttTask[] {
    const tasks: GanttTask[] = [];
    const rangeStart = new Date(2026, 0, 1).getTime();
    const rangeEnd = new Date(2028, 11, 31).getTime();
    const rangeMs = rangeEnd - rangeStart;

    for (let i = 0; i < count; i += 1) {
        const offset = Math.floor((i / Math.max(count - 1, 1)) * rangeMs);
        const milestone = new Date(rangeStart + offset);
        const eventType = i % 2 === 0 ? "MTO" : "K/O";
        const span = computeEventDatesFromMilestone(milestone, eventType);

        const task: GanttTask = {
            id: `task-${i + 1}`,
            text: `Project ${i + 1}`,
            start_date: span.start_date!,
            end_date: span.end_date,
            mto_date: span.mto_date,
            progress: (i % 10) / 10,
            parent: i % 20 === 0 ? undefined : `task-${Math.floor(i / 20) * 20 + 1}`,
            open: i % 20 === 0,
            tags: [eventType, ...(i % 7 === 0 ? ["Manual"] : i % 11 === 0 ? ["Process"] : [])]
        };

        tasks.push(task);
    }

    return tasks;
}
