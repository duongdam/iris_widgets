import { createMockComboboxDatasource, DIMENSION_MOCK_DATA } from "@iris/form-core";
import { ThemeProvider } from "@iris/chart-ui";
import { Space, Switch, Typography } from "antd";
import type { EditableValue } from "mendix";
import { useMemo, useState } from "react";
import { ComboBoxView } from "../../../widgets/ax-combobox/src/main/components/ComboBoxView";
import type { SelectionModeEnum } from "../../../widgets/ax-combobox/src/typings/AxComboBoxProps";

const { Text, Title } = Typography;

function createMockStringValue(
    value: string,
    onChange: (next: string) => void
): EditableValue<string> {
    return {
        value,
        status: "available",
        readOnly: false,
        displayValue: value,
        formatter: { format: (v: string) => v, parse: (v: string) => v },
        setFormatter: () => undefined,
        setValidator: () => undefined,
        setTextValue: onChange,
        setValue: onChange,
        isList: false as const,
        validation: undefined,
        universe: undefined,
    } as unknown as EditableValue<string>;
}

export function ComboBoxDemo(): JSX.Element {
    const [selectionMode, setSelectionMode] = useState<SelectionModeEnum>("multiple");
    const [allowSelectAll, setAllowSelectAll] = useState(true);
    const [selectedValue, setSelectedValue] = useState("");
    const [selectedValues, setSelectedValues] = useState(JSON.stringify(["Site1"]));

    const mockDatasource = useMemo(
        () => createMockComboboxDatasource(DIMENSION_MOCK_DATA.Site),
        []
    );

    const selectedValueField = useMemo(
        () => createMockStringValue(selectedValue, setSelectedValue),
        [selectedValue]
    );

    const selectedValuesField = useMemo(
        () => createMockStringValue(selectedValues, setSelectedValues),
        [selectedValues]
    );

    const defaultSelectedValuesField = useMemo(
        () => createMockStringValue(JSON.stringify(["Site1"]), () => undefined),
        []
    );

    return (
        <ThemeProvider>
            <div className="mock-ui-form-panel">
                <Title level={4}>Ax Combo Box</Title>
                <Text type="secondary">
                    Ant Design Select bound to mock ListValue datasource (Site1–Site3). Toggle single/multi
                    and select-all behavior.
                </Text>

                <Space direction="vertical" size="middle" style={{ width: "100%", marginTop: 16 }}>
                    <div className="mock-ui-toggle-row">
                        <Text strong>Multiple selection</Text>
                        <Switch
                            checked={selectionMode === "multiple"}
                            onChange={checked =>
                                setSelectionMode(checked ? "multiple" : "single")
                            }
                        />
                    </div>
                    <div className="mock-ui-toggle-row">
                        <Text strong>Allow select all</Text>
                        <Switch
                            checked={allowSelectAll}
                            disabled={selectionMode !== "multiple"}
                            onChange={setAllowSelectAll}
                        />
                    </div>

                    <ComboBoxView
                        widgetProps={{
                            name: "mock-combobox",
                            class: "mock-combobox",
                            datasource: mockDatasource.datasource,
                            labelAttribute: mockDatasource.labelAttribute,
                            valueAttribute: mockDatasource.valueAttribute,
                            selectionMode,
                            allowSelectAll,
                            placeholder: "Select site",
                            disabled: false,
                            selectedValue: selectedValueField,
                            selectedValues: selectedValuesField,
                            defaultSelectedValues: defaultSelectedValuesField,
                        }}
                    />

                    <div className="mock-ui-selection">
                        <Text type="secondary">
                            {selectionMode === "multiple" ? "selectedValues (JSON)" : "selectedValue"}
                        </Text>
                        <pre>
                            {selectionMode === "multiple" ? selectedValues || "[]" : selectedValue || "—"}
                        </pre>
                    </div>
                </Space>
            </div>
        </ThemeProvider>
    );
}
