import { createFullscreenService } from "../FullscreenService";

describe("FullscreenService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("returns true when requestFullscreen succeeds", async () => {
        const element = document.createElement("div");
        element.requestFullscreen = jest.fn().mockImplementation(async () => {
            Object.defineProperty(document, "fullscreenElement", { configurable: true, value: element });
        });
        Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null });

        const service = createFullscreenService();
        const result = await service.enter(element);

        expect(result).toBe(true);
        expect(element.requestFullscreen).toHaveBeenCalledTimes(1);
    });

    it("returns false when requestFullscreen is blocked", async () => {
        const element = document.createElement("div");
        element.requestFullscreen = jest.fn().mockRejectedValue(new Error("Not allowed"));
        Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null });

        const service = createFullscreenService();
        const result = await service.enter(element);

        expect(result).toBe(false);
    });

    it("returns true immediately when already in fullscreen", async () => {
        const element = document.createElement("div");
        element.requestFullscreen = jest.fn();
        Object.defineProperty(document, "fullscreenElement", { configurable: true, value: element });

        const service = createFullscreenService();
        const result = await service.enter(element);

        expect(result).toBe(true);
        expect(element.requestFullscreen).not.toHaveBeenCalled();
    });

    it("notifies onChange listeners when fullscreen state changes", () => {
        const service = createFullscreenService();
        const handler = jest.fn();
        const remove = service.onChange(handler);

        document.dispatchEvent(new Event("fullscreenchange"));

        expect(handler).toHaveBeenCalled();
        remove();
    });
});
