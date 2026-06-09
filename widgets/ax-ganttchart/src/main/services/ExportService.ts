import { gantt } from "../components/GanttConfiguration";

export type ExportFormat = "pdf" | "png" | "jpeg" | "excel";

export interface ExportOptions {
    name?: string;
    server?: string;
    start?: string;
    end?: string;
    visual?: boolean;
}

export interface ExportResult {
    url?: string;
    error?: string;
}

const DEFAULT_EXPORT_SERVER = "https://export.dhtmlx.com/gantt";

export interface ExportService {
    exportPdf(options?: ExportOptions): Promise<ExportResult>;
    exportPng(options?: ExportOptions): Promise<ExportResult>;
    exportJpeg(options?: ExportOptions): Promise<ExportResult>;
    exportExcel(options?: ExportOptions): Promise<ExportResult>;
}

function runExport(
    method: "exportToPDF" | "exportToPNG" | "exportToExcel",
    options?: ExportOptions
): Promise<ExportResult> {
    return new Promise(resolve => {
        const exporter = gantt[method];
        if (!exporter) {
            resolve({ error: `${method} is not available. Ensure export_api plugin is enabled.` });
            return;
        }

        try {
            exporter.call(gantt, {
                name: options?.name,
                server: options?.server ?? DEFAULT_EXPORT_SERVER,
                start: options?.start,
                end: options?.end,
                visual: options?.visual,
                callback: (result: { url?: string; error?: string }) => {
                    resolve({ url: result?.url, error: result?.error });
                }
            });
        } catch (error) {
            resolve({
                error: error instanceof Error ? error.message : "Export failed"
            });
        }
    });
}

export function createExportService(defaultServerUrl?: string): ExportService {
    const server = defaultServerUrl?.trim() || DEFAULT_EXPORT_SERVER;

    return {
        exportPdf(options?: ExportOptions): Promise<ExportResult> {
            return runExport("exportToPDF", { ...options, server: options?.server ?? server });
        },

        exportPng(options?: ExportOptions): Promise<ExportResult> {
            return runExport("exportToPNG", { ...options, server: options?.server ?? server });
        },

        async exportJpeg(options?: ExportOptions): Promise<ExportResult> {
            const pngResult = await runExport("exportToPNG", {
                ...options,
                server: options?.server ?? server,
                name: options?.name?.replace(/\.jpe?g$/i, ".png") ?? "gantt.png"
            });

            return { ...pngResult, url: pngResult.url };
        },

        exportExcel(options?: ExportOptions): Promise<ExportResult> {
            return runExport("exportToExcel", {
                ...options,
                server: options?.server ?? server,
                visual: options?.visual ?? true
            });
        }
    };
}
