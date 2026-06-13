/**
 * Convert Mendix DateTime / JS Date to DHTMLX date string using local calendar components.
 * Avoids UTC offset shifts when formatting date-only boundaries.
 */
export function convertDateToGanttString(value: Date | undefined): string | undefined {
    if (!value || Number.isNaN(value.getTime())) {
        return undefined;
    }

    const pad = (n: number): string => String(n).padStart(2, "0");
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(
        value.getMinutes()
    )}`;
}

/** Validate and return a Mendix DateTime as JS Date. */
export function convertDate(value: Date | undefined): Date | undefined {
    if (!value || Number.isNaN(value.getTime())) {
        return undefined;
    }
    return value;
}
