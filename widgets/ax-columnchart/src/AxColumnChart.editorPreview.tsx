import { ThemeProvider } from "@iris/chart-ui";
import { ValueStatus, type EditableValue } from "mendix";
import { ColumnChartView } from "./main/components/ColumnChartView";
import { ColumnChartProvider } from "./main/providers/ColumnChartProvider";
import {
    PREVIEW_DATA_FORMAT,
    PREVIEW_HEIGHT,
    PREVIEW_JSON_DATA,
    PREVIEW_TITLE,
} from "./preview/previewConfig";
import type { AxColumnChartProps } from "./typings/AxColumnChartProps";
import "./styles/ax-columnchart.scss";

const previewJsonData = {
    value: PREVIEW_JSON_DATA,
    status: ValueStatus.Available,
    readOnly: true,
    displayValue: PREVIEW_JSON_DATA,
    formatter: { format: (v: string) => String(v), parse: (v: string) => v },
    setFormatter: () => undefined,
    setTextValue: () => undefined,
    setValue: () => undefined,
    isList: false as const,
    validation: undefined,
    universe: undefined,
} as unknown as EditableValue<string>;

const previewProps: AxColumnChartProps = {
    name: "ax-columnchart-preview",
    class: "ax-columnchart-preview",
    title: PREVIEW_TITLE,
    height: PREVIEW_HEIGHT,
    jsonData: previewJsonData,
    dataFormat: PREVIEW_DATA_FORMAT,
    showTitle: true,
    showLegend: true,
    showTooltip: true,
};

export function preview(getProps: () => AxColumnChartProps): JSX.Element {
    const props = { ...previewProps, ...getProps() };
    return (
        <ThemeProvider>
            <ColumnChartProvider widgetProps={props}>
                <ColumnChartView widgetProps={props} />
            </ColumnChartProvider>
        </ThemeProvider>
    );
}

export function AxColumnChartPreview(): JSX.Element {
    return preview(() => previewProps);
}
