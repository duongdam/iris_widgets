import type { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import type { ComboboxOption } from "../contracts/combobox-option";

export interface ComboboxMapping {
    labelAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<string>;
}

export function mapDatasourceToOptions(
    datasource: ListValue,
    mapping: ComboboxMapping
): ComboboxOption[] {
    const items: ObjectItem[] = datasource.items ?? [];

    return items.reduce<ComboboxOption[]>((options, item) => {
        const value = mapping.valueAttribute.get(item).value ?? "";
        if (!value) {
            return options;
        }

        const label = mapping.labelAttribute.get(item).value ?? value;
        options.push({ value, label });
        return options;
    }, []);
}
