import { isGroupType, isScheduledType, normalizeTaskType } from "../axGanttTask";

describe("normalizeTaskType", () => {
    it("maps legacy AREA to DISTRICT_GROUP", () => {
        expect(normalizeTaskType("AREA")).toBe("DISTRICT_GROUP");
    });

    it("maps legacy BIZ_LINE to CUSTOM_GROUP", () => {
        expect(normalizeTaskType("BIZ_LINE")).toBe("CUSTOM_GROUP");
    });

    it("defaults missing type to TASK", () => {
        expect(normalizeTaskType(undefined)).toBe("TASK");
    });
});

describe("unscheduled group detection", () => {
    it("treats DISTRICT_GROUP and CUSTOM_GROUP as groups", () => {
        expect(isGroupType("DISTRICT_GROUP")).toBe(true);
        expect(isGroupType("CUSTOM_GROUP")).toBe(true);
        expect(isGroupType("AREA")).toBe(true);
        expect(isGroupType("BIZ_LINE")).toBe(true);
    });

    it("treats TASK and SUB_TASK as scheduled types", () => {
        expect(isScheduledType("TASK")).toBe(true);
        expect(isScheduledType("SUB_TASK")).toBe(true);
        expect(isGroupType("TASK")).toBe(false);
    });
});
