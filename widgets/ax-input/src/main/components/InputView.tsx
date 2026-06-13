import {
    executeAction,
    getValidationMessage,
    isFieldDisabled,
    resolveStringValue,
    updateEditableValue,
} from "@iris/form-core";
import { Input } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AxInputProps } from "../../typings/AxInputProps";

export interface InputViewProps {
    widgetProps: AxInputProps;
}

export function InputView({ widgetProps }: InputViewProps): JSX.Element {
    const { placeholder, maxLength, disabled, allowClear, updateOn, value, defaultValue, onChange } = widgetProps;

    const externalValue = useMemo(() => resolveStringValue(value, defaultValue), [defaultValue, value]);

    const [draft, setDraft] = useState(externalValue);

    useEffect(() => {
        setDraft(externalValue);
    }, [externalValue]);

    const displayValue = updateOn === "change" ? externalValue : draft;
    const fieldDisabled = isFieldDisabled(disabled, value);
    const validationMessage = getValidationMessage(value);

    const commit = useCallback(
        (next: string) => {
            if (updateEditableValue(value, next)) {
                executeAction(onChange);
            }
        },
        [onChange, value]
    );

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const next = event.target.value;
            if (updateOn === "change") {
                commit(next);
            } else {
                setDraft(next);
            }
        },
        [commit, updateOn]
    );

    const handleBlur = useCallback(() => {
        if (updateOn === "blur") {
            commit(draft);
        }
    }, [commit, draft, updateOn]);

    return (
        <div className="ax-input">
            <Input
                style={{ width: "100%" }}
                placeholder={placeholder || undefined}
                disabled={fieldDisabled}
                allowClear={allowClear}
                maxLength={maxLength}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
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
