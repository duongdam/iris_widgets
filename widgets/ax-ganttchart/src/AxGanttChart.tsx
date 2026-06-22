import { JSX, useRef } from "react";
import { AxGanttInner } from "./AxGanttInner";
import { AxGanttChartView } from "./main/AxGanttChartView";
import type { AxGanttChartContainerProps, AxGanttChartProps } from "./typings/AxGanttChartProps";
import "./styles/gantt.scss";

export function AxGanttChart(props: AxGanttChartProps): JSX.Element {
    const rootRef = useRef<HTMLDivElement>(null);

    return (
        <AxGanttInner widgetProps={props} containerRef={rootRef}>
            <AxGanttChartView widgetProps={props} rootRef={rootRef} />
        </AxGanttInner>
    );
}

export function AxGanttChartContainer(props: AxGanttChartContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
