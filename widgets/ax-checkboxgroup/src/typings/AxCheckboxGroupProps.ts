import type { ActionValue, EditableValue, ListAttributeValue, ListValue } from "mendix";
import type { CSSProperties } from "react";

export interface AxCheckboxGroupContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxCheckboxGroupProps extends AxCheckboxGroupContainerProps {
    datasource: ListValue;
    labelAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<string>;
    disabled: boolean;
    selectedValues?: EditableValue<string>;
    defaultSelectedValues?: EditableValue<string>;
    onChange?: ActionValue;
}
