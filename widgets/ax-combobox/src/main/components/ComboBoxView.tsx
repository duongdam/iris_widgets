import {
    executeAction,
    getValidationMessage,
    isFieldDisabled,
    isValueReady,
    parseJsonArray,
    updateEditableValue,
} from "@iris/form-core";
import { Button, Divider, Select, Tooltip } from "antd";
import { useCallback, useMemo, type ReactElement } from "react";
import type { AxComboBoxProps } from "../../typings/AxComboBoxProps";
import { useComboboxDatasource } from "../hooks/useComboboxDatasource";

export interface ComboBoxViewProps {
    widgetProps: AxComboBoxProps;
}

/** Visible tags before collapsing the rest as "+N". */
const MULTIPLE_MAX_TAG_COUNT = 1;

function renderMaxTagPlaceholder(omittedValues: Array<{ label?: React.ReactNode }>): React.ReactNode {
    const hiddenLabels = omittedValues
        .map(item => (typeof item.label === "string" ? item.label : String(item.label ?? "")))
        .join(", ");

    return (
        <Tooltip title={hiddenLabels}>
            <span className="ax-combobox__max-tag">+{omittedValues.length}</span>
        </Tooltip>
    );
}

function resolveSingleValue(
    selectedValue: AxComboBoxProps["selectedValue"],
    defaultValues: string[]
): string | undefined {
    if (isValueReady(selectedValue)) {
        const current = selectedValue!.value;
        return current != null && current !== "" ? current : undefined;
    }
    return defaultValues[0];
}

function resolveMultipleValues(
    selectedValues: AxComboBoxProps["selectedValues"],
    defaultValues: string[]
): string[] {
    if (isValueReady(selectedValues)) {
        return parseJsonArray(selectedValues!.value);
    }
    return defaultValues;
}

export function ComboBoxView({ widgetProps }: ComboBoxViewProps): JSX.Element {
    const {
        selectionMode,
        allowSelectAll,
        placeholder,
        disabled,
        selectedValue,
        selectedValues,
        defaultSelectedValues,
        onChange,
    } = widgetProps;

    const { options, loading } = useComboboxDatasource(widgetProps);
    const isMultiple = selectionMode === "multiple";

    const defaultValues = useMemo(() => parseJsonArray(defaultSelectedValues?.value), [defaultSelectedValues?.value]);

    const singleValue = useMemo(
        () => resolveSingleValue(selectedValue, defaultValues),
        [defaultValues, selectedValue]
    );

    const multipleValue = useMemo(
        () => resolveMultipleValues(selectedValues, defaultValues),
        [defaultValues, selectedValues]
    );

    const writeTarget = isMultiple ? selectedValues : selectedValue;
    const fieldDisabled = isFieldDisabled(disabled, writeTarget);
    const validationMessage = getValidationMessage(writeTarget);

    const allSelected = isMultiple && options.length > 0 && multipleValue.length === options.length;

    const writeBack = useCallback(
        (next: string | string[] | undefined) => {
            let didWrite = false;
            if (isMultiple) {
                const values = Array.isArray(next) ? next : next != null && next !== "" ? [next] : [];
                didWrite = updateEditableValue(selectedValues, JSON.stringify(values));
            } else {
                const scalar = Array.isArray(next) ? next[0] : next;
                didWrite = updateEditableValue(selectedValue, scalar != null && scalar !== "" ? scalar : undefined);
            }
            if (didWrite) {
                executeAction(onChange);
            }
        },
        [isMultiple, onChange, selectedValue, selectedValues]
    );

    const handleChange = useCallback(
        (value: string | string[] | undefined) => {
            writeBack(value);
        },
        [writeBack]
    );

    const handleSelectAll = useCallback(() => {
        const next = allSelected ? [] : options.map(option => option.value);
        writeBack(next);
    }, [allSelected, options, writeBack]);

    const dropdownRender = useCallback(
        (menu: ReactElement) => {
            if (!isMultiple || !allowSelectAll || options.length === 0) {
                return menu;
            }

            return (
                <>
                    <div className="ax-combobox__select-all">
                        <Button type="link" size="small" onClick={handleSelectAll}>
                            {allSelected ? "Deselect all" : "Select all"}
                        </Button>
                    </div>
                    <Divider style={{ margin: "4px 0" }} />
                    {menu}
                </>
            );
        },
        [allSelected, allowSelectAll, handleSelectAll, isMultiple, options.length]
    );

    return (
        <div className="ax-combobox">
            <Select
                style={{ width: "100%" }}
                classNames={{ popup: { root: "ax-combobox__dropdown" } }}
                mode={isMultiple ? "multiple" : undefined}
                placeholder={placeholder || undefined}
                disabled={fieldDisabled}
                loading={loading}
                allowClear
                showSearch
                optionFilterProp="label"
                options={options}
                value={isMultiple ? multipleValue : singleValue}
                onChange={handleChange}
                dropdownRender={dropdownRender}
                virtual={options.length > 100}
                maxTagCount={isMultiple ? MULTIPLE_MAX_TAG_COUNT : undefined}
                maxTagPlaceholder={isMultiple ? renderMaxTagPlaceholder : undefined}
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
