/**
 * This file was generated from AxInput.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";

export type UpdateOnEnum = "change" | "blur";

export interface AxInputContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    placeholder: string;
    maxLength?: number;
    disabled: boolean;
    allowClear: boolean;
    updateOn: UpdateOnEnum;
    value?: EditableValue<string>;
    defaultValue?: EditableValue<string>;
    onChange?: ActionValue;
}

export interface AxInputPreviewProps {
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
    placeholder: string;
    maxLength: number | null;
    disabled: boolean;
    allowClear: boolean;
    updateOn: UpdateOnEnum;
    value: string;
    defaultValue: string;
    onChange: {} | null;
}
