import { ThemeProvider } from "@iris/chart-ui";
import { InputView } from "./main/components/InputView";
import type { AxInputContainerProps, AxInputProps } from "./typings/AxInputProps";
import "./styles/ax-input.scss";

export function AxInput(props: AxInputProps): JSX.Element {
    return (
        <ThemeProvider>
            <InputView widgetProps={props} />
        </ThemeProvider>
    );
}

export function AxInputContainer(props: AxInputContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
