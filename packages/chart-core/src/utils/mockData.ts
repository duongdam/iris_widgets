import type { ChartRecord } from "../contracts/chart-record";

export const MOCK_FLAT_RECORDS: ChartRecord[] = [
    { id: "1", name: "CPU", period: "2025-01", pm: 120, metadata: { region: "apac" } },
    { id: "2", name: "Memory", period: "2025-01", pm: 85 },
    { id: "3", name: "CPU", period: "2025-02", pm: 140, metadata: { region: "apac" } },
    { id: "4", name: "Memory", period: "2025-02", pm: 95 },
    { id: "5", name: "Disk", period: "2025-01", pm: 60, metadata: { cluster: "cluster-a" } },
];

export const MOCK_FLAT_JSON = JSON.stringify(MOCK_FLAT_RECORDS);

export const MOCK_ELASTIC_JSON = JSON.stringify({
    aggregations: {
        periods: {
            buckets: [
                {
                    key: "2025-01",
                    items: {
                        buckets: [
                            { key: "CPU", value: { value: 120 } },
                            { key: "Memory", value: { value: 85 } },
                        ],
                    },
                },
                {
                    key: "2025-02",
                    items: {
                        buckets: [
                            { key: "CPU", value: { value: 140 } },
                            { key: "Memory", value: { value: 95 } },
                        ],
                    },
                },
            ],
        },
    },
});
