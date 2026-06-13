/**
 * This file was generated from AxComboBox.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";

export type SelectionModeEnum = "single" | "multiple";

export interface AxComboBoxContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
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

export interface AxComboBoxPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    datasource: {} | { caption: string } | { type: string } | null;
    labelAttribute: string;
    valueAttribute: string;
    selectionMode: SelectionModeEnum;
    allowSelectAll: boolean;
    placeholder: string;
    disabled: boolean;
    selectedValue: string;
    selectedValues: string;
    defaultSelectedValues: string;
    onChange: {} | null;
}
