import { ThemeProvider } from "@iris/chart-ui";
import { createMockBooleanValue } from "@iris/form-core";
import { SwitchView } from "./main/components/SwitchView";
import { PREVIEW_CHECKED_LABEL, PREVIEW_UNCHECKED_LABEL } from "./preview/previewConfig";
import type { AxSwitchProps } from "./typings/AxSwitchProps";
import "./styles/ax-switch.scss";

const previewProps: AxSwitchProps = {
    name: "ax-switch-preview",
    class: "ax-switch-preview",
    checkedLabel: PREVIEW_CHECKED_LABEL,
    uncheckedLabel: PREVIEW_UNCHECKED_LABEL,
    disabled: false,
    value: createMockBooleanValue(true)
};

export function preview(getProps: () => AxSwitchProps): JSX.Element {
    return (
        <ThemeProvider>
            <SwitchView widgetProps={{ ...previewProps, ...getProps() }} />
        </ThemeProvider>
    );
}

export function AxSwitchPreview(): JSX.Element {
    return preview(() => previewProps);
}
