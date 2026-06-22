import { observer } from "mobx-react-lite";
import { JSX, useEffect, useMemo, useRef, type CSSProperties, type RefObject } from "react";
import type { GanttTask } from "../../events/ganttEvents";
import { buildTooltipDisplay } from "../../gantt/tooltipContent";

interface TooltipPos {
    x: number;
    y: number;
}

const TOOLTIP_STYLE: CSSProperties = {
    position: "absolute",
    zIndex: 100,
    pointerEvents: "none",
    background: "#1f1f1f",
    color: "#fff",
    borderRadius: 6,
    padding: "10px 12px",
    minWidth: 200,
    maxWidth: 280,
    fontSize: 13,
    lineHeight: "1.6",
    transition: "opacity 120ms ease"
};

export interface GanttTooltipProps {
    task: GanttTask | undefined;
    pos: TooltipPos;
    containerRef: RefObject<HTMLDivElement>;
}

export const GanttTooltip = observer(function GanttTooltip({
    task,
    pos,
    containerRef
}: GanttTooltipProps): JSX.Element | null {
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!task || !tooltipRef.current || !containerRef.current) {
            return;
        }

        const tip = tooltipRef.current;
        const rect = containerRef.current.getBoundingClientRect();
        const tipW = tip.offsetWidth || 240;
        const tipH = tip.offsetHeight || 120;

        const GAP = 14;
        let left = pos.x - rect.left + GAP;
        let top = pos.y - rect.top - tipH / 2;

        if (left + tipW > rect.width - 8) {
            left = pos.x - rect.left - tipW - GAP;
        }

        if (top < 4) top = 4;
        if (top + tipH > rect.height - 4) top = rect.height - tipH - 4;

        tip.style.left = `${left}px`;
        tip.style.top = `${top}px`;
    }, [pos, task, containerRef]);

    const displayData = useMemo(() => (task ? buildTooltipDisplay(task) : null), [task]);

    if (!task || !displayData) {
        return null;
    }

    const { text, type, status, assignee, startFormatted, endFormatted, duration, progress, progressPercent: pct } =
        displayData;

    return (
        <div ref={tooltipRef} className="ax-gantt-tooltip" style={TOOLTIP_STYLE}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, wordBreak: "break-word" }}>{text}</div>

            {(status || type) && (
                <div style={{ marginBottom: 6, display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {type && type !== "task" && (
                        <span
                            style={{
                                background: type === "milestone" ? "#722ed1" : "#0958d9",
                                borderRadius: 3,
                                padding: "1px 6px",
                                fontSize: 13,
                                fontWeight: 500,
                                textTransform: "capitalize"
                            }}
                        >
                            {type}
                        </span>
                    )}
                    {status && (
                        <span
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                borderRadius: 3,
                                padding: "1px 6px",
                                fontSize: 13
                            }}
                        >
                            {status}
                        </span>
                    )}
                </div>
            )}

            <div style={{ color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
                <span>{startFormatted}</span>
                <span style={{ margin: "0 5px" }}>→</span>
                <span>{endFormatted}</span>
            </div>

            <div style={{ color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>
                Duration: <span style={{ color: "#fff" }}>{duration}</span>
            </div>

            {progress != null && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ color: "rgba(255,255,255,0.65)" }}>Progress</span>
                        <span style={{ fontWeight: 500 }}>{pct}%</span>
                    </div>
                    <div
                        style={{
                            height: 4,
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: 99,
                            overflow: "hidden"
                        }}
                    >
                        <div
                            style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: pct >= 100 ? "#52c41a" : "#4096ff",
                                borderRadius: 99,
                                transition: "width 200ms ease"
                            }}
                        />
                    </div>
                </div>
            )}

            {assignee && (
                <div style={{ marginTop: 6, color: "rgba(255,255,255,0.65)" }}>
                    Assignee: <span style={{ color: "#fff" }}>{assignee}</span>
                </div>
            )}
        </div>
    );
});
