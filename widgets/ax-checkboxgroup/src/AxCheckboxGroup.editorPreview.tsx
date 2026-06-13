import { ThemeProvider } from "@iris/chart-ui";
import { createMockStringValue } from "@iris/form-core";
import { CheckboxGroupView } from "./main/components/CheckboxGroupView";
import { previewMockDatasource } from "./preview/previewConfig";
import type { AxCheckboxGroupProps } from "./typings/AxCheckboxGroupProps";
import "./styles/ax-checkboxgroup.scss";

const { datasource, labelAttribute, valueAttribute } = previewMockDatasource;

const previewProps: AxCheckboxGroupProps = {
    name: "ax-checkboxgroup-preview",
    class: "ax-checkboxgroup-preview",
    datasource,
    labelAttribute,
    valueAttribute,
    disabled: false,
    selectedValues: createMockStringValue(JSON.stringify(["Site1"])),
    defaultSelectedValues: createMockStringValue(JSON.stringify(["Site1"]))
};

export function preview(getProps: () => AxCheckboxGroupProps): JSX.Element {
    return (
        <ThemeProvider>
            <CheckboxGroupView widgetProps={{ ...previewProps, ...getProps() }} />
        </ThemeProvider>
    );
}

export function AxCheckboxGroupPreview(): JSX.Element {
    return preview(() => previewProps);
}
