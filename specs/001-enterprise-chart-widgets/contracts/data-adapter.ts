/**
 * Contract: DataAdapter — transforms raw JSON string to ChartRecord[].
 */

import type { ChartRecord, DataFormat } from "./chart-record";

export interface DataAdapter {
    readonly format: DataFormat;

    /** Parse and transform input JSON string to normalized records */
    transform(input: string): ChartRecord[];

    /** Quick validation without full transform */
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

/** Registry contract for resolving adapters by format */
export interface AdapterRegistry {
    register(adapter: DataAdapter): void;
    get(format: DataFormat): DataAdapter;
}
