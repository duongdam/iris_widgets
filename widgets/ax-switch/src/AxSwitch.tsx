import { ThemeProvider } from "@iris/chart-ui";
import { SwitchView } from "./main/components/SwitchView";
import type { AxSwitchContainerProps, AxSwitchProps } from "./typings/AxSwitchProps";
import "./styles/ax-switch.scss";

export function AxSwitch(props: AxSwitchProps): JSX.Element {
    return (
        <ThemeProvider>
            <SwitchView widgetProps={props} />
        </ThemeProvider>
    );
}

export function AxSwitchContainer(props: AxSwitchContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
