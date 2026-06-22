/**
 * Contract: Ax Event Bus — Global topic pub/sub
 *
 * GlobalKey = "AX_EVENT_BUS" on globalThis.
 * API: emit, on, removeListener
 */

export const AX_EVENT_BUS_KEY = "AX_EVENT_BUS";

export interface AxEvent {
    /** Mendix widget name — filter events to correct instance */
    widgetId: string;
    payload?: Record<string, unknown>;
}

export interface AxEventBus {
    emit(topic: string, event: AxEvent): void;
    on(topic: string, handler: (event: AxEvent) => void): () => void;
    removeListener(topic: string, handler: (event: AxEvent) => void): void;
    clear(): void;
}

/** Factory — creates a new bus instance */
export function createBus(): AxEventBus;

/** Registers singleton on globalThis[AX_EVENT_BUS_KEY] */
export function initEventBus(): AxEventBus;

/** Returns singleton or undefined if not initialized */
export function getEventBus(): AxEventBus | undefined;

/** Convenience: getEventBus()?.emit(topic, event) */
export function emitEvent(topic: string, event: AxEvent): void;

/** Incoming command topics (Mendix → widget) */
export const AX_INCOMING_TOPICS = {
    REFRESH: "REFRESH",
    LOAD_DATA: "LOAD_DATA",
    EXPAND_ALL: "EXPAND_ALL",
    COLLAPSE_ALL: "COLLAPSE_ALL",
    ENTER_FULLSCREEN: "ENTER_FULLSCREEN",
    EXIT_FULLSCREEN: "EXIT_FULLSCREEN",
    ENTER_EXPAND_HEIGHT: "ENTER_EXPAND_HEIGHT",
    EXIT_EXPAND_HEIGHT: "EXIT_EXPAND_HEIGHT",
    TOGGLE_EXPAND_HEIGHT: "TOGGLE_EXPAND_HEIGHT",
    ZOOM_DAY: "ZOOM_DAY",
    ZOOM_WEEK: "ZOOM_WEEK",
    ZOOM_MONTH: "ZOOM_MONTH",
    SET_START_DATE: "SET_START_DATE",
    SET_END_DATE: "SET_END_DATE",
    SCROLL_TO_TODAY: "SCROLL_TO_TODAY",
    SCROLL_TO_TASK: "SCROLL_TO_TASK",
    FIT_TIMELINE: "FIT_TIMELINE",
    SHOW_GRID: "SHOW_GRID",
    HIDE_GRID: "HIDE_GRID",
    SHOW_TIMELINE: "SHOW_TIMELINE",
    HIDE_TIMELINE: "HIDE_TIMELINE",
    EXPORT_PDF: "EXPORT_PDF",
    EXPORT_PNG: "EXPORT_PNG",
    EXPORT_EXCEL: "EXPORT_EXCEL"
} as const;

export type AxIncomingTopic = (typeof AX_INCOMING_TOPICS)[keyof typeof AX_INCOMING_TOPICS];
