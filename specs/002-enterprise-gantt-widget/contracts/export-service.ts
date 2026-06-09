/**
 * Contract: ExportService — decoupled export delegation to DHTMLX export_api.
 */

export type ExportFormat = "pdf" | "png" | "jpeg" | "excel";

export interface ExportOptions {
    name?: string;
    server?: string;
    start?: string;
    end?: string;
    visual?: boolean;
    columns?: ExportColumn[];
}

export interface ExportColumn {
    id: string;
    header: string;
    width?: number;
    type?: "date" | "number" | "string";
}

export interface ExportResult {
    url?: string;
    error?: string;
}

export interface ExportService {
    exportPdf(gantt: unknown, options?: ExportOptions): Promise<ExportResult>;
    exportPng(gantt: unknown, options?: ExportOptions): Promise<ExportResult>;
    exportJpeg(gantt: unknown, options?: ExportOptions): Promise<ExportResult>;
    exportExcel(gantt: unknown, options?: ExportOptions): Promise<ExportResult>;
}

export interface ExportServiceFactory {
    create(defaultServerUrl?: string): ExportService;
}
