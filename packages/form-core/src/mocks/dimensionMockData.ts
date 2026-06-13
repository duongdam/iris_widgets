import type { ComboboxOption } from "../contracts/combobox-option";

export const DIMENSION_TYPES = [
    "Site",
    "Team",
    "Group",
    "Part",
    "Prious",
    "Project",
    "Block L1",
    "Block L2",
    "Function L1",
    "Function L2",
    "Activity L1",
    "Activity L2",
] as const;

export type DimensionType = (typeof DIMENSION_TYPES)[number];

function options(values: string[]): ComboboxOption[] {
    return values.map(value => ({ value, label: value }));
}

export const DIMENSION_MOCK_DATA: Record<DimensionType, ComboboxOption[]> = {
    Site: options(["Site1", "Site2", "Site3"]),
    Team: options(["Team1", "Team2", "Team3"]),
    Group: options(["Group1", "Group2"]),
    Part: options(["Part1", "Part2", "Part3"]),
    Prious: options(["Prious1", "Prious2"]),
    Project: options(["Project1", "Project2", "Project3"]),
    "Block L1": options(["Block L1-A", "Block L1-B"]),
    "Block L2": options(["Block L2-A", "Block L2-B", "Block L2-C"]),
    "Function L1": options(["Function L1-A", "Function L1-B"]),
    "Function L2": options(["Function L2-A", "Function L2-B"]),
    "Activity L1": options(["Activity L1-A", "Activity L1-B", "Activity L1-C"]),
    "Activity L2": options(["Activity L2-A", "Activity L2-B"]),
};
