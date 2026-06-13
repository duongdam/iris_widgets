import type { Dayjs } from "dayjs";

export type DatePickerGranularity = "date" | "week" | "month" | "year";

/**
 * Normalize antd/dayjs selection to Mendix DateTime.
 * Uses local calendar boundaries for week/month/year modes (Mendix client convention).
 */
export function convertPickerDateToMendix(value: Dayjs, pickerMode: DatePickerGranularity): Date {
    if (pickerMode === "month") {
        return value.startOf("month").toDate();
    }
    if (pickerMode === "year") {
        return value.startOf("year").toDate();
    }
    if (pickerMode === "week") {
        return value.startOf("week").toDate();
    }
    return value.toDate();
}
