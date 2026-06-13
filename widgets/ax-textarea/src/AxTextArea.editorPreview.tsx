import { ThemeProvider } from "@iris/chart-ui";
import { createMockStringValue } from "@iris/form-core";
import { TextAreaView } from "./main/components/TextAreaView";
import { PREVIEW_PLACEHOLDER } from "./preview/previewConfig";
import type { AxTextAreaProps } from "./typings/AxTextAreaProps";
import "./styles/ax-textarea.scss";

const previewProps: AxTextAreaProps = {
    name: "ax-textarea-preview",
    class: "ax-textarea-preview",
    placeholder: PREVIEW_PLACEHOLDER,
    rows: 4,
    showCount: true,
    disabled: false,
    value: createMockStringValue("Preview text area content")
};

export function preview(getProps: () => AxTextAreaProps): JSX.Element {
    return (
        <ThemeProvider>
            <TextAreaView widgetProps={{ ...previewProps, ...getProps() }} />
        </ThemeProvider>
    );
}

export function AxTextAreaPreview(): JSX.Element {
    return preview(() => previewProps);
}
