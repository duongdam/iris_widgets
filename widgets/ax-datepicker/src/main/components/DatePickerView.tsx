import {
    convertPickerDateToMendix,
    executeAction,
    getValidationMessage,
    isFieldDisabled,
    resolveDateValue,
    updateEditableValue,
} from "@iris/form-core";
import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useCallback, useMemo } from "react";
import type { AxDatePickerProps } from "../../typings/AxDatePickerProps";

dayjs.extend(weekOfYear);

function toDayjs(value: Date | undefined): Dayjs | null {
    return value ? dayjs(value) : null;
}

export interface DatePickerViewProps {
    widgetProps: AxDatePickerProps;
}

export function DatePickerView({ widgetProps }: DatePickerViewProps): JSX.Element {
    const { pickerMode, placeholder, disabled, allowClear, selectedDate, defaultDate, onChange } = widgetProps;

    const resolvedDate = useMemo(
        () => resolveDateValue(selectedDate, defaultDate),
        [defaultDate, selectedDate]
    );
    const currentValue = useMemo(() => toDayjs(resolvedDate), [resolvedDate]);
    const fieldDisabled = isFieldDisabled(disabled, selectedDate);
    const validationMessage = getValidationMessage(selectedDate);

    const handleChange = useCallback(
        (value: Dayjs | null) => {
            const next = value == null ? undefined : convertPickerDateToMendix(value, pickerMode);
            if (updateEditableValue(selectedDate, next)) {
                executeAction(onChange);
            }
        },
        [onChange, pickerMode, selectedDate]
    );

    return (
        <div className="ax-datepicker">
            <DatePicker
                picker={pickerMode}
                style={{ width: "100%" }}
                placeholder={placeholder || undefined}
                disabled={fieldDisabled}
                allowClear={allowClear}
                value={currentValue}
                onChange={handleChange}
                status={validationMessage ? "error" : undefined}
            />
            {validationMessage ? (
                <div className="ax-field-validation" role="alert">
                    {validationMessage}
                </div>
            ) : null}
        </div>
    );
}
