import { useEffect, useRef, useState } from "react";

export interface ChartDimensions {
    width: number;
    height: number;
}

export function useChartDimensions(defaultHeight: number): {
    ref: (node: HTMLDivElement | null) => void;
    dimensions: ChartDimensions;
} {
    const [dimensions, setDimensions] = useState<ChartDimensions>({ width: 0, height: defaultHeight });
    const observerRef = useRef<ResizeObserver | null>(null);
    const nodeRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    const ref = (node: HTMLDivElement | null): void => {
        observerRef.current?.disconnect();
        nodeRef.current = node;

        if (!node) {
            return;
        }

        const update = (): void => {
            setDimensions({
                width: node.clientWidth,
                height: defaultHeight,
            });
        };

        update();
        observerRef.current = new ResizeObserver(update);
        observerRef.current.observe(node);
    };

    return { ref, dimensions };
}
