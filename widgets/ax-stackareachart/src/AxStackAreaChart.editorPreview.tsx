import { ThemeProvider } from "@iris/chart-ui";
import { ValueStatus, type EditableValue } from "mendix";
import { StackAreaChartView } from "./main/components/StackAreaChartView";
import { StackAreaChartProvider } from "./main/providers/StackAreaChartProvider";
import {
    PREVIEW_DATA_FORMAT,
    PREVIEW_HEIGHT,
    PREVIEW_JSON_DATA,
    PREVIEW_TITLE,
} from "./preview/previewConfig";
import type { AxStackAreaChartProps } from "./typings/AxStackAreaChartProps";
import "./styles/ax-stackareachart.scss";

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

const previewProps: AxStackAreaChartProps = {
    name: "ax-stackareachart-preview",
    class: "ax-stackareachart-preview",
    title: PREVIEW_TITLE,
    height: PREVIEW_HEIGHT,
    jsonData: previewJsonData,
    dataFormat: PREVIEW_DATA_FORMAT,
    showTitle: true,
    showLegend: true,
    showTooltip: true,
};

export function preview(getProps: () => AxStackAreaChartProps): JSX.Element {
    const props = { ...previewProps, ...getProps() };
    return (
        <ThemeProvider>
            <StackAreaChartProvider widgetProps={props}>
                <StackAreaChartView widgetProps={props} />
            </StackAreaChartProvider>
        </ThemeProvider>
    );
}

export function AxStackAreaChartPreview(): JSX.Element {
    return preview(() => previewProps);
}
