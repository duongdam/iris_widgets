import { reaction } from "mobx";
import { useEffect, useRef } from "react";
import type { GanttStore } from "../../stores/GanttStore";
import type { WidgetEventBridge } from "../services/WidgetEventBridge";

export function useSelectionBridge(store: GanttStore, bridge?: WidgetEventBridge): void {
    const bridgeRef = useRef(bridge);
    bridgeRef.current = bridge;

    useEffect(() => {
        // Selection is handled via click/double-click events only (TASK_CLICKED, TASK_DOUBLE_CLICKED).
        // Keep store.selectedTask for internal UI (e.g. tooltip), but do not emit a separate outgoing event.
        return reaction(
            () => store.selectedTask,
            () => undefined
        );
    }, [store, bridge]);
}
