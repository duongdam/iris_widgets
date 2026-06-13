/**
 * This file was generated from AxCheckboxGroup.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue } from "mendix";

export interface AxCheckboxGroupContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    datasource: ListValue;
    labelAttribute: ListAttributeValue<string>;
    valueAttribute: ListAttributeValue<string>;
    disabled: boolean;
    selectedValues?: EditableValue<string>;
    defaultSelectedValues?: EditableValue<string>;
    onChange?: ActionValue;
}

export interface AxCheckboxGroupPreviewProps {
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
    disabled: boolean;
    selectedValues: string;
    defaultSelectedValues: string;
    onChange: {} | null;
}
