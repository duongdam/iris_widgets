import { createMockDatasource } from "@iris/chart-core";
import { ThemeProvider } from "@iris/chart-ui";
import type { Big } from "big.js";
import type { ListAttributeValue } from "mendix";
import { NegativeBarChartView } from "./main/components/NegativeBarChartView";
import { NegativeBarChartProvider } from "./main/providers/NegativeBarChartProvider";
import { PREVIEW_HEIGHT, PREVIEW_TITLE } from "./preview/previewConfig";
import type { AxNegativeBarChartProps } from "./typings/AxNegativeBarChartProps";
import "./styles/ax-negativebarchart.scss";

const PREVIEW_RECORDS = [
    { id: "1", name: "Jan", period: "2025", pm: 12 },
    { id: "2", name: "Feb", period: "2025", pm: -8 },
    { id: "3", name: "Mar", period: "2025", pm: 22 },
    { id: "4", name: "Apr", period: "2025", pm: -5 },
    { id: "5", name: "May", period: "2025", pm: 18 },
    { id: "6", name: "Jun", period: "2025", pm: -14 },
    { id: "7", name: "Jul", period: "2025", pm: 9 },
    { id: "8", name: "Aug", period: "2025", pm: -3 },
];

const { datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute } =
    createMockDatasource(PREVIEW_RECORDS);

const previewProps: AxNegativeBarChartProps = {
    name: "ax-negativebarchart-preview",
    class: "ax-negativebarchart-preview",
    title: PREVIEW_TITLE,
    height: PREVIEW_HEIGHT,
    datasource,
    idAttribute,
    nameAttribute,
    periodAttribute,
    valueAttribute: valueAttribute as unknown as ListAttributeValue<Big>,
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
