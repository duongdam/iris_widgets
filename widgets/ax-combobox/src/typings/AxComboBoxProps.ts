import type { ActionValue, EditableValue, ListAttributeValue, ListValue } from "mendix";
import type { CSSProperties } from "react";

export type SelectionModeEnum = "single" | "multiple";

export interface AxComboBoxContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxComboBoxProps extends AxComboBoxContainerProps {
    datasource: ListValue;
    labelAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<string>;
    selectionMode: SelectionModeEnum;
    allowSelectAll: boolean;
    placeholder: string;
    disabled: boolean;
    selectedValue?: EditableValue<string>;
    selectedValues?: EditableValue<string>;
    defaultSelectedValues?: EditableValue<string>;
    onChange?: ActionValue;
}
