import { Checkbox } from "antd";
import { parseJsonArray } from "@iris/form-core";
import { useCallback, useMemo } from "react";
import type { ActionValue } from "mendix";
import type { AxCheckboxGroupProps } from "../../typings/AxCheckboxGroupProps";
import { useCheckboxGroupDatasource } from "../hooks/useCheckboxGroupDatasource";

function fireOnChange(onChange?: ActionValue): void {
    if (onChange?.canExecute && !onChange.isExecuting) {
        onChange.execute();
    }
}

export interface CheckboxGroupViewProps {
    widgetProps: AxCheckboxGroupProps;
}

export function CheckboxGroupView({ widgetProps }: CheckboxGroupViewProps): JSX.Element {
    const { disabled, selectedValues, defaultSelectedValues, onChange } = widgetProps;

    const { options, loading } = useCheckboxGroupDatasource(widgetProps);

    const defaultValues = useMemo(() => parseJsonArray(defaultSelectedValues?.value), [defaultSelectedValues?.value]);

    const currentValues = useMemo(() => {
        const current = parseJsonArray(selectedValues?.value);
        if (current.length > 0) {
            return current;
        }
        return defaultValues;
    }, [defaultValues, selectedValues?.value]);

    const handleChange = useCallback(
        (next: string[]) => {
            selectedValues?.setValue?.(JSON.stringify(next));
            fireOnChange(onChange);
        },
        [onChange, selectedValues]
    );

    return (
        <div className="ax-checkboxgroup">
            <Checkbox.Group
                style={{ width: "100%" }}
                options={options}
                value={currentValues}
                disabled={disabled || loading}
                onChange={handleChange}
            />
        </div>
    );
}
