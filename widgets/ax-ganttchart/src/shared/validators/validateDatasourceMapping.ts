import type { ListAttributeValue } from "mendix";
import type Big from "big.js";

export interface TaskMappingProps {
    itemIdAttribute?: ListAttributeValue<string | Big>;
    textAttribute?: ListAttributeValue<string>;
    typeAttribute?: ListAttributeValue<string>;
    parentIdAttribute?: ListAttributeValue<string>;
}

export interface MappingValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validate required datasource attribute mappings before building task data.
 * Groups (DISTRICT_GROUP, CUSTOM_GROUP) do not require start/end dates.
 */
export function validateDatasourceMapping(props: TaskMappingProps): MappingValidationResult {
    const errors: string[] = [];

    if (!props.itemIdAttribute) {
        errors.push("itemIdAttribute is required but not configured");
    }
    if (!props.textAttribute) {
        errors.push("textAttribute is required but not configured");
    }
    if (!props.typeAttribute) {
        errors.push("typeAttribute is required but not configured");
    }
    if (!props.parentIdAttribute) {
        errors.push("parentIdAttribute is required but not configured");
    }

    if (errors.length > 0) {
        console.error("[AxGanttChart] Invalid datasource mapping:", errors.join("; "));
    }

    return { valid: errors.length === 0, errors };
}
