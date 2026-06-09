# Widget XML Contract: ax-ganttchart

Mendix pluggable widget definition for `AxGanttChart.xml`.

## Widget Registration

| Widget | XML file | React component | Preview component |
|--------|----------|-----------------|-------------------|
| ax-ganttchart | `AxGanttChart.xml` | `AxGanttChart` | `AxGanttChartPreview` |

**Widget ID**: `com.mendix.axganttchart.AxGanttChart`

---

## Property Groups

### General

```xml
<property key="height" type="integer" required="true" defaultValue="600">
  <caption>Height</caption>
  <description>Gantt widget height in pixels</description>
</property>
```

### Data Source

```xml
<property key="datasource" type="datasource" isList="true" required="true">
  <caption>Data source</caption>
  <description>List datasource returning task objects from database, microflow, nanoflow, or REST integration</description>
</property>
```

### Mapping

All mapping properties link to `datasource` via `dataSource="datasource"`.

```xml
<property key="idAttribute" type="attribute" dataSource="datasource" required="true">
  <caption>ID attribute</caption>
  <description>Unique task identifier</description>
  <attributeTypes>
    <attributeType name="String"/>
    <attributeType name="AutoNumber"/>
  </attributeTypes>
</property>

<property key="textAttribute" type="attribute" dataSource="datasource" required="true">
  <caption>Text attribute</caption>
  <description>Task label displayed in grid and timeline</description>
  <attributeTypes>
    <attributeType name="String"/>
  </attributeTypes>
</property>

<property key="startDateAttribute" type="attribute" dataSource="datasource" required="true">
  <caption>Start date attribute</caption>
  <description>Task start date</description>
  <attributeTypes>
    <attributeType name="DateTime"/>
  </attributeTypes>
</property>

<property key="endDateAttribute" type="attribute" dataSource="datasource" required="false">
  <caption>End date attribute</caption>
  <description>Task end date (optional if duration is provided)</description>
  <attributeTypes>
    <attributeType name="DateTime"/>
  </attributeTypes>
</property>

<property key="durationAttribute" type="attribute" dataSource="datasource" required="false">
  <caption>Duration attribute</caption>
  <description>Task duration in days (optional if end date is provided)</description>
  <attributeTypes>
    <attributeType name="Integer"/>
    <attributeType name="Long"/>
    <attributeType name="Decimal"/>
  </attributeTypes>
</property>

<property key="progressAttribute" type="attribute" dataSource="datasource" required="false">
  <caption>Progress attribute</caption>
  <description>Task completion from 0 to 1</description>
  <attributeTypes>
    <attributeType name="Decimal"/>
    <attributeType name="Integer"/>
  </attributeTypes>
</property>

<property key="parentAttribute" type="attribute" dataSource="datasource" required="false">
  <caption>Parent attribute</caption>
  <description>Parent task ID for hierarchy</description>
  <attributeTypes>
    <attributeType name="String"/>
  </attributeTypes>
</property>

<property key="openAttribute" type="attribute" dataSource="datasource" required="false">
  <caption>Open attribute</caption>
  <description>Whether child tasks are expanded</description>
  <attributeTypes>
    <attributeType name="Boolean"/>
  </attributeTypes>
</property>

<property key="typeAttribute" type="attribute" dataSource="datasource" required="false">
  <caption>Type attribute</caption>
  <description>DHTMLX task type (task, project, milestone)</description>
  <attributeTypes>
    <attributeType name="String"/>
    <attributeType name="Enum"/>
  </attributeTypes>
</property>
```

### Display

```xml
<property key="showToolbar" type="boolean" required="true" defaultValue="true">
  <caption>Show toolbar</caption>
  <description>Display built-in view mode and action toolbar</description>
</property>

<property key="showGrid" type="boolean" required="true" defaultValue="true">
  <caption>Show grid</caption>
  <description>Display task grid panel</description>
</property>

<property key="showTimeline" type="boolean" required="true" defaultValue="true">
  <caption>Show timeline</caption>
  <description>Display timeline panel</description>
</property>

<property key="showProgress" type="boolean" required="true" defaultValue="true">
  <caption>Show progress</caption>
  <description>Display progress bars on tasks</description>
</property>

<property key="showTodayMarker" type="boolean" required="true" defaultValue="true">
  <caption>Show today marker</caption>
  <description>Display vertical marker for current date</description>
</property>
```

### Timeline

```xml
<property key="defaultViewMode" type="enumeration" required="true" defaultValue="week">
  <caption>Default view mode</caption>
  <description>Initial timeline scale granularity</description>
  <enumerationValues>
    <enumerationValue key="day">Day</enumerationValue>
    <enumerationValue key="week">Week</enumerationValue>
    <enumerationValue key="month">Month</enumerationValue>
    <enumerationValue key="quarter">Quarter</enumerationValue>
  </enumerationValues>
</property>
```

### Selection (writable)

```xml
<property key="selectedTaskId" type="attribute" required="false">
  <caption>Selected task ID</caption>
  <description>Writable string attribute for the selected task identifier</description>
  <attributeTypes>
    <attributeType name="String"/>
  </attributeTypes>
</property>

<property key="selectedPayload" type="attribute" required="false">
  <caption>Selected payload</caption>
  <description>Complete selected GanttTask as JSON string including metadata</description>
  <attributeTypes>
    <attributeType name="String"/>
  </attributeTypes>
</property>
```

### Events

```xml
<property key="onTaskClick" type="action" required="false">
  <caption>On task click</caption>
  <description>Action executed when a task is clicked</description>
</property>

<property key="onTaskDoubleClick" type="action" required="false">
  <caption>On task double click</caption>
  <description>Action executed when a task is double-clicked</description>
</property>

<property key="onTaskCreated" type="action" required="false">
  <caption>On task created</caption>
  <description>Action executed when a task is created in the Gantt</description>
</property>

<property key="onTaskUpdated" type="action" required="false">
  <caption>On task updated</caption>
  <description>Action executed when a task is updated in the Gantt</description>
</property>

<property key="onTaskDeleted" type="action" required="false">
  <caption>On task deleted</caption>
  <description>Action executed when a task is deleted in the Gantt</description>
</property>

<property key="onSelectionChanged" type="action" required="false">
  <caption>On selection changed</caption>
  <description>Action executed when task selection changes</description>
</property>
```

### Export (optional v1)

```xml
<property key="exportServerUrl" type="string" required="false" defaultValue="">
  <caption>Export server URL</caption>
  <description>Override DHTMLX export API endpoint for on-prem deployments (default: online service)</description>
</property>
```

---

## XML Schema Rules

- Use `defaultValue` (not `default`) on property attributes
- Every property MUST have `<caption>` and `<description>` in that order
- `<attributeTypes>` MUST come after `<description>` on attribute properties
- Properties with `defaultValue` for `boolean`, `integer`, and `enumeration` types MUST set `required="true"`
- Datasource mapping attributes MUST include `dataSource="datasource"`

---

## Mendix Props TypeScript Interface

```ts
export type TimelineViewModeEnum = "day" | "week" | "month" | "quarter";

export interface AxGanttChartContainerProps {
    name: string;
    class: string;
    height: number;
    datasource: ListValue;
    idAttribute: ListAttributeValue<string>;
    textAttribute: ListAttributeValue<string>;
    startDateAttribute: ListAttributeValue<Date>;
    endDateAttribute?: ListAttributeValue<Date>;
    durationAttribute?: ListAttributeValue<Big>;
    progressAttribute?: ListAttributeValue<Big>;
    parentAttribute?: ListAttributeValue<string>;
    openAttribute?: ListAttributeValue<boolean>;
    typeAttribute?: ListAttributeValue<string>;
    showToolbar: boolean;
    showGrid: boolean;
    showTimeline: boolean;
    showProgress: boolean;
    showTodayMarker: boolean;
    defaultViewMode: TimelineViewModeEnum;
    selectedTaskId?: EditableValue<string>;
    selectedPayload?: EditableValue<string>;
    exportServerUrl?: string;
    onTaskClick?: ActionValue;
    onTaskDoubleClick?: ActionValue;
    onTaskCreated?: ActionValue;
    onTaskUpdated?: ActionValue;
    onTaskDeleted?: ActionValue;
    onSelectionChanged?: ActionValue;
}
```
