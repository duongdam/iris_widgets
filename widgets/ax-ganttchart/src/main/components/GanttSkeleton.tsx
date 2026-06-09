const ROW_COUNT = 8;
const BAR_WIDTHS = [120, 80, 160, 60, 140, 100, 90, 70];
const BAR_OFFSETS = [20, 100, 60, 180, 10, 130, 80, 50];

interface ShimmerBarProps {
    width: number;
    offset: number;
    delay: number;
}

function ShimmerBar({ width, offset, delay }: ShimmerBarProps) {
    return (
        <div
            style={{
                position: "absolute",
                left: offset,
                top: 7,
                width,
                height: 18,
                borderRadius: 4,
                background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                backgroundSize: "400px 100%",
                animation: `gantt-shimmer 1.4s ${delay}s ease-in-out infinite`,
            }}
        />
    );
}

interface ShimmerTextProps {
    width: number;
    indent?: number;
    delay: number;
}

function ShimmerText({ width, indent = 0, delay }: ShimmerTextProps) {
    return (
        <div
            style={{
                marginLeft: 8 + indent,
                width,
                height: 12,
                borderRadius: 3,
                background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
                backgroundSize: "400px 100%",
                animation: `gantt-shimmer 1.4s ${delay}s ease-in-out infinite`,
            }}
        />
    );
}

const TEXT_WIDTHS = [140, 100, 120, 80, 110, 90, 130, 75];
const INDENTS = [0, 16, 16, 32, 0, 16, 16, 32];
const DELAYS = [0, 0.1, 0.2, 0.15, 0.05, 0.25, 0.1, 0.2];

export function GanttSkeleton(): JSX.Element {
    return (
        <>
            <style>{`
                @keyframes gantt-shimmer {
                    0% { background-position: -400px 0; }
                    100% { background-position: 400px 0; }
                }
            `}</style>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "#fff",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* Header row */}
                <div
                    style={{
                        height: 32,
                        background: "#fafafa",
                        borderBottom: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 12px",
                        gap: 40,
                        flexShrink: 0,
                    }}
                >
                    {[90, 60, 60, 40].map((w, i) => (
                        <div
                            key={i}
                            style={{
                                width: w,
                                height: 10,
                                borderRadius: 3,
                                background: "#e8e8e8",
                            }}
                        />
                    ))}
                </div>

                {/* Task rows */}
                <div style={{ flex: 1, display: "flex" }}>
                    {/* Grid panel */}
                    <div
                        style={{
                            width: 420,
                            flexShrink: 0,
                            borderRight: "1px solid #f0f0f0",
                        }}
                    >
                        {Array.from({ length: ROW_COUNT }, (_, i) => (
                            <div
                                key={i}
                                style={{
                                    height: 32,
                                    display: "flex",
                                    alignItems: "center",
                                    borderBottom: "1px solid #f5f5f5",
                                }}
                            >
                                <ShimmerText
                                    width={TEXT_WIDTHS[i]}
                                    indent={INDENTS[i]}
                                    delay={DELAYS[i]}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Timeline panel */}
                    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                        {Array.from({ length: ROW_COUNT }, (_, i) => (
                            <div
                                key={i}
                                style={{
                                    height: 32,
                                    position: "relative",
                                    borderBottom: "1px solid #f5f5f5",
                                }}
                            >
                                <ShimmerBar
                                    width={BAR_WIDTHS[i]}
                                    offset={BAR_OFFSETS[i]}
                                    delay={DELAYS[i]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
