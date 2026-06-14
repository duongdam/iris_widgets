import { ThemeProvider } from "@iris/chart-ui";
import { Button, Divider, Select, Space, Typography } from "antd";
import { useCallback, useMemo, useState } from "react";
import { DIMENSION_TYPES, getOptionsForDimension } from "../mocks/comboboxDimensions";
import "../../../widgets/ax-combobox/src/styles/ax-combobox.scss";

const { Text, Title, Paragraph } = Typography;

const selectPopupClass = { popup: { root: "ax-combobox__dropdown" } };

export function CascadingComboboxDemo(): JSX.Element {
    const [activeDimensions, setActiveDimensions] = useState<string[]>(["Site"]);
    const [selections, setSelections] = useState<Record<string, string[]>>({ Site: ["Site1"] });

    const dimensionOptions = useMemo(
        () => DIMENSION_TYPES.map(type => ({ value: type, label: type })),
        []
    );

    const handleDimensionChange = useCallback((values: string[]) => {
        setActiveDimensions(values);
        setSelections(current => {
            const next: Record<string, string[]> = {};
            values.forEach(dimension => {
                next[dimension] = current[dimension] ?? [];
            });
            return next;
        });
    }, []);

    const handleDimensionSelectionChange = useCallback((dimension: string, values: string[]) => {
        setSelections(current => ({ ...current, [dimension]: values }));
    }, []);

    const renderDependentSelect = (dimension: string): JSX.Element => {
        const options = getOptionsForDimension(dimension);
        const selected = selections[dimension] ?? [];
        const allSelected = options.length > 0 && selected.length === options.length;

        return (
            <div key={dimension} className="mock-ui-cascading-row ax-combobox">
                <Text strong>{dimension}</Text>
                <Select
                    mode="multiple"
                    style={{ width: "100%", marginTop: 8 }}
                    classNames={selectPopupClass}
                    placeholder={`Select ${dimension} values`}
                    options={options}
                    value={selected}
                    onChange={values => handleDimensionSelectionChange(dimension, values)}
                    popupRender={menu => (
                        <>
                            <div style={{ padding: "4px 8px 0" }}>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() =>
                                        handleDimensionSelectionChange(
                                            dimension,
                                            allSelected ? [] : options.map(option => option.value)
                                        )
                                    }
                                >
                                    {allSelected ? "Deselect all" : "Select all"}
                                </Button>
                            </div>
                            <Divider style={{ margin: "4px 0" }} />
                            {menu}
                        </>
                    )}
                />
            </div>
        );
    };

    return (
        <ThemeProvider>
            <div className="mock-ui-form-panel">
                <Title level={4}>Cascading Combo Boxes</Title>
                <Paragraph type="secondary">
                    Combobox A selects dimension types. Each selected dimension reveals a dependent combobox
                    with fake values (Site1, Team1, …). In Mendix, wire each ax-combobox onChange to refresh
                    downstream datasource constraints via microflow/nanoflow.
                </Paragraph>

                <Space direction="vertical" size="large" style={{ width: "100%", marginTop: 16 }}>
                    <div className="ax-combobox">
                        <Text strong>Combobox A — Dimension types</Text>
                        <Select
                            mode="multiple"
                            style={{ width: "100%", marginTop: 8 }}
                            classNames={selectPopupClass}
                            placeholder="Select dimensions"
                        options={dimensionOptions}
                        value={activeDimensions}
                        onChange={handleDimensionChange}
                        popupRender={menu => (
                            <>
                                <div style={{ padding: "4px 8px 0" }}>
                                    <Button
                                        type="link"
                                        size="small"
                                        onClick={() => {
                                            const allValues = DIMENSION_TYPES.slice();
                                            const allSelected =
                                                activeDimensions.length === allValues.length;
                                            handleDimensionChange(allSelected ? [] : allValues);
                                        }}
                                    >
                                        {activeDimensions.length === DIMENSION_TYPES.length
                                            ? "Deselect all"
                                            : "Select all"}
                                    </Button>
                                </div>
                                <Divider style={{ margin: "4px 0" }} />
                                {menu}
                            </>
                        )}
                    />
                </div>

                {activeDimensions.length === 0 ? (
                    <Text type="secondary">Select at least one dimension in Combobox A.</Text>
                ) : (
                    activeDimensions.map(renderDependentSelect)
                )}

                <div className="mock-ui-selection">
                    <Text type="secondary">Current selections (JSON)</Text>
                    <pre>{JSON.stringify(selections, null, 2)}</pre>
                </div>
            </Space>
            </div>
        </ThemeProvider>
    );
}
