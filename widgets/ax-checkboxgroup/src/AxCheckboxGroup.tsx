import { ThemeProvider } from "@iris/chart-ui";
import { CheckboxGroupView } from "./main/components/CheckboxGroupView";
import type { AxCheckboxGroupContainerProps, AxCheckboxGroupProps } from "./typings/AxCheckboxGroupProps";
import "./styles/ax-checkboxgroup.scss";

export function AxCheckboxGroup(props: AxCheckboxGroupProps): JSX.Element {
    return (
        <ThemeProvider>
            <CheckboxGroupView widgetProps={props} />
        </ThemeProvider>
    );
}

export function AxCheckboxGroupContainer(props: AxCheckboxGroupContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
