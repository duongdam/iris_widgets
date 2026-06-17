/** Mendix widget editing flags mapped to DHTMLX Gantt behavior. */
export interface GanttEditingConfig {
    allowCreate: boolean;
    allowUpdate: boolean;
    allowDelete: boolean;
    allowDrag: boolean;
    allowResize: boolean;
    readOnly: boolean;
}

export interface GanttEditingProps {
    allowDrag: boolean;
    allowResize: boolean;
    readOnly: boolean;
}

/** Create/update/delete are always enabled unless readOnly is set. */
export function createGanttEditingConfig(props: GanttEditingProps): GanttEditingConfig {
    return {
        allowCreate: true,
        allowUpdate: true,
        allowDelete: true,
        allowDrag: props.allowDrag,
        allowResize: props.allowResize,
        readOnly: props.readOnly
    };
}
