import { ChartEvents } from "../eventbus/types";

export enum ChartCommand {
    ENTER_FULLSCREEN = "ENTER_FULLSCREEN",
    EXIT_FULLSCREEN = "EXIT_FULLSCREEN",
    REFRESH = "REFRESH",
}

export const CHART_COMMAND_NAMES = Object.values(ChartCommand) as readonly ChartCommand[];

const COMMAND_TO_EVENT: Record<ChartCommand, ChartEvents> = {
    [ChartCommand.ENTER_FULLSCREEN]: ChartEvents.ENTER_FULLSCREEN,
    [ChartCommand.EXIT_FULLSCREEN]: ChartEvents.EXIT_FULLSCREEN,
    [ChartCommand.REFRESH]: ChartEvents.CHART_REFRESH,
};

export function parseChartCommand(raw: string): ChartCommand | undefined {
    const normalized = raw.trim().toUpperCase();
    return CHART_COMMAND_NAMES.find(command => command === normalized);
}

export function chartCommandToEvent(command: ChartCommand): ChartEvents {
    return COMMAND_TO_EVENT[command];
}
