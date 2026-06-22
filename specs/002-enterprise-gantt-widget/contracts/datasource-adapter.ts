/**
 * Contract: Mendix datasource → AxGanttTask[]
 */

import type { ListValue, ListAttributeValue } from "mendix";
import type Big from "big.js";
import type { AxGanttTask } from "./gantt-record";

export interface AxDatasourceMappingProps {
    roadmapItems: ListValue;
    aidAttribute: ListAttributeValue<string | Big>;
    itemIdAttribute: ListAttributeValue<string | Big>;
    parentIdAttribute: ListAttributeValue<string>;
    groupAttribute: ListAttributeValue<string>;
    typeAttribute: ListAttributeValue<string>;
    nameAttribute: ListAttributeValue<string>;
    textAttribute: ListAttributeValue<string>;
    countAttribute: ListAttributeValue<Big>;
    orderAttribute: ListAttributeValue<Big>;
    customOrderAttribute: ListAttributeValue<string | Big>;
    startDateAttribute?: ListAttributeValue<Date>;
    endDateAttribute?: ListAttributeValue<Date>;
    milestoneAttribute: ListAttributeValue<string>;
    stndMileMonthAttribute: ListAttributeValue<Date>;
    hasTuningAttribute: ListAttributeValue<boolean>;
    hasManualAttribute: ListAttributeValue<boolean>;
    hasCertAttribute: ListAttributeValue<boolean>;
    hasRFAttribute: ListAttributeValue<boolean>;
    canEditAttribute?: ListAttributeValue<boolean>;
    metadata1Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata2Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata3Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata4Attribute?: ListAttributeValue<string | Big | boolean | Date>;
    metadata5Attribute?: ListAttributeValue<string | Big | boolean | Date>;
}

export interface AdapterResult {
    tasks: AxGanttTask[];
    skippedCount: number;
    warnings: string[];
    mappingValid: boolean;
}

export function mapRoadmapToGanttTasks(props: AxDatasourceMappingProps): AdapterResult;

/**
 * Validation rules:
 * - Required: aid, itemId, type, text, parentId
 * - startDateAttribute NOT globally required
 * - Groups (DISTRICT_GROUP, CUSTOM_GROUP) → unscheduled: true, no dates
 * - TASK/SUB_TASK without dates → unscheduled: true + warning
 */

export function validateRoadmapMapping(props: AxDatasourceMappingProps): { valid: boolean; errors: string[] };
