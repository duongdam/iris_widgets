import { JSX } from "react";
import { ThemeProvider } from "@iris/chart-ui";
import type { EditableValue } from "mendix";
import { DatePickerView } from "./main/components/DatePickerView";
import { PREVIEW_DEFAULT_DATE, PREVIEW_PLACEHOLDER } from "./preview/previewConfig";
import type { AxDatePickerProps } from "./typings/AxDatePickerProps";
import "./styles/ax-datepicker.scss";

function createPreviewDateValue(value: Date): EditableValue<Date> {
    let current = value;
    return {
        value: current,
        status: "available",
        readOnly: false,
        displayValue: current.toISOString(),
        formatter: {
            format: (v: Date) => v.toISOString(),
            parse: (v: string) => new Date(v)
        },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: () => undefined,
        setValue: (next?: Date) => {
            current = next ?? current;
        },
        isList: false as const,
        validation: undefined,
        universe: undefined
    } as unknown as EditableValue<Date>;
}

const previewProps: AxDatePickerProps = {
    name: "ax-datepicker-preview",
    class: "ax-datepicker-preview",
    pickerMode: "date",
    placeholder: PREVIEW_PLACEHOLDER,
    disabled: false,
    allowClear: true,
    selectedDate: createPreviewDateValue(PREVIEW_DEFAULT_DATE),
    defaultDate: createPreviewDateValue(PREVIEW_DEFAULT_DATE)
};

export function preview(getProps: () => AxDatePickerProps): JSX.Element {
    const props = { ...previewProps, ...getProps() };
    return (
        <ThemeProvider>
            <DatePickerView widgetProps={props} />
        </ThemeProvider>
    );
}

export function AxDatePickerPreview(): JSX.Element {
    return preview(() => previewProps);
}
