/** Mendix widget editing flags mapped to DHTMLX Gantt behavior. */
export interface GanttEditingConfig {
    allowCreate: boolean;
    allowUpdate: boolean;
    allowDelete: boolean;
    allowDrag: boolean;
    allowResize: boolean;
    readOnly: boolean;
}

/** Future appearance flags (plugins not yet wired). */
export interface GanttAppearanceConfig {
    showCriticalPath: boolean;
    showBaseline: boolean;
}
