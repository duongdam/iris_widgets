import type { ActionValue, EditableValue } from "mendix";
import type { CSSProperties } from "react";

export type PickerModeEnum = "date" | "week" | "month" | "year";

export interface AxDatePickerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export interface AxDatePickerProps extends AxDatePickerContainerProps {
    pickerMode: PickerModeEnum;
    placeholder: string;
    disabled: boolean;
    allowClear: boolean;
    selectedDate?: EditableValue<Date>;
    defaultDate?: EditableValue<Date>;
    onChange?: ActionValue;
}
