export interface FullscreenService {
    /** Returns true when the browser entered native fullscreen. */
    enter(element: HTMLElement): Promise<boolean>;
    exit(): Promise<void>;
    isFullscreen(): boolean;
    onChange(handler: (fullscreen: boolean) => void): () => void;
}

export function createFullscreenService(): FullscreenService {
    return {
        async enter(element: HTMLElement): Promise<boolean> {
            if (document.fullscreenElement) {
                return true;
            }

            try {
                await element.requestFullscreen();
                return document.fullscreenElement != null;
            } catch {
                return false;
            }
        },

        async exit(): Promise<void> {
            if (!document.fullscreenElement) {
                return;
            }

            try {
                await document.exitFullscreen();
            } catch {
                // Ignore exit failures; CSS fallback is cleared separately.
            }
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
