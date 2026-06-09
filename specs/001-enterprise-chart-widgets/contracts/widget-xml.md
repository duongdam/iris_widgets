# Widget XML Contract

All four widgets (`ax-barchart`, `ax-columnchart`, `ax-stackareachart`, `ax-reportchart`) share this property schema.

## Property Groups

### General

```xml
<property key="title" type="string" required="false" defaultValue="">
  <caption>Title</caption>
  <description>Chart title displayed above the chart</description>
</property>

<property key="height" type="integer" required="true" defaultValue="400">
  <caption>Height</caption>
  <description>Chart height in pixels</description>
</property>
```

### Data

```xml
<property key="jsonData" type="attribute" required="true">
  <caption>JSON Data</caption>
  <description>String attribute containing chart data as JSON</description>
  <attributeTypes>
    <attributeType name="String"/>
  </attributeTypes>
</property>

<property key="dataFormat" type="enumeration" required="true" defaultValue="flat">
  <caption>Data Format</caption>
  <description>Input data format</description>
  <enumerationValues>
    <enumerationValue key="flat">Flat</enumerationValue>
    <enumerationValue key="elastic">Elastic</enumerationValue>
  </enumerationValues>
</property>
```

### Display

```xml
<property key="showTitle" type="boolean" required="true" defaultValue="true">
  <caption>Show Title</caption>
  <description>Display the chart title header above the chart</description>
</property>

<property key="showLegend" type="boolean" required="true" defaultValue="true">
  <caption>Show Legend</caption>
  <description>Display the chart legend</description>
</property>

<property key="showTooltip" type="boolean" required="true" defaultValue="true">
  <caption>Show Tooltip</caption>
  <description>Display tooltips when hovering chart elements</description>
</property>
```

### Selection (writable)

```xml
<property key="selectedId" type="attribute" required="false">
  <caption>Selected ID</caption>
  <description>Writable string attribute for the selected record ID</description>
  <attributeTypes>
    <attributeType name="String"/>
  </attributeTypes>
</property>

<property key="selectedName" type="attribute" required="false">
  <caption>Selected Name</caption>
  <description>Writable string attribute for the selected record name</description>
  <attributeTypes>
    <attributeType name="String"/>
  </attributeTypes>
</property>

<property key="selectedPayload" type="attribute" required="false">
  <caption>Selected Payload</caption>
  <description>Complete selected ChartRecord as JSON string</description>
  <attributeTypes>
    <attributeType name="String"/>
  </attributeTypes>
</property>
```

### Events

```xml
<property key="onClick" type="action" required="false">
  <caption>On Click</caption>
  <description>Action executed when a chart element is clicked</description>
</property>

<property key="onSelectionChanged" type="action" required="false">
  <caption>On Selection Changed</caption>
  <description>Action executed when the chart selection changes</description>
</property>
```

## XML Schema Rules

- Use `defaultValue` (not `default`) on property attributes
- Every property MUST have `<caption>` and `<description>` in that order
- `<attributeTypes>` MUST come after `<description>`
- Properties with `defaultValue` for `boolean`, `integer`, and `enumeration` types MUST set `required="true"`

## Widget Registration

| Widget | XML file | React component | Preview component |
|--------|----------|-----------------|-------------------|
| ax-barchart | `AxBarChart.xml` | `AxBarChart` | `AxBarChartPreview` |
| ax-columnchart | `AxColumnChart.xml` | `AxColumnChart` | `AxColumnChartPreview` |
| ax-stackareachart | `AxStackAreaChart.xml` | `AxStackAreaChart` | `AxStackAreaChartPreview` |
| ax-reportchart | `AxReportChart.xml` | `AxReportChart` | `AxReportChartPreview` |

## Mendix Props TypeScript Interface

```typescript
import { ActionValue, EditableValue } from "@mendix/pluggable-widgets-tools";

export interface AxChartWidgetProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;

    title: string;
    height: number;

    jsonData: EditableValue<string>;
    dataFormat: "flat" | "elastic";

    showLegend: boolean;
    showTooltip: boolean;

    selectedId?: EditableValue<string>;
    selectedName?: EditableValue<string>;
    selectedPayload?: EditableValue<string>;

    onClick?: ActionValue;
    onSelectionChanged?: ActionValue;
}
```

## Constraints

- NO `datasource` property
- NO `object` or `association` data bindings for chart data
- Selection attributes MUST be writable String attributes
- `selectedPayload` MUST contain the full `ChartRecord` JSON with metadata intact
