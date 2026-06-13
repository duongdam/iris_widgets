/**
 * This file was generated from AxDatePicker.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";

export type PickerModeEnum = "date" | "week" | "month" | "year";

export interface AxDatePickerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    pickerMode: PickerModeEnum;
    placeholder: string;
    disabled: boolean;
    allowClear: boolean;
    selectedDate?: EditableValue<Date>;
    defaultDate?: EditableValue<Date>;
    onChange?: ActionValue;
}

export interface AxDatePickerPreviewProps {
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
    pickerMode: PickerModeEnum;
    placeholder: string;
    disabled: boolean;
    allowClear: boolean;
    selectedDate: string;
    defaultDate: string;
    onChange: {} | null;
}
