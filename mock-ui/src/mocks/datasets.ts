import { MOCK_ELASTIC_JSON, MOCK_FLAT_JSON, MOCK_FLAT_RECORDS } from "@iris/chart-core";
import type { ChartRecord } from "@iris/chart-core";

export type DataSourceKind = "flat" | "elastic";

export interface MockDataset {
    id: string;
    label: string;
    description: string;
    records: ChartRecord[];
    flat: string;
    elastic: string;
}

/** Flat records grouped by use case — elastic mirrors the same metrics. */
const RESOURCE_USAGE_FLAT = [
    { id: "1", name: "CPU", period: "2025-01", pm: 120, metadata: { region: "apac" } },
    { id: "2", name: "Memory", period: "2025-01", pm: 85 },
    { id: "3", name: "Disk", period: "2025-01", pm: 60, metadata: { cluster: "cluster-a" } },
    { id: "4", name: "CPU", period: "2025-02", pm: 140, metadata: { region: "apac" } },
    { id: "5", name: "Memory", period: "2025-02", pm: 95 },
    { id: "6", name: "Disk", period: "2025-02", pm: 70 },
];

const INFRA_TRENDS_FLAT = [
    { id: "1", name: "Web API", period: "2024-10", pm: 420 },
    { id: "2", name: "Database", period: "2024-10", pm: 680 },
    { id: "3", name: "Cache", period: "2024-10", pm: 210 },
    { id: "4", name: "Queue", period: "2024-10", pm: 155 },
    { id: "5", name: "CDN", period: "2024-10", pm: 320 },
    { id: "6", name: "Web API", period: "2024-11", pm: 460 },
    { id: "7", name: "Database", period: "2024-11", pm: 710 },
    { id: "8", name: "Cache", period: "2024-11", pm: 240 },
    { id: "9", name: "Queue", period: "2024-11", pm: 180 },
    { id: "10", name: "CDN", period: "2024-11", pm: 350 },
    { id: "11", name: "Web API", period: "2024-12", pm: 510 },
    { id: "12", name: "Database", period: "2024-12", pm: 760 },
    { id: "13", name: "Cache", period: "2024-12", pm: 265 },
    { id: "14", name: "Queue", period: "2024-12", pm: 195 },
    { id: "15", name: "CDN", period: "2024-12", pm: 390 },
    { id: "16", name: "Web API", period: "2025-01", pm: 540 },
    { id: "17", name: "Database", period: "2025-01", pm: 820 },
    { id: "18", name: "Cache", period: "2025-01", pm: 290 },
    { id: "19", name: "Queue", period: "2025-01", pm: 210 },
    { id: "20", name: "CDN", period: "2025-01", pm: 410 },
    { id: "21", name: "Web API", period: "2025-02", pm: 580 },
    { id: "22", name: "Database", period: "2025-02", pm: 870 },
    { id: "23", name: "Cache", period: "2025-02", pm: 310 },
    { id: "24", name: "Queue", period: "2025-02", pm: 230 },
    { id: "25", name: "CDN", period: "2025-02", pm: 440 },
    { id: "26", name: "Web API", period: "2025-03", pm: 620 },
    { id: "27", name: "Database", period: "2025-03", pm: 910 },
    { id: "28", name: "Cache", period: "2025-03", pm: 335 },
    { id: "29", name: "Queue", period: "2025-03", pm: 250 },
    { id: "30", name: "CDN", period: "2025-03", pm: 470 },
];

const STACK_AREA_FLAT = [
    { id: "1", name: "CPU", period: "2025-01", pm: 120 },
    { id: "2", name: "Memory", period: "2025-01", pm: 85 },
    { id: "3", name: "Disk", period: "2025-01", pm: 60 },
    { id: "4", name: "Network", period: "2025-01", pm: 45 },
    { id: "5", name: "CPU", period: "2025-02", pm: 140 },
    { id: "6", name: "Memory", period: "2025-02", pm: 95 },
    { id: "7", name: "Disk", period: "2025-02", pm: 70 },
    { id: "8", name: "Network", period: "2025-02", pm: 52 },
    { id: "9", name: "CPU", period: "2025-03", pm: 130 },
    { id: "10", name: "Memory", period: "2025-03", pm: 90 },
    { id: "11", name: "Disk", period: "2025-03", pm: 65 },
    { id: "12", name: "Network", period: "2025-03", pm: 48 },
    { id: "13", name: "CPU", period: "2025-04", pm: 155 },
    { id: "14", name: "Memory", period: "2025-04", pm: 102 },
    { id: "15", name: "Disk", period: "2025-04", pm: 78 },
    { id: "16", name: "Network", period: "2025-04", pm: 58 },
];

// Annual fish catch data (2000–2023) — 5 gear types with high variance to show wave patterns
const FISH_CATCH_SERIES: Record<string, number[]> = {
    "Bottom trawl":  [28, 29, 31, 30, 32, 31, 29, 30, 28, 27, 29, 30, 31, 30, 29, 31, 30, 29, 28, 30, 27, 28, 29, 28],
    "Pelagic trawl": [11, 12, 13, 14, 15, 16, 14, 15, 16, 15, 16, 17, 16, 18, 17, 16, 17, 18, 16, 17, 15, 16, 17, 16],
    "Purse seine":   [25, 27, 30, 32, 28, 24, 27, 30, 26, 22, 26, 29, 31, 27, 25, 23, 26, 28, 24, 26, 23, 25, 27, 25],
    "Small scale":   [16, 17, 18, 19, 20, 21, 20, 22, 21, 20, 22, 23, 22, 24, 23, 22, 23, 24, 22, 23, 21, 22, 23, 22],
    "Other gear":    [19, 18, 17, 18, 17, 16, 17, 15, 16, 15, 14, 15, 14, 13, 14, 13, 12, 13, 12, 13, 12, 11, 12, 11],
};
const FISH_CATCH_YEARS = Array.from({ length: 24 }, (_, i) => String(2000 + i));

const FISH_CATCH_FLAT = FISH_CATCH_YEARS.flatMap((year, yi) =>
    Object.entries(FISH_CATCH_SERIES).map(([name, values], si) => ({
        id: String(yi * 5 + si + 1),
        name,
        period: year,
        pm: values[yi],
    }))
);

// Monthly revenue deviation vs target — positive = above target (green), negative = below (red)
const NEGATIVE_BAR_RAW: Array<{ month: string; value: number }> = [
    { month: "Jan", value: 12 },
    { month: "Feb", value: -8 },
    { month: "Mar", value: 22 },
    { month: "Apr", value: -5 },
    { month: "May", value: 18 },
    { month: "Jun", value: -14 },
    { month: "Jul", value: 9 },
    { month: "Aug", value: -3 },
    { month: "Sep", value: 25 },
    { month: "Oct", value: -11 },
    { month: "Nov", value: 30 },
    { month: "Dec", value: 7 },
];
const NEGATIVE_BAR_FLAT = NEGATIVE_BAR_RAW.map((d, i) => ({
    id: String(i + 1),
    name: d.month,
    period: "2025",
    pm: d.value,
}));

// Monthly variance — 5 negative values (below 0) and 5 positive (above 0), spanning -150 to +150
const MIXED_BAR_FLAT = [
    { id: "mb1", name: "Mar", period: "2025", pm: -120 },
    { id: "mb2", name: "Jul", period: "2025", pm: -85 },
    { id: "mb3", name: "Jan", period: "2025", pm: -150 },
    { id: "mb4", name: "Sep", period: "2025", pm: -45 },
    { id: "mb5", name: "Nov", period: "2025", pm: -70 },
    { id: "mb6", name: "Feb", period: "2025", pm: 90 },
    { id: "mb7", name: "Jun", period: "2025", pm: 130 },
    { id: "mb8", name: "Apr", period: "2025", pm: 65 },
    { id: "mb9", name: "Oct", period: "2025", pm: 110 },
    { id: "mb10", name: "Dec", period: "2025", pm: 80 },
];

function flatToElastic(flat: Array<{ name: string; period: string; pm: number }>): string {
    const periodMap = new Map<string, Map<string, number>>();

    for (const row of flat) {
        if (!periodMap.has(row.period)) {
            periodMap.set(row.period, new Map());
        }
        periodMap.get(row.period)!.set(row.name, row.pm);
    }

    const buckets = [...periodMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, names]) => ({
            key: period,
            items: {
                buckets: [...names.entries()]
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([name, pm]) => ({
                        key: name,
                        value: { value: pm },
                    })),
            },
        }));

    return JSON.stringify({ aggregations: { periods: { buckets } } }, null, 2);
}

export const MOCK_DATASETS: MockDataset[] = [
    {
        id: "resource",
        label: "Resource usage",
        description: "Small dataset from chart-core mocks — good for quick smoke tests.",
        records: MOCK_FLAT_RECORDS,
        flat: MOCK_FLAT_JSON,
        elastic: MOCK_ELASTIC_JSON,
    },
    {
        id: "infra",
        label: "Infrastructure trends",
        description: "6 months × 5 services — bar/column/report charts with richer bars.",
        records: INFRA_TRENDS_FLAT as ChartRecord[],
        flat: JSON.stringify(INFRA_TRENDS_FLAT, null, 2),
        elastic: flatToElastic(INFRA_TRENDS_FLAT),
    },
    {
        id: "stack",
        label: "Stack area series",
        description: "4 series × 4 periods — ideal for stacked area and legend toggles.",
        records: STACK_AREA_FLAT as ChartRecord[],
        flat: JSON.stringify(STACK_AREA_FLAT, null, 2),
        elastic: flatToElastic(STACK_AREA_FLAT),
    },
    {
        id: "resource-local",
        label: "Resource usage (local)",
        description: "Same shape as chart-core flat mock with explicit metadata.",
        records: RESOURCE_USAGE_FLAT as ChartRecord[],
        flat: JSON.stringify(RESOURCE_USAGE_FLAT, null, 2),
        elastic: flatToElastic(RESOURCE_USAGE_FLAT),
    },
    {
        id: "fish-catch",
        label: "Fish catch by gear (2000–2023)",
        description: "5 gear types × 24 years — high variance data showing deep wave patterns on stacked area.",
        records: FISH_CATCH_FLAT as ChartRecord[],
        flat: JSON.stringify(FISH_CATCH_FLAT, null, 2),
        elastic: flatToElastic(FISH_CATCH_FLAT),
    },
    {
        id: "negative-bar",
        label: "Revenue deviation (negative bar)",
        description: "Monthly revenue vs target — mix of positive and negative deviations. Ideal for ax-negativebarchart.",
        records: NEGATIVE_BAR_FLAT as ChartRecord[],
        flat: JSON.stringify(NEGATIVE_BAR_FLAT, null, 2),
        elastic: flatToElastic(NEGATIVE_BAR_FLAT),
    },
    {
        id: "mixed-bar",
        label: "Mixed positive/negative (bar)",
        description: "5 negative values (dark red) + 5 positive values (dark green) — demonstrates sign-based bar coloring.",
        records: MIXED_BAR_FLAT as ChartRecord[],
        flat: JSON.stringify(MIXED_BAR_FLAT, null, 2),
        elastic: flatToElastic(MIXED_BAR_FLAT),
    },
];

export function getDatasetJson(datasetId: string, source: DataSourceKind): string {
    const dataset = MOCK_DATASETS.find(d => d.id === datasetId) ?? MOCK_DATASETS[0];
    return source === "flat" ? dataset.flat : dataset.elastic;
}

export function getDatasetRecords(datasetId: string): ChartRecord[] {
    const dataset = MOCK_DATASETS.find(d => d.id === datasetId) ?? MOCK_DATASETS[0];
    return dataset.records;
}
