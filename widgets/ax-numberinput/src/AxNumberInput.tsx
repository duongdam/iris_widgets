import { ThemeProvider } from "@iris/chart-ui";
import { NumberInputView } from "./main/components/NumberInputView";
import type { AxNumberInputContainerProps, AxNumberInputProps } from "./typings/AxNumberInputProps";
import "./styles/ax-numberinput.scss";

export function AxNumberInput(props: AxNumberInputProps): JSX.Element {
    return (
        <ThemeProvider>
            <NumberInputView widgetProps={props} />
        </ThemeProvider>
    );
}

export function AxNumberInputContainer(props: AxNumberInputContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
