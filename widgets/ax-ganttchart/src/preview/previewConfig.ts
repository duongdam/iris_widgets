import type { GanttTask } from "../main/eventbus/eventTypes";

export const PREVIEW_HEIGHT = 600;
export const PREVIEW_VIEW_MODE = "week" as const;

/**
 * 4-level hierarchy: Program → Phase → Work Package → Task
 * All leaf tasks ≤ 3 months. Timeline: 2026-01 → 2027-12.
 */
export const MOCK_GANTT_TASKS: GanttTask[] = [
    // ── Level 1: Program ──────────────────────────────────────────────────────
    {
        id: "1",
        text: "Enterprise Platform Rollout",
        type: "project",
        start_date: "2026-01-01 00:00",
        end_date: "2027-12-31 00:00",
        progress: 0.38,
        open: true
    },

    // ── Level 2: Phase A ──────────────────────────────────────────────────────
    {
        id: "2",
        text: "Phase A · Discovery & Design",
        parent: "1",
        start_date: "2026-01-01 00:00",
        end_date: "2026-06-30 00:00",
        progress: 0.9,
        open: true
    },

    // Level 3: Work packages under Phase A
    {
        id: "2-1",
        text: "WP1 · Requirements",
        parent: "2",
        start_date: "2026-01-01 00:00",
        end_date: "2026-03-31 00:00",
        progress: 1,
        open: true
    },
    // Level 4: Tasks under WP1
    {
        id: "2-1-1",
        text: "Stakeholder workshops",
        parent: "2-1",
        start_date: "2026-01-05 00:00",
        end_date: "2026-01-30 00:00",
        progress: 1
    },
    {
        id: "2-1-2",
        text: "Business process mapping",
        parent: "2-1",
        start_date: "2026-02-01 00:00",
        end_date: "2026-02-28 00:00",
        progress: 1
    },
    {
        id: "2-1-3",
        text: "Sign-off & baseline",
        parent: "2-1",
        start_date: "2026-03-01 00:00",
        end_date: "2026-03-31 00:00",
        progress: 1
    },

    {
        id: "2-2",
        text: "WP2 · Architecture",
        parent: "2",
        start_date: "2026-04-01 00:00",
        end_date: "2026-06-30 00:00",
        progress: 0.8,
        open: true
    },
    {
        id: "2-2-1",
        text: "Solution design",
        parent: "2-2",
        start_date: "2026-04-01 00:00",
        end_date: "2026-05-15 00:00",
        progress: 1
    },
    {
        id: "2-2-2",
        text: "Architecture review board",
        parent: "2-2",
        start_date: "2026-05-16 00:00",
        end_date: "2026-06-15 00:00",
        progress: 0.6
    },
    {
        id: "2-2-3",
        text: "Tech spike & PoC",
        parent: "2-2",
        start_date: "2026-06-01 00:00",
        end_date: "2026-06-30 00:00",
        progress: 0.3
    },

    // Milestone: Phase A complete
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
        open: true
    },

    // Level 3: Work packages under Phase B
    {
        id: "3-1",
        text: "WP3 · Backend Services",
        parent: "3",
        start_date: "2026-07-01 00:00",
        end_date: "2026-09-30 00:00",
        progress: 0.9,
        open: true
    },
    {
        id: "3-1-1",
        text: "API gateway setup",
        parent: "3-1",
        start_date: "2026-07-01 00:00",
        end_date: "2026-07-31 00:00",
        progress: 1
    },
    {
        id: "3-1-2",
        text: "Data model migration",
        parent: "3-1",
        start_date: "2026-08-01 00:00",
        end_date: "2026-08-31 00:00",
        progress: 0.9
    },
    {
        id: "3-1-3",
        text: "Core business logic",
        parent: "3-1",
        start_date: "2026-09-01 00:00",
        end_date: "2026-09-30 00:00",
        progress: 0.7
    },

    {
        id: "3-2",
        text: "WP4 · Frontend & Widgets",
        parent: "3",
        start_date: "2026-10-01 00:00",
        end_date: "2026-12-31 00:00",
        progress: 0.5,
        open: true
    },
    {
        id: "3-2-1",
        text: "Gantt widget development",
        parent: "3-2",
        start_date: "2026-10-01 00:00",
        end_date: "2026-10-31 00:00",
        progress: 0.7
    },
    {
        id: "3-2-2",
        text: "Report & chart widgets",
        parent: "3-2",
        start_date: "2026-11-01 00:00",
        end_date: "2026-11-30 00:00",
        progress: 0.4
    },
    {
        id: "3-2-3",
        text: "UI/UX polish & accessibility",
        parent: "3-2",
        start_date: "2026-12-01 00:00",
        end_date: "2026-12-31 00:00",
        progress: 0.1
    },

    {
        id: "3-3",
        text: "WP5 · Integration",
        parent: "3",
        start_date: "2027-01-01 00:00",
        end_date: "2027-03-31 00:00",
        progress: 0.2,
        open: true
    },
    {
        id: "3-3-1",
        text: "3rd-party connector setup",
        parent: "3-3",
        start_date: "2027-01-01 00:00",
        end_date: "2027-01-31 00:00",
        progress: 0.4
    },
    {
        id: "3-3-2",
        text: "End-to-end data flow",
        parent: "3-3",
        start_date: "2027-02-01 00:00",
        end_date: "2027-02-28 00:00",
        progress: 0.1
    },
    {
        id: "3-3-3",
        text: "Performance baseline",
        parent: "3-3",
        start_date: "2027-03-01 00:00",
        end_date: "2027-03-31 00:00",
        progress: 0
    },

    // Milestone: Core build complete
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
        open: true
    },

    {
        id: "4-1",
        text: "WP6 · QA & Testing",
        parent: "4",
        start_date: "2027-04-01 00:00",
        end_date: "2027-06-30 00:00",
        progress: 0.1,
        open: true
    },
    {
        id: "4-1-1",
        text: "System integration test",
        parent: "4-1",
        start_date: "2027-04-01 00:00",
        end_date: "2027-04-30 00:00",
        progress: 0.2
    },
    {
        id: "4-1-2",
        text: "UAT & bug-fix sprint",
        parent: "4-1",
        start_date: "2027-05-01 00:00",
        end_date: "2027-05-31 00:00",
        progress: 0
    },
    {
        id: "4-1-3",
        text: "Security & perf audit",
        parent: "4-1",
        start_date: "2027-06-01 00:00",
        end_date: "2027-06-30 00:00",
        progress: 0
    },

    {
        id: "4-2",
        text: "WP7 · Deployment & Cutover",
        parent: "4",
        start_date: "2027-07-01 00:00",
        end_date: "2027-09-30 00:00",
        progress: 0,
        open: true
    },
    {
        id: "4-2-1",
        text: "Staging environment",
        parent: "4-2",
        start_date: "2027-07-01 00:00",
        end_date: "2027-07-31 00:00",
        progress: 0
    },
    {
        id: "4-2-2",
        text: "Production cutover",
        parent: "4-2",
        start_date: "2027-08-01 00:00",
        end_date: "2027-08-31 00:00",
        progress: 0
    },
    {
        id: "4-2-3",
        text: "Hypercare & monitoring",
        parent: "4-2",
        start_date: "2027-09-01 00:00",
        end_date: "2027-09-30 00:00",
        progress: 0
    },

    {
        id: "4-3",
        text: "WP8 · Training & Handover",
        parent: "4",
        start_date: "2027-10-01 00:00",
        end_date: "2027-12-31 00:00",
        progress: 0,
        open: true
    },
    {
        id: "4-3-1",
        text: "User training sessions",
        parent: "4-3",
        start_date: "2027-10-01 00:00",
        end_date: "2027-10-31 00:00",
        progress: 0
    },
    {
        id: "4-3-2",
        text: "Admin & ops handover",
        parent: "4-3",
        start_date: "2027-11-01 00:00",
        end_date: "2027-11-30 00:00",
        progress: 0
    },
    {
        id: "4-3-3",
        text: "Documentation & close-out",
        parent: "4-3",
        start_date: "2027-12-01 00:00",
        end_date: "2027-12-31 00:00",
        progress: 0
    },

    // Final milestone
    {
        id: "m3",
        text: "Go-Live",
        parent: "1",
        type: "milestone",
        start_date: "2027-12-31 00:00",
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
        const taskDate = new Date(rangeStart + offset);
        const endDate = new Date(taskDate);
        endDate.setDate(endDate.getDate() + 3 + (i % 14));

        const pad = (n: number): string => String(n).padStart(2, "0");
        const dateStr = `${taskDate.getFullYear()}-${pad(taskDate.getMonth() + 1)}-${pad(taskDate.getDate())} 00:00`;
        const endStr = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())} 00:00`;

        tasks.push({
            id: `task-${i + 1}`,
            text: `Project ${i + 1}`,
            start_date: dateStr,
            end_date: endStr,
            progress: (i % 10) / 10,
            parent: i % 20 === 0 ? undefined : `task-${Math.floor(i / 20) * 20 + 1}`,
            open: i % 20 === 0
        });
    }

    return tasks;
}
