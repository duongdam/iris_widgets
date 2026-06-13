/**
 * This file was generated from AxSwitch.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";

export interface AxSwitchContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    checkedLabel: string;
    uncheckedLabel: string;
    disabled: boolean;
    value?: EditableValue<boolean>;
    defaultValue?: EditableValue<boolean>;
    onChange?: ActionValue;
}

export interface AxSwitchPreviewProps {
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
    checkedLabel: string;
    uncheckedLabel: string;
    disabled: boolean;
    value: string;
    defaultValue: string;
    onChange: {} | null;
}
