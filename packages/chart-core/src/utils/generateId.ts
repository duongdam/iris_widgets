let counter = 0;

export function generateId(prefix = "gen"): string {
    counter += 1;
    return `${prefix}-${counter}-${Date.now().toString(36)}`;
}

export function resetIdCounter(): void {
    counter = 0;
}
