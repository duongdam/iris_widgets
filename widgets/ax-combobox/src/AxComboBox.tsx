import { JSX } from "react";
import { ThemeProvider } from "@iris/chart-ui";
import { ComboBoxView } from "./main/components/ComboBoxView";
import type { AxComboBoxContainerProps, AxComboBoxProps } from "./typings/AxComboBoxProps";
import "./styles/ax-combobox.scss";

export function AxComboBox(props: AxComboBoxProps): JSX.Element {
    return (
        <ThemeProvider>
            <ComboBoxView widgetProps={props} />
        </ThemeProvider>
    );
}

export function AxComboBoxContainer(props: AxComboBoxContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
