import type { ChartRecord, DataFormat } from "./chart-record";

export interface DataAdapter {
    readonly format: DataFormat;
    transform(input: string): ChartRecord[];
    validate(input: string): boolean;
}

export interface AdapterResult {
    records: ChartRecord[];
    errors: AdapterError[];
}

export interface AdapterError {
    code: "PARSE_ERROR" | "VALIDATION_ERROR" | "EMPTY_INPUT";
    message: string;
    index?: number;
}

export interface AdapterRegistry {
    register(adapter: DataAdapter): void;
    get(format: DataFormat): DataAdapter;
}
