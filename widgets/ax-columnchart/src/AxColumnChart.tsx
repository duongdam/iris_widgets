import { JSX } from "react";
import { ThemeProvider } from "@iris/chart-ui";
import { ColumnChartView } from "./main/components/ColumnChartView";
import { ColumnChartProvider } from "./main/providers/ColumnChartProvider";
import type { AxColumnChartContainerProps, AxColumnChartProps } from "./typings/AxColumnChartProps";
import "./styles/ax-columnchart.scss";

export function AxColumnChart(props: AxColumnChartProps): JSX.Element {
    return (
        <ThemeProvider>
            <ColumnChartProvider widgetProps={props}>
                <ColumnChartView widgetProps={props} />
            </ColumnChartProvider>
        </ThemeProvider>
    );
}

export function AxColumnChartContainer(props: AxColumnChartContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
