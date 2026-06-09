export const PREVIEW_TITLE = "Multi-Series Stack Area (Preview)";
export const PREVIEW_HEIGHT = 400;
export const PREVIEW_DATA_FORMAT = "flat" as const;

export const PREVIEW_JSON_DATA = JSON.stringify([
    { id: "1", name: "CPU", period: "2025-01", pm: 120 },
    { id: "2", name: "Memory", period: "2025-01", pm: 85 },
    { id: "3", name: "Disk", period: "2025-01", pm: 60 },
    { id: "4", name: "CPU", period: "2025-02", pm: 140 },
    { id: "5", name: "Memory", period: "2025-02", pm: 95 },
    { id: "6", name: "Disk", period: "2025-02", pm: 70 },
    { id: "7", name: "CPU", period: "2025-03", pm: 130 },
    { id: "8", name: "Memory", period: "2025-03", pm: 90 },
    { id: "9", name: "Disk", period: "2025-03", pm: 65 },
]);
