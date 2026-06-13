export {
    DIMENSION_TYPES,
    DIMENSION_MOCK_DATA,
    type ComboboxOption,
    type DimensionType,
} from "@iris/form-core";

import { DIMENSION_MOCK_DATA, type ComboboxOption, type DimensionType } from "@iris/form-core";

export function getOptionsForDimension(type: string): ComboboxOption[] {
    return DIMENSION_MOCK_DATA[type as DimensionType] ?? [];
}
