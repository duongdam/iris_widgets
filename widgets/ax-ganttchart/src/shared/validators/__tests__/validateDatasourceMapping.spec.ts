import { validateDatasourceMapping } from "../validateDatasourceMapping";

describe("validateDatasourceMapping", () => {
    it("passes when required mappings are present", () => {
        const result = validateDatasourceMapping({
            idAttribute: {} as never,
            textAttribute: {} as never,
            startDateAttribute: {} as never,
            endDateAttribute: {} as never,
        });

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it("accepts duration instead of end date", () => {
        const result = validateDatasourceMapping({
            idAttribute: {} as never,
            textAttribute: {} as never,
            startDateAttribute: {} as never,
            durationAttribute: {} as never,
        });

        expect(result.valid).toBe(true);
    });

    it("fails when required mappings are missing", () => {
        const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

        const result = validateDatasourceMapping({
            textAttribute: {} as never,
        });

        expect(result.valid).toBe(false);
        expect(result.errors).toEqual(
            expect.arrayContaining([
                "idAttribute is required but not configured",
                "startDateAttribute is required but not configured",
                "Either endDateAttribute or durationAttribute must be configured",
            ])
        );

        errorSpy.mockRestore();
    });
});
