/**
 * This file was generated from AxTextArea.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";

export interface AxTextAreaContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    placeholder: string;
    rows: number;
    maxLength?: number;
    showCount: boolean;
    disabled: boolean;
    value?: EditableValue<string>;
    defaultValue?: EditableValue<string>;
    onChange?: ActionValue;
}

export interface AxTextAreaPreviewProps {
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
    rows: number | null;
    maxLength: number | null;
    showCount: boolean;
    disabled: boolean;
    value: string;
    defaultValue: string;
    onChange: {} | null;
}
