import type { ListAttributeValue } from "mendix";
import type Big from "big.js";

export interface TaskMappingProps {
    idAttribute?: ListAttributeValue<string | Big>;
    textAttribute?: ListAttributeValue<string>;
    startDateAttribute?: ListAttributeValue<Date>;
    endDateAttribute?: ListAttributeValue<Date>;
    durationAttribute?: ListAttributeValue<Big>;
}

export interface MappingValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validate required datasource attribute mappings before building task data.
 * Logs errors to console; caller should render empty state when invalid.
 */
export function validateDatasourceMapping(props: TaskMappingProps): MappingValidationResult {
    const errors: string[] = [];

    if (!props.idAttribute) {
        errors.push("idAttribute is required but not configured");
    }
    if (!props.textAttribute) {
        errors.push("textAttribute is required but not configured");
    }
    if (!props.startDateAttribute) {
        errors.push("startDateAttribute is required but not configured");
    }
    if (!props.endDateAttribute && !props.durationAttribute) {
        errors.push("Either endDateAttribute or durationAttribute must be configured");
    }

    if (errors.length > 0) {
        console.error("[AxGanttChart] Invalid datasource mapping:", errors.join("; "));
    }

    return { valid: errors.length === 0, errors };
}
