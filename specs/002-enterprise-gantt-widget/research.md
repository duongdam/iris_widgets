# Research: Mendix Enterprise Gantt Widget (ax-ganttchart)

**Branch**: `002-enterprise-gantt-widget` | **Date**: 2026-06-10

Phase 0 research resolving technical unknowns from the implementation plan.

---

## 1. DHTMLX Gantt 9.x in Mendix Pluggable Widget

**Decision**: Use `dhtmlx-gantt@^9.1.4` as direct widget dependency; import CSS + JS in widget SCSS/TS entry; initialize via `gantt.init(container)` in `useGanttInstance` hook with React `useRef` mount point.

**Rationale**:
- DHTMLX Gantt 9.x is actively maintained, supports smart rendering by default (v6.2+), and provides enterprise features (export, markers, plugins).
- Mendix widgets bundle dependencies via Rollup; no CDN loading required.
- Single-instance lifecycle matches user requirement to avoid reinitialization on view mode change.

**Alternatives considered**:
- **Frappe Gantt**: Rejected — limited enterprise features (no grid, export, large dataset tooling).
- **Bryntum Gantt**: Rejected — commercial licensing complexity for open widget suite.
- **Shared `packages/gantt-dhtmlx` wrapper**: Deferred to v2 — widget-local integration sufficient for v1.

---

## 2. Mendix Datasource Property Mapping

**Decision**: Define `datasource` property (`type="datasource"`, `isList="true"`) plus child attribute properties with `dataSource="datasource"` for each mappable field (`idAttribute`, `textAttribute`, `startDateAttribute`, etc.).

**Rationale**:
- Mendix Pluggable Widgets API (v10/v11) requires `dataSource` attribute on `attribute` properties to link to list datasource items.
- Client receives `ListValue` with `items`, `status`, `hasMoreItems`; each item exposes mapped `ListAttributeValue` props.
- Generic mapping keeps widget entity-agnostic — developers map any Mendix entity shape.

**Alternatives considered**:
- **JSON string like chart widgets**: Rejected — user explicitly requires datasource approach.
- **Fixed entity schema in XML**: Rejected — violates generic mapping goal.
- **Expression properties per field**: Rejected — attribute mapping is simpler for Studio Pro developers.

**Implementation pattern**:
```ts
// Pseudocode — adapter iterates props.datasource.items
for (const item of datasource.items ?? []) {
    const id = item[idAttribute]?.value;
    const text = item[textAttribute]?.displayValue ?? item[textAttribute]?.value;
    // … map remaining fields
}
```

---

## 3. Date Parsing from Mendix Attributes

**Decision**: Accept Mendix `DateTime` attributes via `ListAttributeValue`; normalize to DHTMLX `start_date` string format (`YYYY-MM-DD HH:mm` or `YYYY-MM-DD` for day granularity) in `GanttDatasourceAdapter`. Support `duration` OR `end_date` — if both present, prefer `end_date`.

**Rationale**:
- DHTMLX expects `start_date` as parseable string or Date; `duration` in days when `end_date` absent.
- Mendix DateTime values arrive as `Date` objects in widget runtime.
- Explicit normalization in adapter isolates Mendix types from DHTMLX config.

**Alternatives considered**:
- **String attributes only**: Rejected — DateTime is the natural Mendix type for scheduling.
- **Client-side moment/dayjs**: Rejected for v1 — native `Intl` + `toISOString` slicing sufficient.

---

## 4. Performance at 1,000–5,000+ Tasks

**Decision**: Enable defaults: `smart_rendering: true`, `autosize: false`, `branch_loading: false` (v1 — full datasource load). Use `gantt.silent(() => gantt.parse({ data, links }))` + `gantt.render()` for bulk load. Use `gantt.updateTask` / `gantt.batchUpdate` for incremental changes. Disable row animation above 500 tasks.

**Rationale**:
- DHTMLX docs confirm smart rendering renders only viewport-visible tasks (default since v6.2).
- `autosize: true` forces rendering all rows — known lag at 1,000+ tasks (DHTMLX forum).
- Silent parse reduces initialization time significantly on large datasets (community benchmarks: 50k items 30min → 10s).

**Alternatives considered**:
- **Dynamic branch loading**: Deferred — requires server-side `$has_child` protocol; Mendix datasource loads full list in v1.
- **Web Worker parsing**: Deferred — DHTMLX is main-thread; adapter pre-processing is lightweight vs parse.

**Benchmark targets (manual)**:

| Tasks | Target initial load | Scroll |
|-------|---------------------|--------|
| 100 | < 200ms | 60fps |
| 500 | < 500ms | 60fps |
| 1,000 | < 1s | 60fps |
| 5,000 | < 3s | 30fps+ acceptable |

---

## 5. Timeline View Mode Switching

**Decision**: `TimelineManager` maps each mode to a `scales` configuration array; on mode change call `gantt.config.scales = …; gantt.render()` without `destructor()` or second `init()`.

**Rationale**:
- DHTMLX supports multiple scale levels (day/hour, week/day, month/week, quarter/month).
- User requirement: smooth switching, no reinitialization.
- Store `viewMode` drives both XML `defaultViewMode` and event bus `ZOOM_*` commands.

**Scale presets**:

| Mode | Scales (example) |
|------|------------------|
| Day | hour (bottom), day (top) |
| Week | day (bottom), week (top) |
| Month | week (bottom), month (top) |
| Quarter | month (bottom), quarter (top) |

---

## 6. Custom Event Bus (No Third-Party)

**Decision**: Replicate `ChartEventBusImpl` pattern (~70 lines) as `GanttEventBusImpl` in widget-local `eventbus/` folder.

**Rationale**:
- Chart widget suite established lightweight typed pub/sub without mitt/EventEmitter.
- Per-widget-instance bus prevents global state.
- Incoming/outgoing event enums are Gantt-specific and should not pollute `chart-core`.

**Alternatives considered**:
- **Extend chart-core event bus**: Rejected — different event vocabularies; coupling unrelated domains.
- **MobX reactions for commands**: Rejected — discrete commands ≠ reactive state.

---

## 7. Export Architecture (PDF, PNG, JPEG, Excel)

**Decision**: `ExportService` wraps DHTMLX `export_api` plugin methods: `exportToPDF`, `exportToPNG`, `exportToExcel`. JPEG implemented as PNG export with `format: 'jpeg'` if supported, else client-side canvas conversion fallback. Default server: `https://export.dhtmlx.com/gantt`; widget property `exportServerUrl` for on-prem module.

**Rationale**:
- DHTMLX provides unified export API endpoint; plugin activation: `gantt.plugins({ export_api: true })`.
- Online service has 10MB request limit — document for enterprise deployments.
- Service layer decoupling satisfies FR-012 and enables future swap to self-hosted Node export module.

**Alternatives considered**:
- **html2canvas custom export**: Rejected — inferior fidelity vs DHTMLX native export.
- **Mendix-side export microflow**: Out of scope — widget triggers export; file delivery via callback URL.

**v1 scope**: Wire event bus → service → DHTMLX API. On-prem server URL is configurable but not bundled.

---

## 8. Fullscreen via Browser Fullscreen API

**Decision**: `FullscreenService` wraps `element.requestFullscreen()` / `document.exitFullscreen()` on widget root container; sync `GanttStore.fullscreen` on `fullscreenchange` event.

**Rationale**:
- User explicitly requests Browser Fullscreen API.
- Event bus `ENTER_FULLSCREEN` / `EXIT_FULLSCREEN` map to service methods.
- MobX observable drives toolbar icon state and emits `FULLSCREEN_CHANGED`.

**Alternatives considered**:
- **CSS-only fullscreen (position fixed)**: Rejected — does not meet Browser Fullscreen API requirement.

---

## 9. Cross-Highlight Hover (Spreadsheet Effect)

**Decision**: Attach `gantt.attachEvent("onMouseMove", …)` to resolve task row + date column under cursor; toggle CSS classes `.gantt-cross-hover-row` and `.gantt-cross-hover-col` on corresponding DOM cells. Debounce 16ms (match chart hover debounce).

**Rationale**:
- DHTMLX does not provide built-in cross-highlight; custom event + CSS is standard approach.
- Colors per user spec: row `#fff8cc`, column `#fffbe6`.
- Class-based approach avoids inline style thrashing.

**Alternatives considered**:
- **Pure CSS `:hover`**: Insufficient — cannot cross-link row + column simultaneously.

---

## 10. Today Marker

**Decision**: Enable `gantt.config.today_marker = true`; style via SCSS `.gantt_marker.today { background-color: #ff4d4f; width: 1px; opacity: 0.85; }`. Marker scrolls with timeline (DHTMLX default sticky behavior in timeline area).

**Rationale**:
- Built-in marker avoids custom layer rendering cost.
- Thin red line matches user visual spec.

---

## 11. Theme Provider (antd ConfigProvider)

**Decision**: Widget-local `ThemeProvider.tsx` wrapping antd `ConfigProvider` with token overrides prepared for Mendix global theme / dark mode. DHTMLX skin styled via SCSS independently (antd does not style Gantt canvas).

**Rationale**:
- Chart widgets use `@iris/chart-ui` ThemeProvider; Gantt toolbar/modals use antd.
- v1: light theme defaults; `darkMode` prop stubbed for future.

**Alternatives considered**:
- **Reuse @iris/chart-ui ThemeProvider directly**: Acceptable — may import from chart-ui if no circular deps; widget-local copy preferred for independent versioning.

---

## 12. Studio Pro Preview

**Decision**: `AxGanttChart.editorPreview.tsx` supplies mock `GanttTask[]` via `previewConfig.ts`; bypass datasource with hardcoded `ListValue` mock or direct store injection (preview-only code path in `GanttProvider`).

**Rationale**:
- Chart widgets use `previewConfig.ts` + `ValueStatus.Available` mocks — proven pattern.
- Preview must not require Mendix datasource binding in design mode.

---

## 13. Workspace Integration

**Decision**: Add `widgets/ax-ganttchart` to PNPM workspace; add `dev:ganttchart` script to root `package.json`; assign development port `3004` (sequential after reportchart 3003).

**Rationale**:
- Follows existing widget package conventions.
- No new shared package until second consumer emerges.

---

## 14. Testing Framework

**Decision**: Jest via `@mendix/pluggable-widgets-tools` for widget; unit tests for `GanttDatasourceAdapter`, `GanttStore`, `TimelineManager`, `GanttEventBus`.

**Rationale**:
- Consistent with chart widget test approach.
- DHTMLX integration tested manually in dev server + Studio Pro preview.

---

## Resolved Clarifications

| Unknown | Resolution |
|---------|------------|
| Data ingestion model | Mendix list datasource + attribute mapping |
| Large dataset strategy | smart_rendering + silent parse + incremental update |
| View mode switching | Scale reconfiguration only |
| Export coupling | Service layer + export_api plugin |
| Shared vs widget-local core | Widget-local for v1 |
| JPEG export | PNG export + conversion fallback |

All NEEDS CLARIFICATION items from Technical Context are resolved.

---

## 16. antd Select `dropdownRender` Deprecation (2026-06-15)

**Decision**: Replace `dropdownRender` with `popupRender` on all `Select` components (`ComboBoxView.tsx`, `CascadingComboboxDemo.tsx`).

**Rationale**:
- antd 6.x emits Mendix runtime console warning: *"Select `dropdownRender` is deprecated. Please use `popupRender` instead."*
- `popupRender` is a direct rename with identical signature `(menu: ReactElement) => ReactElement`.
- No API or UX change; zero risk migration.

**Alternatives considered**:
- **Suppress warning**: Rejected — does not fix root cause; will break in future antd major.
- **Custom dropdown overlay**: Rejected — unnecessary complexity.

---

## 17. Gantt Level-2 Add Button & Brand Color `#009999`

**Decision**:
- Show inline `+` button in grid text column when DHTMLX `task.$level === 1` (second hierarchy tier, 0-indexed: Program=0, Phase=1, …).
- Introduce SCSS token `$gantt-brand: #009999` applied to: add button icon/border, `.gantt-text-cell__count`, default `.gantt_task_line` background (when no task-level `color` override).
- Click handler writes row task to Mendix via new `onAddTask` action; payload = full `GanttTask` JSON (same shape as `selectedPayload`).

**Rationale**:
- User requirement: add affordance only at "cấp 2" (Phase level in 4-tier preview hierarchy).
- `#009999` (`#099`) is Iris brand teal; centralizing in SCSS prevents drift from hardcoded blues (`#4096ff`, `#1677ff`).
- Mendix action pattern matches existing `onTaskClick` / `onSelectionChanged` — no REST, no inline CRUD.

**Alternatives considered**:
- **Show + on all branch nodes**: Rejected — user explicitly limited to level 2.
- **DHTMLX built-in add button**: Rejected — lacks level filtering and brand styling control.
- **CSS-only color patch**: Rejected — task bar colors set in JS config/templates need token reference.

---

## 18. Gantt Progressive Expand Regression in Mendix Runtime

**Decision**:
1. Add MobX `reaction(() => store.expandLevel, level => expandToLevel(gantt, level))` in `useGanttInstance` (or dedicated hook).
2. After `syncTasks` bulk re-parse, re-call `expandToLevel(gantt, store.expandLevel)` when `expandLevel > 0`.
3. Align toolbar `getMaxExpandableLevelFromTasks` with `TreeExpandManager.getMaxExpandableLevel(gantt)` — prefer gantt-computed level when instance is initialized.

**Rationale**:
- **Root cause**: `expandNextLevel` runs synchronously on click (works once), but Mendix datasource re-sync triggers `gantt.clearAll()` + `parse()` which resets branch `open` state. Re-apply only happens in `store.tasks` effect — if tasks reference is stable between clicks, second expand click may update `expandLevel` while DHTMLX tree state diverges.
- **Secondary issue**: No dedicated listener on `expandLevel` changes independent of task sync.
- Toolbar max-level from flat `GanttTask[]` can disagree with runtime `$level` after partial parse.

**Alternatives considered**:
- **Persist `open` on each task in Mendix**: Deferred — requires datasource writeback; out of scope for UI fix.
- **Disable expand after first click**: Rejected — opposite of user requirement.

---

## 19. Bar Chart Category Label Rotation (Clock 1:30)

**Decision**: Set ECharts `axisLabel.rotate: -45` on X-axis category labels in `buildBarChartOption`. Increase grid `bottom` to `"15%"` when rotation is active (always for bar chart).

**Rationale**:
- Clock **1:30** position = upward-right diagonal = **−45°** in ECharts (0° = horizontal, negative = counter-clockwise).
- Current code uses `rotate: 45` (downward slant) only when `labels.length > 8`; user wants consistent upward slant.
- `buildCategoryAxis` helper already accepts `rotate` option — single parameter change.

**Alternatives considered**:
- **`rotate: 135`**: Would slant downward-left — opposite of 1:30 upward intent.
- **Vertical labels (`rotate: 90`)**: Rejected — user specified 1:30 angle specifically.

---

## 20. Chart Widget Fullscreen Commands

**Decision**:
- Add `ChartCommand` enum with `ENTER_FULLSCREEN`, `EXIT_FULLSCREEN` in `packages/chart-core`.
- Extract/reuse `FullscreenService` (Browser Fullscreen API) shared between Gantt and charts.
- Add Mendix XML properties `command` + `commandPayload` to all four chart widgets (mirror Gantt `useCommandSync` clear-after-execute pattern).
- Extend `ChartEvents` with `FULLSCREEN_CHANGED` outgoing event.

**Rationale**:
- Gantt already implements proven command bus; charts lack programmatic fullscreen despite dashboard need.
- Shared service avoids 4 duplicate implementations.
- Mendix integrators expect consistent command attribute API across widget suite.

**Alternatives considered**:
- **Toolbar-only fullscreen button per chart**: Rejected — user asked for command API; toolbar can be added later.
- **CSS `position: fixed` without Fullscreen API**: Rejected — inconsistent with Gantt; doesn't hide browser chrome.
