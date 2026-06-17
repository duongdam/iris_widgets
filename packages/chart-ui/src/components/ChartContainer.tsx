import classNames from "classnames";
import { JSX, forwardRef, type CSSProperties, type ReactNode } from "react";

export interface ChartContainerProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    height: number;
    className?: string;
    style?: CSSProperties;
    compact?: boolean;
    showHeaderDivider?: boolean;
    fullscreen?: boolean;
}

export const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(function ChartContainer(
    {
        children,
        title,
        subtitle,
        height,
        className,
        style,
        compact = false,
        showHeaderDivider = true,
        fullscreen = false,
    },
    ref
): JSX.Element {
    const hasHeader = Boolean(title || subtitle);

    return (
        <div
            ref={ref}
            className={classNames(
                "iris-chart-container",
                compact && "iris-chart-container--compact",
                fullscreen && "iris-chart-container--fullscreen",
                className
            )}
            style={style}
        >
            {hasHeader ? (
                <div
                    className={classNames(
                        "iris-chart-container__header",
                        showHeaderDivider && "iris-chart-container__header--divider"
                    )}
                >
                    {title ? <div className="iris-chart-container__title">{title}</div> : null}
                    {subtitle ? <div className="iris-chart-container__subtitle">{subtitle}</div> : null}
                </div>
            ) : null}
            <div className="iris-chart-container__body" style={{ height: fullscreen ? "100%" : height }}>
                {children}
            </div>
        </div>
    );
});
