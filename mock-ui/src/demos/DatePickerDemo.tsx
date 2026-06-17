import { Segmented, Space, Typography } from "antd";
import type { EditableValue } from "mendix";
import { JSX, useMemo, useState } from "react";
import { DatePickerView } from "../../../widgets/ax-datepicker/src/main/components/DatePickerView";
import type { PickerModeEnum } from "../../../widgets/ax-datepicker/src/typings/AxDatePickerProps";
import { ThemeProvider } from "@iris/chart-ui";

const { Text, Title } = Typography;

function createMockDateValue(
    value: Date | undefined,
    onChange: (next: Date | undefined) => void
): EditableValue<Date> {
    return {
        value,
        status: "available",
        readOnly: false,
        displayValue: value?.toISOString() ?? "",
        formatter: {
            format: (v: Date) => v.toISOString(),
            parse: (v: string) => new Date(v),
        },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: () => undefined,
        setValue: (next?: Date) => onChange(next),
        isList: false as const,
        validation: undefined,
        universe: undefined,
    } as unknown as EditableValue<Date>;
}

export function DatePickerDemo(): JSX.Element {
    const [pickerMode, setPickerMode] = useState<PickerModeEnum>("date");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2026, 5, 13));

    const selectedDateField = useMemo(
        () => createMockDateValue(selectedDate, setSelectedDate),
        [selectedDate]
    );

    const defaultDateField = useMemo(
        () => createMockDateValue(new Date(2026, 5, 1), () => undefined),
        []
    );

    return (
        <ThemeProvider>
            <div className="mock-ui-form-panel">
                <Title level={4}>Ax Date Picker</Title>
                <Text type="secondary">
                    Ant Design DatePicker with date, week, month, and year modes. Selection writes to
                    mock Mendix DateTime attribute.
                </Text>

                <Space direction="vertical" size="middle" style={{ width: "100%", marginTop: 16 }}>
                    <div>
                        <Text strong>Picker mode</Text>
                        <Segmented
                            block
                            value={pickerMode}
                            onChange={value => setPickerMode(value as PickerModeEnum)}
                            options={[
                                { label: "Date", value: "date" },
                                { label: "Week", value: "week" },
                                { label: "Month", value: "month" },
                                { label: "Year", value: "year" },
                            ]}
                            style={{ marginTop: 8 }}
                        />
                    </div>

                    <DatePickerView
                        widgetProps={{
                            name: "mock-datepicker",
                            class: "mock-datepicker",
                            pickerMode,
                            placeholder: "Select a date",
                            disabled: false,
                            allowClear: true,
                            selectedDate: selectedDateField,
                            defaultDate: defaultDateField,
                        }}
                    />

                    <div className="mock-ui-selection">
                        <Text type="secondary">selectedDate (ISO)</Text>
                        <pre>{selectedDate?.toISOString() ?? "—"}</pre>
                    </div>
                </Space>
            </div>
        </ThemeProvider>
    );
}
