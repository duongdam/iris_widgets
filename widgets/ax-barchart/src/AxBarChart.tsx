import { JSX } from "react";
import { ThemeProvider } from "@iris/chart-ui";
import { BarChartView } from "./main/components/BarChartView";
import { BarChartProvider } from "./main/providers/BarChartProvider";
import type { AxBarChartContainerProps, AxBarChartProps } from "./typings/AxBarChartProps";
import "./styles/ax-barchart.scss";

export function AxBarChart(props: AxBarChartProps): JSX.Element {
    return (
        <ThemeProvider>
            <BarChartProvider widgetProps={props}>
                <BarChartView widgetProps={props} />
            </BarChartProvider>
        </ThemeProvider>
    );
}

export function AxBarChartContainer(props: AxBarChartContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
