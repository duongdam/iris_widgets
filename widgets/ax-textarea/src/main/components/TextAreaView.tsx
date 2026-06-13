import {
    executeAction,
    getValidationMessage,
    isFieldDisabled,
    resolveStringValue,
    updateEditableValue,
} from "@iris/form-core";
import { Input } from "antd";
import { useCallback, useMemo } from "react";
import type { AxTextAreaProps } from "../../typings/AxTextAreaProps";

export interface TextAreaViewProps {
    widgetProps: AxTextAreaProps;
}

export function TextAreaView({ widgetProps }: TextAreaViewProps): JSX.Element {
    const { placeholder, rows, maxLength, showCount, disabled, value, defaultValue, onChange } = widgetProps;

    const displayValue = useMemo(() => resolveStringValue(value, defaultValue), [defaultValue, value]);
    const fieldDisabled = isFieldDisabled(disabled, value);
    const validationMessage = getValidationMessage(value);

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (updateEditableValue(value, event.target.value)) {
                executeAction(onChange);
            }
        },
        [onChange, value]
    );

    return (
        <div className="ax-textarea">
            <Input.TextArea
                style={{ width: "100%" }}
                placeholder={placeholder || undefined}
                rows={rows}
                maxLength={maxLength}
                showCount={showCount}
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
