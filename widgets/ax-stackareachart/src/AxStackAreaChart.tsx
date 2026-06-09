import { ThemeProvider } from "@iris/chart-ui";
import { StackAreaChartView } from "./main/components/StackAreaChartView";
import { StackAreaChartProvider } from "./main/providers/StackAreaChartProvider";
import type { AxStackAreaChartContainerProps, AxStackAreaChartProps } from "./typings/AxStackAreaChartProps";
import "./styles/ax-stackareachart.scss";

export function AxStackAreaChart(props: AxStackAreaChartProps): JSX.Element {
    return (
        <ThemeProvider>
            <StackAreaChartProvider widgetProps={props}>
                <StackAreaChartView widgetProps={props} />
            </StackAreaChartProvider>
        </ThemeProvider>
    );
}

export function AxStackAreaChartContainer(props: AxStackAreaChartContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
