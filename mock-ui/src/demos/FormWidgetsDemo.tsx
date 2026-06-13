import {
    createMockBooleanValue,
    createMockComboboxDatasource,
    createMockNumberValue,
    createMockStringValue,
    DIMENSION_MOCK_DATA,
} from "@iris/form-core";
import { ThemeProvider } from "@iris/chart-ui";
import { Divider, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { CheckboxGroupView } from "../../../widgets/ax-checkboxgroup/src/main/components/CheckboxGroupView";
import { InputView } from "../../../widgets/ax-input/src/main/components/InputView";
import { NumberInputView } from "../../../widgets/ax-numberinput/src/main/components/NumberInputView";
import { SwitchView } from "../../../widgets/ax-switch/src/main/components/SwitchView";
import { TextAreaView } from "../../../widgets/ax-textarea/src/main/components/TextAreaView";

const { Title, Text } = Typography;

export function FormWidgetsDemo(): JSX.Element {
    const [textValue, setTextValue] = useState("Hello Mendix");
    const [numberValue, setNumberValue] = useState(42);
    const [boolValue, setBoolValue] = useState(true);
    const [areaValue, setAreaValue] = useState("Multi-line\nnotes here");
    const [selectedValues, setSelectedValues] = useState(JSON.stringify(["Site1"]));

    const checkboxMock = useMemo(() => createMockComboboxDatasource(DIMENSION_MOCK_DATA.Site), []);

    return (
        <ThemeProvider>
            <div className="mock-ui-form-panel">
                <Title level={4}>Ant Design Form Widgets</Title>
                <Text type="secondary">
                    Phase 2 form widgets — Input, NumberInput, Switch, TextArea, CheckboxGroup. See also
                    Date Picker and Combo Box tabs.
                </Text>

                <Space direction="vertical" size="large" style={{ width: "100%", marginTop: 16 }}>
                    <section>
                        <Text strong>Ax Input</Text>
                        <InputView
                            widgetProps={{
                                name: "demo-input",
                                class: "demo-input",
                                placeholder: "Type here",
                                disabled: false,
                                allowClear: true,
                                updateOn: "change",
                                value: createMockStringValue(textValue, setTextValue),
                            }}
                        />
                        <pre className="mock-ui-selection-value">{textValue}</pre>
                    </section>

                    <Divider />

                    <section>
                        <Text strong>Ax Number Input</Text>
                        <NumberInputView
                            widgetProps={{
                                name: "demo-number",
                                class: "demo-number",
                                disabled: false,
                                value: createMockNumberValue(numberValue, (next) => setNumberValue(next ?? 0)),
                            }}
                        />
                        <pre className="mock-ui-selection-value">{numberValue}</pre>
                    </section>

                    <Divider />

                    <section>
                        <Text strong>Ax Switch</Text>
                        <SwitchView
                            widgetProps={{
                                name: "demo-switch",
                                class: "demo-switch",
                                disabled: false,
                                checkedLabel: "On",
                                uncheckedLabel: "Off",
                                value: createMockBooleanValue(boolValue, setBoolValue),
                            }}
                        />
                        <pre className="mock-ui-selection-value">{String(boolValue)}</pre>
                    </section>

                    <Divider />

                    <section>
                        <Text strong>Ax Text Area</Text>
                        <TextAreaView
                            widgetProps={{
                                name: "demo-textarea",
                                class: "demo-textarea",
                                placeholder: "Notes…",
                                rows: 4,
                                showCount: true,
                                disabled: false,
                                value: createMockStringValue(areaValue, setAreaValue),
                            }}
                        />
                        <pre className="mock-ui-selection-value">{areaValue}</pre>
                    </section>

                    <Divider />

                    <section>
                        <Text strong>Ax Checkbox Group</Text>
                        <CheckboxGroupView
                            widgetProps={{
                                name: "demo-checkboxgroup",
                                class: "demo-checkboxgroup",
                                disabled: false,
                                datasource: checkboxMock.datasource,
                                labelAttribute: checkboxMock.labelAttribute,
                                valueAttribute: checkboxMock.valueAttribute,
                                selectedValues: createMockStringValue(selectedValues, setSelectedValues),
                                defaultSelectedValues: createMockStringValue(JSON.stringify(["Site1"])),
                            }}
                        />
                        <pre className="mock-ui-selection-value">{selectedValues}</pre>
                    </section>
                </Space>
            </div>
        </ThemeProvider>
    );
}
