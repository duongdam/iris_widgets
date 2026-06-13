/**
 * This file was generated from AxNumberInput.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";
import { Big } from "big.js";

export interface AxNumberInputContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    disabled: boolean;
    value?: EditableValue<Big>;
    defaultValue?: EditableValue<Big>;
    onChange?: ActionValue;
}

export interface AxNumberInputPreviewProps {
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
    min: number | null;
    max: number | null;
    step: number | null;
    precision: number | null;
    disabled: boolean;
    value: string;
    defaultValue: string;
    onChange: {} | null;
}
