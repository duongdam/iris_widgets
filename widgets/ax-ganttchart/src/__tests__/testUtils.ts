export interface MockEditableValue {
    status: "available" | "loading" | "unavailable";
    readOnly: boolean;
    value: string | undefined;
    displayValue: string;
    setValue: jest.Mock;
}

export function createMockEditableValue(
    initial?: string,
    options: { readOnly?: boolean; status?: "available" | "loading" | "unavailable" } = {}
): MockEditableValue {
    let current = initial;
    const setValue = jest.fn((next: string | undefined) => {
        current = next;
    });

    return {
        status: options.status ?? "available",
        readOnly: options.readOnly ?? false,
        get value() {
            return current;
        },
        set displayValue(_value: string) {
            // no-op for mock
        },
        get displayValue() {
            return current ?? "";
        },
        setValue,
    };
}

export const sampleTask = {
    id: "task-1",
    text: "Phase A",
    start_date: "2026-06-01",
    end_date: "2026-06-10",
    parent: "program-1",
    metadata: { mendixGuid: "abc-123" },
};
