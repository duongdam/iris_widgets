export interface FullscreenService {
    enter(element: HTMLElement): Promise<void>;
    exit(): Promise<void>;
    isFullscreen(): boolean;
    onChange(handler: (fullscreen: boolean) => void): () => void;
}

export function createFullscreenService(): FullscreenService {
    return {
        async enter(element: HTMLElement): Promise<void> {
            if (document.fullscreenElement) {
                return;
            }

            await element.requestFullscreen();
        },

        async exit(): Promise<void> {
            if (!document.fullscreenElement) {
                return;
            }

            await document.exitFullscreen();
        },

        isFullscreen(): boolean {
            return document.fullscreenElement != null;
        },

        onChange(handler: (fullscreen: boolean) => void): () => void {
            const listener = (): void => {
                handler(document.fullscreenElement != null);
            };

            document.addEventListener("fullscreenchange", listener);
            return () => document.removeEventListener("fullscreenchange", listener);
        }
    };
}
