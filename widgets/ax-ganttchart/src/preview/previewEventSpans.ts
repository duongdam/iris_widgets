import type { GanttEventTypeTag } from "../shared/utils/mtoDate";
import { formatGanttDateTime } from "../shared/utils/mtoDate";

/** Preview-only: synthetic span defaults for mock datasets (not used at runtime). */
const MTO_MONTHS_BEFORE = 10;
const MTO_MONTHS_AFTER = 10;
const KO_MONTHS_AFTER = 20;

function addMonths(date: Date, months: number): Date {
    const next = new Date(date);
    next.setMonth(next.getMonth() + months);
    return next;
}

export function computePreviewEventSpan(
    milestone: Date,
    eventType: GanttEventTypeTag
): { start_date: string; end_date: string; mto_date: string } {
    const mto_date = formatGanttDateTime(milestone);

    if (eventType === "K/O") {
        return {
            start_date: mto_date,
            end_date: formatGanttDateTime(addMonths(milestone, KO_MONTHS_AFTER)),
            mto_date
        };
    }

    return {
        start_date: formatGanttDateTime(addMonths(milestone, -MTO_MONTHS_BEFORE)),
        end_date: formatGanttDateTime(addMonths(milestone, MTO_MONTHS_AFTER)),
        mto_date
    };
}
