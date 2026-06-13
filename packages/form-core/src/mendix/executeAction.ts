import type { ActionValue } from "mendix";

/** Execute a Mendix action when allowed (nanoflow/microflow). Safe for offline. */
export function executeAction(action?: ActionValue): void {
    if (action?.canExecute && !action.isExecuting) {
        action.execute();
    }
}
