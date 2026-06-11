import { ThemeProvider } from "@iris/chart-ui";
import { ValueStatus, type EditableValue } from "mendix";
import { NegativeBarChartView } from "./main/components/NegativeBarChartView";
import { NegativeBarChartProvider } from "./main/providers/NegativeBarChartProvider";
import {
    PREVIEW_DATA_FORMAT,
    PREVIEW_HEIGHT,
    PREVIEW_JSON_DATA,
    PREVIEW_TITLE,
} from "./preview/previewConfig";
import type { AxNegativeBarChartProps } from "./typings/AxNegativeBarChartProps";
import "./styles/ax-negativebarchart.scss";

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

const previewProps: AxNegativeBarChartProps = {
    name: "ax-negativebarchart-preview",
    class: "ax-negativebarchart-preview",
    title: PREVIEW_TITLE,
    height: PREVIEW_HEIGHT,
    jsonData: previewJsonData,
    dataFormat: PREVIEW_DATA_FORMAT,
    baselineLabel: "",
    showTitle: true,
    showLegend: true,
    showTooltip: true,
};

export function preview(getProps: () => AxNegativeBarChartProps): JSX.Element {
    const props = { ...previewProps, ...getProps() };
    return (
        <ThemeProvider>
            <NegativeBarChartProvider widgetProps={props}>
                <NegativeBarChartView widgetProps={props} />
            </NegativeBarChartProvider>
        </ThemeProvider>
    );
}

export function AxNegativeBarChartPreview(): JSX.Element {
    return preview(() => previewProps);
}
