import { JSX } from "react";
import { AxGanttChartView } from "./main/components/AxGanttChartView";
import { GanttProvider } from "./main/providers/GanttProvider";
import { ThemeProvider } from "./main/providers/ThemeProvider";
import type { AxGanttChartContainerProps, AxGanttChartProps } from "./typings/AxGanttChartProps";
import "./styles/gantt.scss";

export function AxGanttChart(props: AxGanttChartProps): JSX.Element {
    return (
        <ThemeProvider>
            <GanttProvider widgetProps={props}>
                <AxGanttChartView widgetProps={props} />
            </GanttProvider>
        </ThemeProvider>
    );
}

export function AxGanttChartContainer(props: AxGanttChartContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
