import { JSX, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export interface DeferredChartMountProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}

export function DeferredChartMount({
    children,
    className,
    style,
}: DeferredChartMountProps): JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hasSize, setHasSize] = useState(false);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return undefined;
        }

        const updateSize = (): void => {
            setHasSize(element.clientWidth > 0 && element.clientHeight > 0);
        };

        updateSize();

        const observer = new ResizeObserver(updateSize);
        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ width: "100%", height: "100%", ...style }}
        >
            {hasSize ? children : null}
        </div>
    );
}
