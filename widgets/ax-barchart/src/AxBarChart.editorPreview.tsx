import { ThemeProvider } from "@iris/chart-ui";
import { ValueStatus, type EditableValue } from "mendix";
import { BarChartView } from "./main/components/BarChartView";
import { BarChartProvider } from "./main/providers/BarChartProvider";
import { PREVIEW_DATA_FORMAT, PREVIEW_HEIGHT, PREVIEW_JSON_DATA, PREVIEW_TITLE } from "./preview/previewConfig";
import type { AxBarChartProps } from "./typings/AxBarChartProps";
import "./styles/ax-barchart.scss";

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
    universe: undefined
} as unknown as EditableValue<string>;

const previewProps: AxBarChartProps = {
    name: "ax-barchart-preview",
    class: "ax-barchart-preview",
    title: PREVIEW_TITLE,
    height: PREVIEW_HEIGHT,
    jsonData: previewJsonData,
    dataFormat: PREVIEW_DATA_FORMAT,
    showTitle: true,
    showLegend: true,
    showTooltip: true
};

export function preview(getProps: () => AxBarChartProps): JSX.Element {
    const props = { ...previewProps, ...getProps() };
    return (
        <ThemeProvider>
            <BarChartProvider widgetProps={props}>
                <BarChartView widgetProps={props} />
            </BarChartProvider>
        </ThemeProvider>
    );
}

export function AxBarChartPreview(): JSX.Element {
    return preview(() => previewProps);
}
