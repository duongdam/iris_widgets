import { ThemeProvider } from "@iris/chart-ui";
import { TextAreaView } from "./main/components/TextAreaView";
import type { AxTextAreaContainerProps, AxTextAreaProps } from "./typings/AxTextAreaProps";
import "./styles/ax-textarea.scss";

export function AxTextArea(props: AxTextAreaProps): JSX.Element {
    return (
        <ThemeProvider>
            <TextAreaView widgetProps={props} />
        </ThemeProvider>
    );
}

export function AxTextAreaContainer(props: AxTextAreaContainerProps): JSX.Element {
    return <div className={props.class} style={props.style} tabIndex={props.tabIndex} />;
}
