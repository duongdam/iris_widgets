import type { GanttTask } from "../../../main/eventbus/eventTypes";
import {
    addCalendarDays,
    calendarDayDiff,
    syncEventMtoDateWithDrag,
    toLocalCalendarDay
} from "../mtoDate";

function task(partial: Partial<GanttTask> & Pick<GanttTask, "id">): GanttTask {
    return {
        text: partial.id,
        start_date: "2025-01-01 00:00",
        end_date: "2025-12-31 00:00",
        ...partial
    };
}

describe("syncEventMtoDateWithDrag", () => {
    it("shifts MTO milestone by calendar days when the bar moves", () => {
        const original = task({
            id: "mto-1",
            tags: ["MTO"],
            start_date: "2025-05-01 00:00",
            end_date: "2026-01-31 00:00",
            mto_date: "2026-03-15 00:00"
        });
        const moved = {
            ...original,
            start_date: new Date(2025, 4, 11, 8, 0, 0)
        };

        expect(syncEventMtoDateWithDrag(moved, original, "move")).toBe("2026-03-25 00:00");
    });

    it("sets K/O milestone to the snapped start calendar day", () => {
        const original = task({
            id: "ko-1",
            tags: ["K/O"],
            start_date: "2026-04-01 00:00",
            end_date: "2027-12-01 00:00",
            mto_date: "2026-04-01 00:00"
        });
        const moved = {
            ...original,
            start_date: new Date(2026, 3, 6, 17, 30, 0)
        };

        expect(syncEventMtoDateWithDrag(moved, original, "move")).toBe("2026-04-06 00:00");
    });

    it("re-syncs after DHTMLX snap using the drag-start baseline", () => {
        const baseline = task({
            id: "mto-2",
            tags: ["MTO"],
            start_date: "2025-05-01 00:00",
            end_date: "2026-01-31 00:00",
            mto_date: "2026-03-15 00:00"
        });
        const snapped = {
            ...baseline,
            start_date: new Date(2025, 4, 11, 0, 0, 0)
        };

        expect(syncEventMtoDateWithDrag(snapped, baseline, "move")).toBe("2026-03-25 00:00");
    });

    it("ignores resize and progress modes", () => {
        const original = task({
            id: "mto-3",
            tags: ["MTO"],
            mto_date: "2026-03-15 00:00"
        });

        expect(syncEventMtoDateWithDrag(original, original, "resize")).toBeUndefined();
        expect(syncEventMtoDateWithDrag(original, original, "progress")).toBeUndefined();
    });
});

describe("calendarDayDiff", () => {
    it("uses local calendar days regardless of time-of-day", () => {
        const from = new Date(2025, 4, 1, 23, 59, 0);
        const to = new Date(2025, 4, 2, 0, 1, 0);

        expect(calendarDayDiff(from, to)).toBe(1);
        expect(addCalendarDays(toLocalCalendarDay(from), 1)).toEqual(toLocalCalendarDay(to));
    });
});
