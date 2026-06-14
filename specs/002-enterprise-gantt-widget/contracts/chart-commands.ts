/**
 * Contract: ChartCommand — Mendix command attribute API for chart widgets.
 *
 * Mirrors Gantt command pattern (write command → execute → clear attribute).
 * Applies to: ax-barchart, ax-columnchart, ax-stackareachart, ax-reportchart.
 */

/** Commands sent TO chart widgets via Mendix `command` attribute */
export enum ChartIncomingEvents {
    ENTER_FULLSCREEN = "ENTER_FULLSCREEN",
    EXIT_FULLSCREEN = "EXIT_FULLSCREEN",
    REFRESH = "REFRESH",
}

/** Notifications sent FROM chart widgets */
export enum ChartFullscreenEvents {
    FULLSCREEN_CHANGED = "FULLSCREEN_CHANGED",
}

export enum ChartCommand {
    ENTER_FULLSCREEN = "ENTER_FULLSCREEN",
    EXIT_FULLSCREEN = "EXIT_FULLSCREEN",
    REFRESH = "REFRESH",
}

export const CHART_COMMAND_NAMES = Object.values(ChartCommand) as readonly ChartCommand[];

const COMMAND_TO_EVENT: Record<ChartCommand, ChartIncomingEvents> = {
    [ChartCommand.ENTER_FULLSCREEN]: ChartIncomingEvents.ENTER_FULLSCREEN,
    [ChartCommand.EXIT_FULLSCREEN]: ChartIncomingEvents.EXIT_FULLSCREEN,
    [ChartCommand.REFRESH]: ChartIncomingEvents.REFRESH,
};

export function parseChartCommand(raw: string): ChartCommand | undefined {
    const normalized = raw.trim().toUpperCase();
    return CHART_COMMAND_NAMES.find(c => c === normalized);
}

export function chartCommandToEvent(command: ChartCommand): ChartIncomingEvents {
    return COMMAND_TO_EVENT[command];
}

export interface FullscreenChangedData {
    fullscreen: boolean;
}

/** Shared fullscreen service contract (Browser Fullscreen API) */
export interface FullscreenService {
    enter(element: HTMLElement): Promise<void>;
    exit(): Promise<void>;
    isFullscreen(): boolean;
    onChange(handler: (fullscreen: boolean) => void): () => void;
}

/** Mendix widget props for command integration */
export interface ChartCommandProps {
    command?: { value?: string };
    commandPayload?: { value?: string };
}
