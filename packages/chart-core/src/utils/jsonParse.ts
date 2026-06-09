export function safeJsonParse(input: string): unknown | null {
    if (!input || input.trim() === "") {
        return null;
    }

    try {
        return JSON.parse(input) as unknown;
    } catch {
        if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
            console.warn("[chart-core] Failed to parse JSON input");
        }
        return null;
    }
}
