import { MOCK_ELASTIC_JSON, MOCK_FLAT_JSON } from "@iris/chart-core";

export type DataSourceKind = "flat" | "elastic";

export interface MockDataset {
    id: string;
    label: string;
    description: string;
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
        flat: MOCK_FLAT_JSON,
        elastic: MOCK_ELASTIC_JSON,
    },
    {
        id: "infra",
        label: "Infrastructure trends",
        description: "6 months × 5 services — bar/column/report charts with richer bars.",
        flat: JSON.stringify(INFRA_TRENDS_FLAT, null, 2),
        elastic: flatToElastic(INFRA_TRENDS_FLAT),
    },
    {
        id: "stack",
        label: "Stack area series",
        description: "4 series × 4 periods — ideal for stacked area and legend toggles.",
        flat: JSON.stringify(STACK_AREA_FLAT, null, 2),
        elastic: flatToElastic(STACK_AREA_FLAT),
    },
    {
        id: "resource-local",
        label: "Resource usage (local)",
        description: "Same shape as chart-core flat mock with explicit metadata.",
        flat: JSON.stringify(RESOURCE_USAGE_FLAT, null, 2),
        elastic: flatToElastic(RESOURCE_USAGE_FLAT),
    },
];

export function getDatasetJson(datasetId: string, source: DataSourceKind): string {
    const dataset = MOCK_DATASETS.find(d => d.id === datasetId) ?? MOCK_DATASETS[0];
    return source === "flat" ? dataset.flat : dataset.elastic;
}
