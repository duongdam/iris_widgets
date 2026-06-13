import { ThemeProvider } from "@iris/chart-ui";
import { createMockStringValue } from "@iris/form-core";
import { InputView } from "./main/components/InputView";
import { PREVIEW_PLACEHOLDER } from "./preview/previewConfig";
import type { AxInputProps } from "./typings/AxInputProps";
import "./styles/ax-input.scss";

const previewProps: AxInputProps = {
    name: "ax-input-preview",
    class: "ax-input-preview",
    placeholder: PREVIEW_PLACEHOLDER,
    disabled: false,
    allowClear: true,
    updateOn: "change",
    value: createMockStringValue("Preview value")
};

export function preview(getProps: () => AxInputProps): JSX.Element {
    return (
        <ThemeProvider>
            <InputView widgetProps={{ ...previewProps, ...getProps() }} />
        </ThemeProvider>
    );
}

export function AxInputPreview(): JSX.Element {
    return preview(() => previewProps);
}
