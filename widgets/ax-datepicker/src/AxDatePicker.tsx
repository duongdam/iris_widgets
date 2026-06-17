import { JSX } from "react";
import { ThemeProvider } from "@iris/chart-ui";
import { DatePickerView } from "./main/components/DatePickerView";
import type { AxDatePickerContainerProps, AxDatePickerProps } from "./typings/AxDatePickerProps";
import "./styles/ax-datepicker.scss";

export function AxDatePicker(props: AxDatePickerProps): JSX.Element {
    return (
        <ThemeProvider>
            <DatePickerView widgetProps={props} />
        </ThemeProvider>
    );
}

export function AxDatePickerContainer(props: AxDatePickerContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
