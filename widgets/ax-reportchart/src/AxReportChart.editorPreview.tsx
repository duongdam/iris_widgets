import { ThemeProvider } from "@iris/chart-ui";
import { ValueStatus, type EditableValue } from "mendix";
import { ReportChartView } from "./main/components/ReportChartView";
import { ReportChartProvider } from "./main/providers/ReportChartProvider";
import {
    PREVIEW_AGGREGATION_MODE,
    PREVIEW_DATA_FORMAT,
    PREVIEW_DRILLDOWN_ENABLED,
    PREVIEW_HEIGHT,
    PREVIEW_JSON_DATA,
    PREVIEW_SHOW_GRAND_TOTAL,
    PREVIEW_TITLE,
} from "./preview/previewConfig";
import type { AxReportChartProps } from "./typings/AxReportChartProps";
import "./styles/ax-reportchart.scss";

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

const previewProps: AxReportChartProps = {
    name: "ax-reportchart-preview",
    class: "ax-reportchart-preview",
    title: PREVIEW_TITLE,
    height: PREVIEW_HEIGHT,
    jsonData: previewJsonData,
    dataFormat: PREVIEW_DATA_FORMAT,
    showTitle: true,
    showLegend: true,
    showTooltip: true,
    aggregationMode: PREVIEW_AGGREGATION_MODE,
    showGrandTotal: PREVIEW_SHOW_GRAND_TOTAL,
    drilldownEnabled: PREVIEW_DRILLDOWN_ENABLED,
};

export function preview(getProps: () => AxReportChartProps): JSX.Element {
    const props = { ...previewProps, ...getProps() };
    return (
        <ThemeProvider>
            <ReportChartProvider widgetProps={props}>
                <ReportChartView widgetProps={props} />
            </ReportChartProvider>
        </ThemeProvider>
    );
}

export function AxReportChartPreview(): JSX.Element {
    return preview(() => previewProps);
}
