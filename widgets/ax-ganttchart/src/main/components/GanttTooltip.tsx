import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import type { GanttTask } from "../eventbus/eventTypes";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDateSafe(value: string | Date | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const normalized = value.length === 10 ? `${value}T00:00:00` : value.replace(" ", "T");
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
}

function formatTooltipDate(value: string | Date | undefined): string {
    const d = toDateSafe(value);
    if (!d) return "—";
    return `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function calcDuration(task: GanttTask): string {
    if (task.duration != null && task.duration > 0) {
        return `${task.duration} day${task.duration !== 1 ? "s" : ""}`;
    }

    const start = toDateSafe(task.start_date);
    const end = toDateSafe(task.end_date);
    if (start && end) {
        const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} day${days !== 1 ? "s" : ""}` : "—";
    }

    return "—";
}

function progressPercent(progress: number | undefined): number {
    if (progress == null) return 0;
    return Math.round(progress > 1 ? progress : progress * 100);
}

interface TooltipPos {
    x: number;
    y: number;
}

export interface GanttTooltipProps {
    task: GanttTask | undefined;
    pos: TooltipPos;
    containerRef: React.RefObject<HTMLDivElement>;
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

        // Prevent overflow on right
        if (left + tipW > rect.width - 8) {
            left = pos.x - rect.left - tipW - GAP;
        }

        // Clamp vertical
        if (top < 4) top = 4;
        if (top + tipH > rect.height - 4) top = rect.height - tipH - 4;

        tip.style.left = `${left}px`;
        tip.style.top = `${top}px`;
    }, [pos, task, containerRef]);

    if (!task) {
        return null;
    }

    const pct = progressPercent(task.progress);
    const duration = calcDuration(task);
    const assignee = task.metadata?.assignee as string | undefined;
    const status = task.metadata?.status as string | undefined;

    return (
        <div
            ref={tooltipRef}
            className="ax-gantt-tooltip"
            style={{
                position: "absolute",
                zIndex: 100,
                pointerEvents: "none",
                background: "#1f1f1f",
                color: "#fff",
                borderRadius: 6,
                padding: "10px 12px",
                minWidth: 200,
                maxWidth: 280,
                fontSize: 12,
                lineHeight: "1.6",
                transition: "opacity 120ms ease"
            }}
        >
            {/* Task name */}
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, wordBreak: "break-word" }}>{task.text}</div>

            {/* Status + type chips */}
            {(status || task.type) && (
                <div style={{ marginBottom: 6, display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {task.type && task.type !== "task" && (
                        <span
                            style={{
                                background: task.type === "milestone" ? "#722ed1" : "#0958d9",
                                borderRadius: 3,
                                padding: "1px 6px",
                                fontSize: 10,
                                fontWeight: 500,
                                textTransform: "capitalize"
                            }}
                        >
                            {task.type}
                        </span>
                    )}
                    {status && (
                        <span
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                borderRadius: 3,
                                padding: "1px 6px",
                                fontSize: 10
                            }}
                        >
                            {status}
                        </span>
                    )}
                </div>
            )}

            {/* Date row */}
            <div style={{ color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
                <span>{formatTooltipDate(task.start_date)}</span>
                <span style={{ margin: "0 5px" }}>→</span>
                <span>{formatTooltipDate(task.end_date)}</span>
            </div>

            {/* Duration */}
            <div style={{ color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>
                Duration: <span style={{ color: "#fff" }}>{duration}</span>
            </div>

            {/* Progress bar */}
            {task.progress != null && (
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

            {/* Assignee */}
            {assignee && (
                <div style={{ marginTop: 6, color: "rgba(255,255,255,0.65)" }}>
                    Assignee: <span style={{ color: "#fff" }}>{assignee}</span>
                </div>
            )}
        </div>
    );
});
