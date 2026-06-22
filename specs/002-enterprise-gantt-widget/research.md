# Research: AxGanttChart Refactor — Simplified Architecture

**Date**: 2026-06-23 | **Plan**: [plan.md](./plan.md)

---

## §1 — Mendix Action Parameters (Replace eventType/eventPayload)

**Decision**: Dùng **per-action Mendix actions** với **scalar write-back attributes** thay vì unified `onEvent` + JSON payload.

**Rationale**:
- Nanoflow đọc trực tiếp `$outItemId`, `$outType`, `$outChangedNum` — không cần `JSON.parse`
- Mỗi action trong Mendix Studio có signature rõ ràng, dễ bind microflow/nanoflow riêng
- Loại bỏ `WidgetEventBridge`, `GanttOutgoingEvents` enum routing, và `eventPayload` string parsing
- Pattern tương tự chart widgets (`onClick`, `onSelectionChanged`) nhưng thêm write-back attrs cho outbound data

**Write-back sequence** (giữ thứ tự Mendix-safe):
```typescript
function fireAction(action: ActionValue | undefined, attrs: Record<string, EditableValue<unknown> | undefined>, values: Record<string, unknown>): void {
    for (const [key, val] of Object.entries(values)) {
        attrs[key]?.setValue(val);
    }
    if (action?.canExecute !== false) {
        action?.execute?.();
    }
}
```

**Alternatives rejected**:
- Unified `onEvent` + `eventType`/`eventPayload` — user explicitly removed; over-engineered for scalar params
- JavaScript global `window.__AX_GANTT__` — không Mendix-native
- Full task JSON in attribute — quá lớn, khó dùng trong nanoflow

---

## §2 — Unscheduled Tasks (Groups Without Dates)

**Decision**: Không bắt buộc `startDateAttribute`/`endDateAttribute` cho mọi row. Group types (`DISTRICT_GROUP`, `CUSTOM_GROUP`) load **không có dates** với `unscheduled: true`. Config: `gantt.config.show_unscheduled = false`.

**Rationale**:
- DHTMLX **không validate** start/end ở parser — nó gán default dates nội bộ hoặc đánh dấu `$no_start`/`$no_end` ([forum](https://forum.dhtmlx.com/t/gantt-task-bars-are-not-loading-in-timeline-when-none-of-the-tasks-have-start-end-date/76861))
- Sample [Show unscheduled tasks](https://docs.dhtmlx.com/gantt/samples/?sample=%2701_initialization/19_tasks_without_dates.html%27) dùng `show_unscheduled = false` để hiển thị unscheduled rows trong timeline area
- Naming counter-intuitive: `show_unscheduled: false` = **hiển thị** unscheduled tasks ([docs](https://docs.dhtmlx.com/gantt/api/config/show_unscheduled/))
- Hiện tại `validateDatasourceMapping` sai — require `startDateAttribute` globally → block group-only datasources

**Implementation**:
```typescript
// Adapter
function mapRow(entity): AxGanttTask {
    const type = normalizeType(entity.type);
    const isGroup = isGroupType(type); // DISTRICT_GROUP | CUSTOM_GROUP

    return {
        id: entity.itemId,
        text: entity.text,
        parent: entity.parentId,
        type,
        unscheduled: isGroup || !entity.startDate,
        start_date: entity.startDate,  // optional for groups
        end_date: entity.endDate,
        // ...
    };
}

// Init
gantt.config.show_unscheduled = false;
```

**Validation rule mới**:
- Required: `aidAttribute`, `itemIdAttribute`, `typeAttribute`, `textAttribute`, `parentIdAttribute`
- Conditional: TASK/SUB_TASK **should** have start date OR marked unscheduled; groups **must not** require dates
- Remove: global `startDateAttribute is required` error

**Alternatives rejected**:
- Fake placeholder dates for groups — gây lệch timeline và khó maintain
- Filter groups khỏi datasource — mất hierarchy

---

## §3 — changedNum (Month Delta on Drag)

**Decision**: `outChangedNum` = signed integer số tháng lệch giữa start date cũ và mới sau drag/resize.

**Rationale**:
- User example: kéo lùi 2 tháng → `-2`, tiến 2 tháng → `+2`
- Business domain dùng milestone months (`stndMileMonth`, MTO/K/O) — month granularity phù hợp hơn day count
- DHTMLX `onAfterTaskDrag` cung cấp task mới; store snapshot `previousStartDate` trước drag

**Formula**:
```typescript
function computeChangedNum(oldStart: Date, newStart: Date): number {
    const oldMonths = oldStart.getFullYear() * 12 + oldStart.getMonth();
    const newMonths = newStart.getFullYear() * 12 + newStart.getMonth();
    return newMonths - oldMonths;
}
```

**Edge cases**:
- Resize (not move): compute from start date change only (end-only resize → 0 if start unchanged)
- K/O/MTO events (move-only): still emit onChanged if dates shift
- Group/unscheduled rows: no onChanged (no drag)

---

## §4 — Simplified Global Event Bus

**Decision**: Replace `GanttEventBusImpl` + typed enums with minimal topic bus on global scope.

**API**:
```typescript
export const AX_EVENT_BUS_KEY = "AX_EVENT_BUS";

export interface AxEvent {
    widgetId: string;
    [key: string]: unknown;
}

export interface AxEventBus {
    emit(topic: string, event: AxEvent): void;
    on(topic: string, handler: (event: AxEvent) => void): () => void;
    removeListener(topic: string, handler: (event: AxEvent) => void): void;
}
```

**GlobalScope helpers**:
- `createBus()` — factory
- `initEventBus()` — `(globalThis as GlobalScope)[AX_EVENT_BUS_KEY] = createBus()`
- `getEventBus()` — read singleton
- `emitEvent(topic, event)` — `getEventBus()?.emit(topic, event)`

**Rationale**:
- User requirement: KISS, `GlobalKey = "AX_EVENT_BUS"`
- Incoming Mendix commands (`command` attribute) handled by `AxGanttInner` subscribing to topics
- Outgoing interactions primarily via Mendix actions; bus optional for dashboard widgets

**Alternatives rejected**:
- Keep 22 typed incoming + 9 outgoing enums — over-engineered for current scope
- Per-instance bus only — cannot receive cross-widget Mendix commands

---

## §5 — Folder Simplification

**Decision**: Single main JSX (`AxGanttChartView`) + bridge JSX (`AxGanttInner`); one store (`AxGanttStore`).

**Merge plan**:

| Current | After |
|---------|-------|
| `GanttProvider` + 5 hooks | Props passed directly; optional single `useAxGanttLifecycle` |
| `WidgetEventBridge` | Inline `fireMendixAction()` in view |
| `RootStore` + `GanttStore` | `AxGanttStore` only |
| `previewConfig.ts` MOCK tasks | `shared/mock/ganttTestData.ts` from `gantt-test.json` |
| `main/eventbus/*` | `shared/eventBus/*` |

**Keep as modules** (not components): `GanttConfiguration.ts`, `ColumnManager.ts`, `TimelineManager.ts`, `MtoMarker.ts`, `TodayMarker.ts`, `MendixTaskAdapter.ts`

---

## §6 — DHTMLX Gantt Config Reference (v9.1.4)

Complete `GanttConfigOptions` from `dhtmlx-gantt@9.1.4` typings:

| Config key | Type | Purpose |
|------------|------|---------|
| `auto_scheduling` | boolean \| AutoSchedulingConfig | Auto-schedule tasks |
| `auto_scheduling_compatibility` | boolean | Time constraint compatibility |
| `auto_scheduling_descendant_links` | boolean | Parent→child links in auto-schedule |
| `auto_scheduling_initial` | boolean | Auto-schedule on load |
| `auto_scheduling_move_projects` | boolean | Move whole project on schedule |
| `auto_scheduling_project_constraint` | boolean | Inherit constraint from project |
| `auto_scheduling_strict` | boolean | Strict earliest-date scheduling |
| `auto_scheduling_use_progress` | boolean | Completed task handling |
| `auto_types` | boolean | Auto project/task type conversion |
| `autofit` | boolean | Auto-fit grid columns |
| `autoscroll` | boolean | Autoscroll while dragging |
| `autoscroll_speed` | number | Autoscroll speed (ms) |
| `autosize` | boolean \| string | Auto-resize gantt to content |
| `autosize_min_width` | number | Min width in autosize mode |
| `bar_height` | number \| string | Task bar height |
| `bar_height_padding` | number | Padding when bar_height="full" |
| `baselines` | BaselineConfig \| boolean | Baseline display |
| `branch_loading` | boolean | Dynamic branch loading |
| `branch_loading_property` | string | Property marking unloaded children |
| `buttons_left` | string[] | Lightbox left buttons |
| `buttons_right` | string[] | Lightbox right buttons |
| `calendar_property` | string | Task calendar binding property |
| `cascade_delete` | boolean | Delete nested tasks/links |
| `click_drag` | ClickDrag | Advanced click-drag |
| `columns` | GridColumn[] | Grid column config |
| `constraint_types` | object | Constraint type labels |
| `container_resize_method` | string | Container resize tracking |
| `container_resize_timeout` | number | Resize redraw delay |
| `correct_work_time` | boolean | Snap drag to work time |
| `csp` | boolean \| string | CSP-safe date formatting |
| `date_format` | string | Parse/send date format |
| `date_grid` | string | Grid "Start time" format |
| `deadlines` | boolean | Deadline elements |
| `deepcopy_on_parse` | boolean | Deep copy on parse |
| `details_on_create` | boolean | Lightbox on create |
| `details_on_dblclick` | boolean | Lightbox on dblclick |
| `drag_lightbox` | boolean | Draggable lightbox |
| `drag_links` | boolean | Drag-create links |
| `drag_mode` | object | Drag mode names |
| `drag_move` | boolean | Drag-move tasks |
| `drag_multiple` | boolean | Multi-task drag |
| `drag_progress` | boolean | Drag progress knob |
| `drag_project` | boolean | Drag project items |
| `drag_resize` | boolean | Drag-resize tasks |
| `drag_timeline` | object | Timeline drag extension |
| `duration_step` | number | Duration step units |
| `duration_unit` | string | Duration unit |
| `dynamic_resource_calendars` | boolean | Merge resource calendars |
| `editable_property` | string | Per-task edit override |
| `editor_types` | object | Inline editor definitions |
| `end_date` | Date | Scale end |
| `external_render` | object | External component render |
| `fit_tasks` | boolean | Extend scale to fit tasks |
| `grid_elastic_columns` | boolean \| string | Elastic grid columns |
| `grid_resizer_column_attribute` | string | Column resizer attr |
| `grid_width` | number | Grid width |
| `highlight_critical_path` | boolean | Critical path highlight |
| `horizontal_scroll_key` | string \| boolean | Shift+wheel horizontal scroll |
| `inherit_calendar` | boolean | Inherit parent calendar |
| `inherit_scale_class` | boolean | Inherit scale_cell_class |
| `initial_scroll` | boolean | Scroll to earliest task |
| `inline_editors_date_processing` | string | Inline date edit mode |
| `inline_editors_multiselect_open` | boolean | Inline editor on multiselect |
| `keep_grid_width` | boolean | Preserve grid width on resize |
| `keyboard_navigation` | boolean | Keyboard nav |
| `keyboard_navigation_cells` | boolean | Cell keyboard nav |
| `layer_attribute` | string | Task layer DOM attr |
| `layout` | any | Layout object |
| `lightbox` | LightboxSections | Lightbox sections |
| `lightbox_additional_height` | number | Extra lightbox height |
| `link_arrow_size` | number | Link arrow size |
| `link_attribute` | string | Link DOM attr |
| `link_line_width` | number | Link line width |
| `link_radius` | number | Link corner radius |
| `link_wrapper_width` | number | Link click area width |
| `links` | object | Link type IDs |
| `min_column_width` | number | Min timeline column width |
| `min_duration` | number | Min task duration (ms) |
| `min_grid_column_width` | number | Min grid column width |
| `min_task_grid_row_height` | number | Min row height on resize |
| `multiselect` | boolean | Multi-task selection |
| `multiselect_one_level` | boolean | Multiselect same level only |
| `open_split_tasks` | boolean | Expand/collapse split tasks |
| `open_tree_initially` | boolean | Open all branches initially |
| `order_branch` | string \| boolean | Reorder within branch |
| `order_branch_free` | boolean | Reorder across gantt |
| `placeholder_task` | any | Empty row placeholder |
| `preserve_scroll` | boolean | Preserve scroll on redraw |
| `process_resource_assignments` | boolean | Parse resource assignments |
| `project_end` | Date | Project end date |
| `project_start` | Date | Project start date |
| `quick_info_detached` | boolean | Quick info position |
| `quickinfo_buttons` | any[] | Quick info buttons |
| `readonly` | boolean | Read-only mode |
| `readonly_property` | string | Per-task readonly override |
| `redo` | boolean | Redo enabled |
| `reorder_grid_columns` | boolean | Drag-reorder grid columns |
| `resize_rows` | boolean | Drag-resize row height |
| `resource_assignment_store` | string | Resource assignment store |
| `resource_attribute` | string | Resource row attr |
| `resource_calendars` | object | Resource calendars |
| `resource_property` | string | Task resource property |
| `resource_render_empty_cells` | boolean | Render empty resource cells |
| `resource_store` | string | Resource store name |
| `resources` | boolean \| object | Resource diagram config |
| `root_id` | string \| number | Virtual root ID |
| `round_dnd_dates` | boolean | Round drag dates to scale |
| `row_height` | number | Default row height |
| `rtl` | boolean | Right-to-left mode |
| `scale_height` | number | Scale + grid header height |
| `scale_offset_minimal` | boolean | Minimal scale empty space |
| `scales` | Scales | Time scale config |
| `schedule_from_end` | boolean | Backward scheduling |
| `scroll_on_click` | boolean | Scroll timeline on task click |
| `scroll_size` | number | Scrollbar size |
| `select_task` | boolean | Task selection |
| `server_utc` | boolean | UTC date conversion |
| `show_chart` | boolean | Show timeline |
| `show_empty_state` | boolean | Empty grid placeholder |
| `show_errors` | boolean | Error alerts |
| `show_grid` | boolean | Show grid |
| `show_links` | boolean | Show dependency links |
| `show_markers` | boolean | Show markers |
| `show_progress` | boolean | Progress on bars |
| `show_quick_info` | boolean | Quick info popup |
| `show_task_cells` | boolean | Timeline column borders |
| `show_tasks_outside_timescale` | boolean | Tasks outside date range |
| **`show_unscheduled`** | **boolean** | **Unscheduled task display (use `false` to show)** |
| `skip_off_time` | boolean | Hide non-working time |
| `smart_rendering` | boolean | Smart task rendering |
| `smart_scales` | boolean | Render visible scale only |
| `sort` | boolean | Grid sorting |
| `start_date` | Date | Scale start |
| `start_on_monday` | boolean | Week starts Monday |
| `static_background` | boolean | Background image mode |
| `static_background_cells` | boolean | Highlighted cells in static bg |
| `task_attribute` | string | Task DOM attr |
| `task_date` | string | Lightbox date format |
| `task_grid_row_resizer_attribute` | string | Row resizer attr |
| `task_scroll_offset` | number | Scroll-to-task offset |
| `time_picker` | string | Lightbox time format |
| `time_step` | number | Time step (minutes) |
| `timeline_placeholder` | boolean | Empty timeline grid |
| `tooltip_hide_timeout` | number | Tooltip hide delay |
| `tooltip_offset_x` | number | Tooltip X offset |
| `tooltip_offset_y` | number | Tooltip Y offset |
| `tooltip_timeout` | number | Tooltip show delay |
| `touch` | boolean \| string | Touch support |
| `touch_drag` | number \| boolean | Touch drag threshold |
| `touch_feedback` | boolean | Vibration feedback |
| `touch_feedback_duration` | number | Vibration duration |
| `type_renderers` | object | Custom type renderers |
| `types` | object | Task type name mapping |
| `undo` | boolean | Undo enabled |
| `undo_actions` | object | Undo action names |
| `undo_steps` | number | Undo stack depth |
| `undo_types` | object | Undo entity types |
| `wai_aria_attributes` | boolean | WAI-ARIA support |
| `wheel_scroll_sensitivity` | object \| number | Mouse wheel speed |
| `wide_form` | boolean | Wide lightbox form |
| `work_time` | boolean | Working-time durations |

**Widget subset (recommended defaults)** — see [contracts/gantt-configuration.ts](./contracts/gantt-configuration.ts).

---

## §7 — gantt-test.json as Mock Data

**Decision**: Import `gantt-test.json` at build time; normalize to `AxGanttTask[]` for Studio Pro preview and dev mock.

**Mapping**:
- `id` → `itemId` (keep as gantt id)
- `AREA` → `DISTRICT_GROUP`
- `BIZ_LINE` → `CUSTOM_GROUP`
- `TASK` / `SUB_TASK` → unchanged
- `startdate` / `endDate` → `start_date` / `end_date`
- `stndMileMonth` → `stndMileMonth` metadata
- `milestone` → tags / MTO marker logic

**Rationale**: Single source of truth; ~4600 lines real hierarchy; replaces synthetic `MOCK_GANTT_TASKS`

---

## §8 — AxGanttChart.xml Expression Type Fixes

**Decision**: Add explicit return types to expression properties.

| Property | Return type | Default |
|----------|-------------|---------|
| `height` | Integer | 600 |
| `defaultViewMode` | String | "month" |
| `allowDrag` | Boolean | true |
| `allowResize` | Boolean | false |
| `allowGridReorder` | Boolean | true |
| `readOnly` | Boolean | false |
| `optStartDateAttribute` | String | (optional) |
| `optEndDateAttribute` | String | (optional) |

**Fix dataSource refs**: All attribute properties must use `dataSource="roadmapItems"`.
