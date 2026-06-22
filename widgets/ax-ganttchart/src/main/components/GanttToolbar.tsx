import { JSX, useCallback, useMemo } from "react";
import type React from "react";
import { Button, DatePicker, Dropdown, Segmented, Space, Tooltip } from "antd";
import type { MenuProps } from "antd";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import type { GanttTask } from "../../events/eventTypes";
import { useAxGanttContext } from "../../AxGanttInner";
import { GanttIncomingEvents, type SetDateData, TimelineViewMode } from "../../events/eventTypes";
import { emitEvent } from "../../shared/eventBus/emitEvent";
import { gantt } from "./GanttConfiguration";
import { getMaxExpandableLevel } from "./TreeExpandManager";

const VIEW_OPTIONS = [
    { label: "Day", value: TimelineViewMode.DAY },
    { label: "Week", value: TimelineViewMode.WEEK },
    { label: "Month", value: TimelineViewMode.MONTH }
];

const EXPORT_ITEMS: MenuProps["items"] = [
    { key: "pdf", label: "Export PDF" },
    { key: "png", label: "Export PNG" },
    { key: "excel", label: "Export Excel" }
];

const EXPORT_EVENT_MAP: Record<string, GanttIncomingEvents> = {
    pdf: GanttIncomingEvents.EXPORT_PDF,
    png: GanttIncomingEvents.EXPORT_PNG,
    excel: GanttIncomingEvents.EXPORT_EXCEL
};

/** SVG icon – collapse/expand/fit/fullscreen using minimal path data */
function IconToday() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="1" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="4" y1="0.5" x2="4" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="8" y1="0.5" x2="8" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="6" cy="8" r="1.2" fill="currentColor" />
        </svg>
    );
}

function IconFit() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
                d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function IconExpand() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
                d="M2 4l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line x1="2" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
}

function IconCollapse() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
                d="M2 5l3-3 3 3"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line x1="2" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
}

function IconFullscreen({ active }: { active: boolean }) {
    return active ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
                d="M5 1H1v4M7 1h4v4M5 11H1V7M7 11h4V7"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
                d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function IconExpandHeight({ active }: { active: boolean }) {
    return active ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
                d="M2 4.5L6 1l4 3.5M2 7.5L6 11l4-3.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line
                x1="6"
                y1="1"
                x2="6"
                y2="11"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeDasharray="1.5 1.5"
            />
        </svg>
    ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
                d="M2 4.5L6 1l4 3.5M2 7.5L6 11l4-3.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function IconReorder() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 3h8M2 6h8M2 9h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="4" cy="3" r="0.8" fill="currentColor" />
            <circle cx="4" cy="6" r="0.8" fill="currentColor" />
            <circle cx="4" cy="9" r="0.8" fill="currentColor" />
        </svg>
    );
}

function IconExport() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
                d="M6 1v7M3.5 5.5L6 8l2.5-2.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M2 9.5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
}

function IconCalendar() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="1" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="4" y1="0.5" x2="4" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="8" y1="0.5" x2="8" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
}

const VIEW_MODE_EVENT_MAP: Record<TimelineViewMode, GanttIncomingEvents> = {
    [TimelineViewMode.DAY]: GanttIncomingEvents.ZOOM_DAY,
    [TimelineViewMode.WEEK]: GanttIncomingEvents.ZOOM_WEEK,
    [TimelineViewMode.MONTH]: GanttIncomingEvents.ZOOM_MONTH
};

const DATE_PICKER_STYLE: React.CSSProperties = { width: 110 };

function getMaxExpandableLevelFromTasks(tasks: GanttTask[]): number {
    const childrenByParent = new Map<string, string[]>();

    for (const task of tasks) {
        if (!task.parent || task.parent === "0") {
            continue;
        }

        const siblings = childrenByParent.get(task.parent) ?? [];
        siblings.push(task.id);
        childrenByParent.set(task.parent, siblings);
    }

    function subtreeDepth(id: string): number {
        const children = childrenByParent.get(id) ?? [];
        if (children.length === 0) {
            return 0;
        }

        return 1 + Math.max(...children.map(subtreeDepth));
    }

    const roots = tasks.filter(task => !task.parent || task.parent === "0");
    if (roots.length === 0) {
        return 0;
    }

    return Math.max(...roots.map(root => subtreeDepth(root.id)));
}

function resolveMaxExpandLevel(tasks: GanttTask[]): number {
    const ganttInstance = gantt as typeof gantt & { $destroyed?: boolean };
    if (!ganttInstance.$destroyed && ganttInstance.$root) {
        return getMaxExpandableLevel(gantt);
    }

    return getMaxExpandableLevelFromTasks(tasks);
}

function getExpandTooltip(expandLevel: number, maxLevel: number): string {
    if (maxLevel === 0) {
        return "No expandable rows";
    }

    if (expandLevel >= maxLevel) {
        return `Fully expanded (${maxLevel}/${maxLevel} levels)`;
    }

    return `Expand next level (${expandLevel}/${maxLevel})`;
}

export const GanttToolbar = observer(function GanttToolbar(): JSX.Element {
    const { store, widgetId, allowGridReorder } = useAxGanttContext();
    const maxExpandLevel = resolveMaxExpandLevel(store.tasks);
    const canExpandFurther = maxExpandLevel > 0 && store.expandLevel < maxExpandLevel;

    const emit = useCallback(
        (type: GanttIncomingEvents, data?: SetDateData): void => {
            emitEvent(type, { widgetId, payload: data as Record<string, unknown> | undefined });
        },
        [widgetId]
    );

    const handleExport = useCallback(
        (key: string): void => {
            const event = EXPORT_EVENT_MAP[key];
            if (event) {
                emit(event);
            }
        },
        [emit]
    );

    const handleStartDateChange = useCallback(
        (date: dayjs.Dayjs | null): void => {
            if (date) {
                emit(GanttIncomingEvents.SET_START_DATE, { date: date.startOf("day").toISOString() });
            }
        },
        [emit]
    );

    const handleEndDateChange = useCallback(
        (date: dayjs.Dayjs | null): void => {
            if (date) {
                emit(GanttIncomingEvents.SET_END_DATE, { date: date.endOf("day").toISOString() });
            }
        },
        [emit]
    );

    const handleViewModeChange = useCallback(
        (val: string | number): void => {
            emit(VIEW_MODE_EVENT_MAP[val as TimelineViewMode]);
        },
        [emit]
    );

    const handleScrollToToday = useCallback(() => {
        emit(GanttIncomingEvents.SCROLL_TO_TODAY);
    }, [emit]);

    const handleFitTimeline = useCallback(() => {
        emit(GanttIncomingEvents.FIT_TIMELINE);
    }, [emit]);

    const handleExpandAll = useCallback(() => {
        emit(GanttIncomingEvents.EXPAND_ALL);
    }, [emit]);

    const handleCollapseAll = useCallback(() => {
        emit(GanttIncomingEvents.COLLAPSE_ALL);
    }, [emit]);

    const handleToggleGridReorder = useCallback(() => {
        store.toggleGridReorderMode();
    }, [store]);

    const handleToggleExpandHeight = useCallback(() => {
        emit(
            store.expandHeight ? GanttIncomingEvents.EXIT_EXPAND_HEIGHT : GanttIncomingEvents.ENTER_EXPAND_HEIGHT
        );
    }, [emit, store.expandHeight]);

    const handleToggleFullscreen = useCallback(() => {
        emit(store.fullscreen ? GanttIncomingEvents.EXIT_FULLSCREEN : GanttIncomingEvents.ENTER_FULLSCREEN);
    }, [emit, store.fullscreen]);

    const exportMenu = useMemo<MenuProps>(
        () => ({
            items: EXPORT_ITEMS,
            onClick: ({ key }) => handleExport(String(key))
        }),
        [handleExport]
    );

    return (
        <div className="ax-ganttchart__toolbar">
            {/* View mode segmented */}
            <Segmented
                size="small"
                options={VIEW_OPTIONS}
                value={store.viewMode}
                onChange={handleViewModeChange}
            />

            <div style={{ width: 1, height: 16, background: "#e8e8e8", flexShrink: 0 }} />

            {/* Timeline range date pickers */}
            <Space size={4} align="center">
                <IconCalendar />
                <Tooltip title="Timeline start date" mouseEnterDelay={0.5}>
                    <DatePicker
                        size="small"
                        allowClear={false}
                        picker="date"
                        style={DATE_PICKER_STYLE}
                        value={dayjs(store.timelineStart)}
                        onChange={handleStartDateChange}
                        placeholder="Start date"
                    />
                </Tooltip>
                <span style={{ color: "#aaa", fontSize: 13, lineHeight: 1 }}>→</span>
                <Tooltip title="Timeline end date" mouseEnterDelay={0.5}>
                    <DatePicker
                        size="small"
                        allowClear={false}
                        picker="date"
                        style={DATE_PICKER_STYLE}
                        value={dayjs(store.timelineEnd)}
                        onChange={handleEndDateChange}
                        placeholder="End date"
                    />
                </Tooltip>
            </Space>

            <div style={{ width: 1, height: 16, background: "#e8e8e8", flexShrink: 0 }} />

            {/* Navigation actions */}
            <Space size={4}>
                <Tooltip title="Scroll to today" mouseEnterDelay={0.5}>
                    <Button size="small" icon={<IconToday />} onClick={handleScrollToToday}>
                        Today
                    </Button>
                </Tooltip>

                <Tooltip title="Fit timeline to tasks" mouseEnterDelay={0.5}>
                    <Button size="small" icon={<IconFit />} onClick={handleFitTimeline}>
                        Fit
                    </Button>
                </Tooltip>
            </Space>

            <div style={{ width: 1, height: 16, background: "#e8e8e8", flexShrink: 0 }} />

            {/* Expand / Collapse */}
            <Space size={4}>
                <Tooltip title={getExpandTooltip(store.expandLevel, maxExpandLevel)} mouseEnterDelay={0.5}>
                    <Button
                        size="small"
                        icon={<IconExpand />}
                        disabled={!canExpandFurther}
                        onClick={handleExpandAll}
                    />
                </Tooltip>

                <Tooltip title="Collapse all rows" mouseEnterDelay={0.5}>
                    <Button size="small" icon={<IconCollapse />} onClick={handleCollapseAll} />
                </Tooltip>
            </Space>

            {allowGridReorder && (
                <>
                    <div style={{ width: 1, height: 16, background: "#e8e8e8", flexShrink: 0 }} />
                    <Tooltip
                        title={
                            store.gridReorderMode
                                ? "Exit reorder mode — drag child rows between parents"
                                : "Reorder mode — drag child rows onto another parent"
                        }
                        mouseEnterDelay={0.5}
                    >
                        <Button
                            size="small"
                            type={store.gridReorderMode ? "primary" : "default"}
                            icon={<IconReorder />}
                            onClick={handleToggleGridReorder}
                        >
                            Reorder
                        </Button>
                    </Tooltip>
                </>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Export + Fullscreen */}
            <Space size={4}>
                <Dropdown menu={exportMenu} placement="bottomRight" trigger={["click"]}>
                    <Button size="small" icon={<IconExport />}>
                        Export
                    </Button>
                </Dropdown>

                <Tooltip
                    title={store.expandHeight ? "Restore default height" : "Expand to full height"}
                    mouseEnterDelay={0.5}
                >
                    <Button
                        size="small"
                        type={store.expandHeight ? "primary" : "default"}
                        icon={<IconExpandHeight active={store.expandHeight} />}
                        onClick={handleToggleExpandHeight}
                    />
                </Tooltip>

                <Tooltip title={store.fullscreen ? "Exit fullscreen" : "Enter fullscreen"} mouseEnterDelay={0.5}>
                    <Button
                        size="small"
                        icon={<IconFullscreen active={store.fullscreen} />}
                        onClick={handleToggleFullscreen}
                    />
                </Tooltip>
            </Space>
        </div>
    );
});
