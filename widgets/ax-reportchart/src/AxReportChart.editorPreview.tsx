import { createMockDatasource, MOCK_FLAT_RECORDS } from "@iris/chart-core";
import { ThemeProvider } from "@iris/chart-ui";
import type { Big } from "big.js";
import type { ListAttributeValue } from "mendix";
import { ReportChartView } from "./main/components/ReportChartView";
import { ReportChartProvider } from "./main/providers/ReportChartProvider";
import {
    PREVIEW_AGGREGATION_MODE,
    PREVIEW_DRILLDOWN_ENABLED,
    PREVIEW_HEIGHT,
    PREVIEW_SHOW_GRAND_TOTAL,
    PREVIEW_TITLE,
} from "./preview/previewConfig";
import type { AxReportChartProps } from "./typings/AxReportChartProps";
import "./styles/ax-reportchart.scss";

const { datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute } =
    createMockDatasource(MOCK_FLAT_RECORDS);

const previewProps: AxReportChartProps = {
    name: "ax-reportchart-preview",
    class: "ax-reportchart-preview",
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
