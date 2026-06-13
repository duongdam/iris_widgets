export function parseJsonArray(value: string | undefined): string[] {
    if (!value) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(item => typeof item === "string") : [];
    } catch {
        return [];
    }
}
