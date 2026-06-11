import { ThemeProvider } from "@iris/chart-ui";
import { NegativeBarChartView } from "./main/components/NegativeBarChartView";
import { NegativeBarChartProvider } from "./main/providers/NegativeBarChartProvider";
import type {
    AxNegativeBarChartContainerProps,
    AxNegativeBarChartProps,
} from "./typings/AxNegativeBarChartProps";
import "./styles/ax-negativebarchart.scss";

export function AxNegativeBarChart(props: AxNegativeBarChartProps): JSX.Element {
    return (
        <ThemeProvider>
            <NegativeBarChartProvider widgetProps={props}>
                <NegativeBarChartView widgetProps={props} />
            </NegativeBarChartProvider>
        </ThemeProvider>
    );
}

export function AxNegativeBarChartContainer(props: AxNegativeBarChartContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
