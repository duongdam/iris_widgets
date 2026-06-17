import { JSX } from "react";
import { ThemeProvider } from "@iris/chart-ui";
import type { EditableValue } from "mendix";
import { ComboBoxView } from "./main/components/ComboBoxView";
import { previewMockDatasource, PREVIEW_PLACEHOLDER } from "./preview/previewConfig";
import type { AxComboBoxProps } from "./typings/AxComboBoxProps";
import "./styles/ax-combobox.scss";

function createPreviewStringValue(initial: string): EditableValue<string> {
    let current = initial;
    return {
        value: current,
        status: "available",
        readOnly: false,
        displayValue: current,
        formatter: { format: (v: string) => v, parse: (v: string) => v },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: (next: string) => {
            current = next;
        },
        setValue: (next?: string) => {
            current = next ?? "";
        },
        isList: false as const,
        validation: undefined,
        universe: undefined
    } as unknown as EditableValue<string>;
}

const { datasource, labelAttribute, valueAttribute } = previewMockDatasource;

const previewProps: AxComboBoxProps = {
    name: "ax-combobox-preview",
    class: "ax-combobox-preview",
    datasource,
    labelAttribute,
    valueAttribute,
    selectionMode: "multiple",
    allowSelectAll: true,
    placeholder: PREVIEW_PLACEHOLDER,
    disabled: false,
    selectedValues: createPreviewStringValue(JSON.stringify(["Site1", "Site2", "Site3", "Site4", "Site5", "Site6"])),
    defaultSelectedValues: createPreviewStringValue(JSON.stringify(["Site1"]))
};

export function preview(getProps: () => AxComboBoxProps): JSX.Element {
    const props = { ...previewProps, ...getProps() };
    return (
        <ThemeProvider>
            <ComboBoxView widgetProps={props} />
        </ThemeProvider>
    );
}

export function AxComboBoxPreview(): JSX.Element {
    return preview(() => previewProps);
}
