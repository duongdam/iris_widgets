import { createMockDatasource, MOCK_FLAT_RECORDS } from "@iris/chart-core";
import { ThemeProvider } from "@iris/chart-ui";
import type { Big } from "big.js";
import type { ListAttributeValue } from "mendix";
import { StackAreaChartView } from "./main/components/StackAreaChartView";
import { StackAreaChartProvider } from "./main/providers/StackAreaChartProvider";
import { PREVIEW_HEIGHT, PREVIEW_TITLE } from "./preview/previewConfig";
import type { AxStackAreaChartProps } from "./typings/AxStackAreaChartProps";
import "./styles/ax-stackareachart.scss";

const { datasource, idAttribute, nameAttribute, periodAttribute, valueAttribute } =
    createMockDatasource(MOCK_FLAT_RECORDS);

const previewProps: AxStackAreaChartProps = {
    name: "ax-stackareachart-preview",
    class: "ax-stackareachart-preview",
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
    referenceLineLabel: "",
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
