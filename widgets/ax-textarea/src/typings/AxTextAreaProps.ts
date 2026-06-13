import type { ActionValue, EditableValue } from "mendix";
import type { CSSProperties } from "react";

export interface AxTextAreaContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxTextAreaProps extends AxTextAreaContainerProps {
    placeholder: string;
    rows: number;
    maxLength?: number;
    showCount: boolean;
    disabled: boolean;
    value?: EditableValue<string>;
    defaultValue?: EditableValue<string>;
    onChange?: ActionValue;
}
