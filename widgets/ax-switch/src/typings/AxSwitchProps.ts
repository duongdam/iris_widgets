import type { ActionValue, EditableValue } from "mendix";
import type { CSSProperties } from "react";

export interface AxSwitchContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxSwitchProps extends AxSwitchContainerProps {
    checkedLabel: string;
    uncheckedLabel: string;
    disabled: boolean;
    value?: EditableValue<boolean>;
    defaultValue?: EditableValue<boolean>;
    onChange?: ActionValue;
}
