import { createMockDatasource, MOCK_FLAT_RECORDS } from "@iris/chart-core";
import { ThemeProvider } from "@iris/chart-ui";
import type { Big } from "big.js";
import type { ListAttributeValue } from "mendix";
import { ColumnChartView } from "./main/components/ColumnChartView";
import { ColumnChartProvider } from "./main/providers/ColumnChartProvider";
import { PREVIEW_HEIGHT, PREVIEW_TITLE } from "./preview/previewConfig";
import type { AxColumnChartProps } from "./typings/AxColumnChartProps";
import "./styles/ax-columnchart.scss";

const { datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute } =
    createMockDatasource(MOCK_FLAT_RECORDS);

const previewProps: AxColumnChartProps = {
    name: "ax-columnchart-preview",
    class: "ax-columnchart-preview",
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
    stackMode: "grouped",
    columnWidthPercent: 70,
    showSeriesLabels: false,
    referenceLineLabel: "",
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
