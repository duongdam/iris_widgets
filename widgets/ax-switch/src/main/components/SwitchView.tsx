import {
    executeAction,
    getValidationMessage,
    isFieldDisabled,
    resolveBooleanValue,
    updateEditableValue,
} from "@iris/form-core";
import { Switch } from "antd";
import { useCallback, useMemo } from "react";
import type { AxSwitchProps } from "../../typings/AxSwitchProps";

export interface SwitchViewProps {
    widgetProps: AxSwitchProps;
}

export function SwitchView({ widgetProps }: SwitchViewProps): JSX.Element {
    const { checkedLabel, uncheckedLabel, disabled, value, defaultValue, onChange } = widgetProps;

    const checked = useMemo(() => resolveBooleanValue(value, defaultValue), [defaultValue, value]);
    const fieldDisabled = isFieldDisabled(disabled, value);
    const validationMessage = getValidationMessage(value);

    const handleChange = useCallback(
        (next: boolean) => {
            if (updateEditableValue(value, next)) {
                executeAction(onChange);
            }
        },
        [onChange, value]
    );

    return (
        <div className="ax-switch">
            <Switch
                checked={checked}
                disabled={fieldDisabled}
                checkedChildren={checkedLabel || undefined}
                unCheckedChildren={uncheckedLabel || undefined}
                onChange={handleChange}
            />
            {validationMessage ? (
                <div className="ax-field-validation" role="alert">
                    {validationMessage}
                </div>
            ) : null}
        </div>
    );
}
