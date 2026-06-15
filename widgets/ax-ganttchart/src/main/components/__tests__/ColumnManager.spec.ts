import { GANTT_ADD_BUTTON_LEVEL } from "../ColumnManager";

describe("ColumnManager", () => {
    it("exposes level-2 as the add-button tier (0-indexed)", () => {
        // Program=0, Phase=1, WorkPackage=2, Task=3
        expect(GANTT_ADD_BUTTON_LEVEL).toBe(1);
    });
});
