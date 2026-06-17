import { JSX } from "react";
import { createMockDatasource, MOCK_FLAT_RECORDS } from "@iris/chart-core";
import { ThemeProvider } from "@iris/chart-ui";
import type { Big } from "big.js";
import type { ListAttributeValue } from "mendix";
import { BarChartView } from "./main/components/BarChartView";
import { BarChartProvider } from "./main/providers/BarChartProvider";
import { PREVIEW_HEIGHT, PREVIEW_TITLE } from "./preview/previewConfig";
import type { AxBarChartProps } from "./typings/AxBarChartProps";
import "./styles/ax-barchart.scss";

const { datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute } =
    createMockDatasource(MOCK_FLAT_RECORDS);

const previewProps: AxBarChartProps = {
    name: "ax-barchart-preview",
    class: "ax-barchart-preview",
    title: PREVIEW_TITLE,
    height: PREVIEW_HEIGHT,
    datasource,
    idAttribute,
    nameAttribute,
    periodAttribute,
    valueAttribute: valueAttribute as unknown as ListAttributeValue<Big>,
    showTitle: true,
    showLegend: true,
    showTooltip: true,
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
