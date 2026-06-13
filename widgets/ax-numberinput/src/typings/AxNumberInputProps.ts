import type { Big } from "big.js";
import type { ActionValue, EditableValue } from "mendix";
import type { CSSProperties } from "react";

export interface AxNumberInputContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxNumberInputProps extends AxNumberInputContainerProps {
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    disabled: boolean;
    value?: EditableValue<Big>;
    defaultValue?: EditableValue<Big>;
    onChange?: ActionValue;
}
