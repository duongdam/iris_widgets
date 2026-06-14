# Quickstart: Mendix Enterprise Gantt Widget (ax-ganttchart)

**Branch**: `002-enterprise-gantt-widget`

Developer onboarding for the Gantt widget (planning phase — implementation follows `/speckit-implement`).

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 10.30.0 (`corepack enable && corepack prepare pnpm@10.30.0 --activate`)
- Mendix Studio Pro 10.24.9+

## Repository Layout

```text
iris-widgets/
├── widgets/ax-ganttchart/     # Mendix pluggable widget (NEW)
├── widgets/ax-barchart/       # Reference architecture
├── packages/chart-core/       # Chart patterns (event bus, store — reference only)
└── specs/002-enterprise-gantt-widget/
```

## Initial Setup (Post-Implementation)

```bash
# From repo root
pnpm install

# Scaffold exists after Phase 2 implementation
pnpm --filter ax-ganttchart run start   # dev port 3004
pnpm --filter ax-ganttchart run build
pnpm --filter ax-ganttchart run release # .mpk output
```

## Mendix Entity Example

Create entity `GanttTask` (or reuse existing):

| Attribute | Type | Maps to |
|-----------|------|---------|
| `TaskId` | String | `idAttribute` |
| `Name` | String | `textAttribute` |
| `StartDate` | DateTime | `startDateAttribute` |
| `EndDate` | DateTime | `endDateAttribute` |
| `Duration` | Integer | `durationAttribute` |
| `Progress` | Decimal | `progressAttribute` |
| `ParentTaskId` | String | `parentAttribute` |
| `IsExpanded` | Boolean | `openAttribute` |
| `TaskType` | String | `typeAttribute` |

## Bind Datasource in Mendix

1. Create page with data view or list datasource (Database / Microflow / Nanoflow).
2. Drag **Ax Gantt Chart** onto the page.
3. Set **Datasource** → your task list.
4. Map attributes in **Mapping** property group.
5. Set **Height**, **Default View Mode**, display toggles.
6. Wire **Selected Task ID** and **Selected Payload** to writable String attributes.
7. Configure **On Task Click** / **On Selection Changed** actions.

## Selection Wiring

```text
GanttTask_SelectedId   (String, writable) ← selectedTaskId
GanttTask_Payload      (String, writable) ← selectedPayload (full JSON)
```

Microflow on `onSelectionChanged`:
- Parse `GanttTask_Payload` JSON
- Navigate or show detail page

## Event Bus Integration (Dashboard)

External widgets publish commands; Gantt subscribes via shared bus instance (per-page wiring in mock-ui or Mendix nanoflow bridge):

```ts
// Incoming command example
eventBus.emit({
    widgetId: "gantt-main",
    type: GanttIncomingEvents.ZOOM_MONTH,
});

// Outgoing notification
eventBus.on(GanttOutgoingEvents.TASK_SELECTED, payload => {
    console.log(payload.data?.task);
});
```

## Styling

Widget SCSS entry imports:

```scss
@use "./variables.scss";
@use "./hover.scss";
@use "./gantt.scss";
```

**Hover tokens** (from plan):

| Target | Color |
|--------|-------|
| Row hover | `#fff8cc` |
| Timeline column hover | `#fffbe6` |
| Today marker | `#ff4d4f` (1px) |

DHTMLX base skin imported once in `gantt.scss`. antd toolbar styled via `ThemeProvider` `ConfigProvider` tokens.

## Preview (Studio Pro)

Preview uses `preview/previewConfig.ts` mock tasks — no datasource required. Open widget in Studio Pro to verify layout before runtime deployment.

## Performance Checklist

- [ ] `smart_rendering: true` (DHTMLX default)
- [ ] `autosize: false`
- [ ] Bulk load uses `gantt.silent(() => parse())`
- [ ] Single-row edits use `gantt.updateTask`
- [ ] React observer boundaries: only toolbar/chrome re-render, not full Gantt DOM

## Export (Enterprise)

1. Enable `export_api` plugin in `GanttConfiguration.ts`.
2. Default online server: `https://export.dhtmlx.com/gantt`.
3. For on-prem: set widget `exportServerUrl` property.
4. Trigger via event bus: `EXPORT_PDF`, `EXPORT_PNG`, `EXPORT_EXCEL`.

## Related Artifacts

- [plan.md](./plan.md) — architecture
- [data-model.md](./data-model.md) — entities
- [contracts/](./contracts/) — TypeScript + XML contracts
- [research.md](./research.md) — technology decisions

---

## Improvement Batch Verification (2026-06-15)

### 1. ComboBox — antd `popupRender`

```bash
pnpm --filter ax-combobox run build
pnpm run dev:mock-ui
```

- Open Form tab → ComboBox with Select-all
- Open browser DevTools console — **no** `dropdownRender is deprecated` warning

### 2. Gantt — Brand color, level-2 `+`, expand fix

```bash
pnpm --filter ax-ganttchart run build
pnpm run dev:mock-ui   # Gantt tab
```

| Check | Expected |
|-------|----------|
| Phase rows (level 2) | `+` button visible in teal `#009999` |
| Program / Work Package / Task rows | No `+` button |
| Child count `(N)` | Teal `#009999` |
| Task bars (no color override) | Teal `#009999` |
| Click `+` | `onAddTask` fires with row task JSON |
| Expand toolbar button × N clicks | One hierarchy level per click until fully expanded |
| Mendix runtime after datasource refresh | Expand level preserved |

Deploy `.mpk` to Mendix; repeat expand test after build — must not stick at first level.

### 3. Bar chart — diagonal labels

```bash
pnpm --filter ax-barchart run build
pnpm run dev:mock-ui   # Charts tab
```

- Category labels on X-axis slant upward at −45° (clock 1:30)
- Labels do not clip into chart area

### 4. Chart fullscreen commands

Wire writable String attribute `ChartCommand` to chart widget `command` property:

```text
ChartCommand = "ENTER_FULLSCREEN"  → chart enters fullscreen
ChartCommand = "EXIT_FULLSCREEN"   → chart exits fullscreen
(clear attribute after each trigger)
```

Repeat for all four chart widgets: `ax-barchart`, `ax-columnchart`, `ax-stackareachart`, `ax-reportchart`.
