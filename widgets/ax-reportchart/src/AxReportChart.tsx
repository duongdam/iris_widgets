import { ThemeProvider } from "@iris/chart-ui";
import { ReportChartView } from "./main/components/ReportChartView";
import { ReportChartProvider } from "./main/providers/ReportChartProvider";
import type { AxReportChartContainerProps, AxReportChartProps } from "./typings/AxReportChartProps";
import "./styles/ax-reportchart.scss";

export function AxReportChart(props: AxReportChartProps): JSX.Element {
    return (
        <ThemeProvider>
            <ReportChartProvider widgetProps={props}>
                <ReportChartView widgetProps={props} />
            </ReportChartProvider>
        </ThemeProvider>
    );
}

export function AxReportChartContainer(props: AxReportChartContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
