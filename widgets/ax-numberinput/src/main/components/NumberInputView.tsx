import {
    convertNumberToBig,
    executeAction,
    getValidationMessage,
    isFieldDisabled,
    resolveNumericValue,
    updateEditableValue,
} from "@iris/form-core";
import { InputNumber } from "antd";
import { useCallback, useMemo } from "react";
import type { AxNumberInputProps } from "../../typings/AxNumberInputProps";

export interface NumberInputViewProps {
    widgetProps: AxNumberInputProps;
}

export function NumberInputView({ widgetProps }: NumberInputViewProps): JSX.Element {
    const { min, max, step, precision, disabled, value, defaultValue, onChange } = widgetProps;

    const displayValue = useMemo(() => resolveNumericValue(value, defaultValue), [defaultValue, value]);
    const fieldDisabled = isFieldDisabled(disabled, value);
    const validationMessage = getValidationMessage(value);

    const handleChange = useCallback(
        (next: number | null) => {
            if (updateEditableValue(value, convertNumberToBig(next))) {
                executeAction(onChange);
            }
        },
        [onChange, value]
    );

    return (
        <div className="ax-numberinput">
            <InputNumber
                style={{ width: "100%" }}
                min={min}
                max={max}
                step={step}
                precision={precision}
                disabled={fieldDisabled}
                value={displayValue}
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
