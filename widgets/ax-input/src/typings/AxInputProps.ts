import type { ActionValue, EditableValue } from "mendix";
import type { CSSProperties } from "react";

export type UpdateOnEnum = "change" | "blur";

export interface AxInputContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxInputProps extends AxInputContainerProps {
    placeholder: string;
    maxLength?: number;
    disabled: boolean;
    allowClear: boolean;
    updateOn: UpdateOnEnum;
    value?: EditableValue<string>;
    defaultValue?: EditableValue<string>;
    onChange?: ActionValue;
}
