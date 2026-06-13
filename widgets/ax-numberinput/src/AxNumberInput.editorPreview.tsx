import { ThemeProvider } from "@iris/chart-ui";
import { createMockNumberValue } from "@iris/form-core";
import { NumberInputView } from "./main/components/NumberInputView";
import type { AxNumberInputProps } from "./typings/AxNumberInputProps";
import "./styles/ax-numberinput.scss";

const previewProps: AxNumberInputProps = {
    name: "ax-numberinput-preview",
    class: "ax-numberinput-preview",
    min: 0,
    max: 100,
    step: 1,
    precision: 0,
    disabled: false,
    value: createMockNumberValue(42)
};

export function preview(getProps: () => AxNumberInputProps): JSX.Element {
    return (
        <ThemeProvider>
            <NumberInputView widgetProps={{ ...previewProps, ...getProps() }} />
        </ThemeProvider>
    );
}

export function AxNumberInputPreview(): JSX.Element {
    return preview(() => previewProps);
}
