# Data Model: Mendix Enterprise Chart Widget Suite

**Branch**: `001-enterprise-chart-widgets` | **Date**: 2026-06-10

## Entity Relationship Overview

```text
┌─────────────────┐     transform      ┌──────────────┐
│  Raw JSON       │ ─────────────────► │ ChartRecord[] │
│  (Flat/Elastic) │   DataAdapter      └──────┬───────┘
└─────────────────┘                            │
                                               ▼
                                        ┌──────────────┐
                                        │  ChartStore  │
                                        └──────┬───────┘
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
            ┌──────────────┐          ┌──────────────┐          ┌─────────────────┐
            │ categories   │          │ seriesData   │          │ selectedRecord  │
            │ (computed)   │          │ (computed)   │          │ (optional)      │
            └──────────────┘          └──────────────┘          └────────┬────────┘
                                                                          │
                    ┌─────────────────────────────────────────────────────┘
                    ▼
            ┌──────────────────┐     emit      ┌───────────────────┐
            │ Mendix Attributes │ ◄─────────── │ ChartEventPayload │
            │ selectedId/Name/  │              └───────────────────┘
            │ Payload           │
            └──────────────────┘
```

---

## Core Entities

### ChartRecord

Normalized data point consumed by all widgets and builders.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `id` | `string` | Yes | Non-empty | Unique within dataset; adapter generates if missing |
| `parent` | `string` | No | — | Hierarchy hint for future drilldown |
| `name` | `string` | Yes | Non-empty | Series/category label |
| `period` | `string` | Yes | Non-empty | Time bucket or category axis value |
| `pm` | `number` | Yes | Finite number | Primary measure |
| `metadata` | `Record<string, unknown>` | No | Opaque | Never inspected by widgets; preserved in selection/events |

**Invariants**:
- Widgets MUST NOT read specific keys inside `metadata` (except pass-through).
- `metadata` MUST survive adapter → store → selection → Mendix attribute → event payload unchanged.

---

### DataFormat

| Value | Description |
|-------|-------------|
| `FLAT` | JSON array of record objects |
| `ELASTIC` | Elasticsearch nested aggregation response |

Mapped to Mendix XML enum: `flat`, `elastic`.

---

### SeriesGroup

Computed grouping for multi-series charts (not persisted).

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Series name (from `ChartRecord.name`) |
| `records` | `ChartRecord[]` | Records belonging to this series |

---

### ChartStore State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `records` | `ChartRecord[]` | `[]` | All normalized records |
| `selectedRecord` | `ChartRecord \| undefined` | `undefined` | Current selection |
| `loading` | `boolean` | `false` | Parse/transform in progress |

**Computed**:

| Property | Derivation |
|----------|------------|
| `categories` | Unique `period` values, lexicographically sorted |
| `seriesData` | `records` grouped by `name` into `SeriesGroup[]` |

**State transitions**:

```text
[empty] ──setRecords()──► [loaded]
[loaded] ──selectRecord(r)──► [loaded+selected]
[loaded+selected] ──clearSelection()──► [loaded]
[loaded+selected] ──selectRecord(r2)──► [loaded+selected]  (selection replaced)
[*] ──setRecords([])──► [empty]
```

---

### ChartContextState

Dashboard preparation only — not fully implemented in v1.

| Field | Type | Description |
|-------|------|-------------|
| `globalFilter` | `string \| undefined` | Future dashboard filter expression |
| `globalTimeRange` | `string \| undefined` | Future time range (e.g., ISO interval) |

---

### ChartEventPayload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `widgetId` | `string` | Yes | Mendix widget instance identifier |
| `type` | `ChartEvents` | Yes | Event enum value |
| `data` | `unknown` | No | Event-specific payload; includes `ChartRecord` where applicable |

---

### ChartEvents

| Event | Payload `data` shape |
|-------|------------------------|
| `CHART_READY` | `{ recordCount: number }` |
| `CHART_CLICK` | `{ record: ChartRecord }` |
| `CHART_HOVER` | `{ record: ChartRecord }` |
| `CHART_LEGEND_SELECT` | `{ seriesName: string; selected: boolean }` |
| `CHART_SELECTION_CHANGED` | `{ record?: ChartRecord }` |
| `CHART_REFRESH` | `{ recordCount: number }` |
| `CHART_FILTER_CHANGED` | `{ filter: string }` |
| `CHART_TIME_RANGE_CHANGED` | `{ range: string }` |
| `CHART_DRILLDOWN` | `{ record: ChartRecord; level: number }` |
| `DASHBOARD_REFRESH` | `{ source: string }` |

---

### WidgetProps (Mendix-facing)

Common across all four widgets.

| Group | Property | Mendix Type | Writable | Description |
|-------|----------|-------------|----------|-------------|
| General | `title` | string | No | Chart title |
| General | `height` | integer | No | Height in px |
| Data | `jsonData` | attribute (string) | No | Input JSON |
| Data | `dataFormat` | enum | No | `flat` / `elastic` |
| Display | `showLegend` | boolean | No | Show legend |
| Display | `showTooltip` | boolean | No | Show tooltip |
| Selection | `selectedId` | attribute (string) | Yes | Output selection id |
| Selection | `selectedName` | attribute (string) | Yes | Output selection name |
| Selection | `selectedPayload` | attribute (string) | Yes | Output full record JSON |
| Events | `onClick` | action | — | Click handler |
| Events | `onSelectionChanged` | action | — | Selection change handler |

---

### ReportChartOptions (extends ChartDisplayOptions)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `aggregationMode` | `'period' \| 'name' \| 'both'` | `'both'` | Which aggregations to display |
| `showGrandTotal` | `boolean` | `true` | Display grand total annotation |
| `drilldownEnabled` | `boolean` | `false` | v1: false; enables future `CHART_DRILLDOWN` |

---

## Input Format Schemas

### Flat Format

```json
[
  {
    "id": "1",
    "parent": "",
    "name": "CPU",
    "period": "2025-01",
    "pm": 120,
    "metadata": { "region": "apac" }
  }
]
```

**Adapter rules**:
- Missing `id` → generate `flat-{index}-{name}`
- Missing `parent` → `undefined`
- Missing `metadata` → `undefined`
- Invalid `pm` → skip record, log warning

### Elastic Format

```json
{
  "aggregations": {
    "periods": {
      "buckets": [
        {
          "key": "2025-01",
          "items": {
            "buckets": [
              {
                "key": "CPU",
                "value": { "value": 120 }
              }
            ]
          }
        }
      ]
    }
  }
}
```

**Adapter rules**:
- `id` → `{key}:{item.key}`
- `period` → bucket `key`
- `name` → item bucket `key`
- `pm` → `value.value`
- `metadata._elastic` → raw item bucket object

---

## Selection Lifecycle Data Flow

```text
1. User clicks ECharts data element
2. Widget resolves ChartRecord from series index + store.records
3. ChartStore.selectRecord(record)
4. useSelectionSync effect:
   a. props.selectedId.setValue(record.id)
   b. props.selectedName.setValue(record.name)
   c. props.selectedPayload.setValue(JSON.stringify(record))
5. eventBus.emit({ widgetId, type: CHART_SELECTION_CHANGED, data: { record } })
6. props.onSelectionChanged.execute()
7. props.onClick.execute()
```

**selectedPayload example**:

```json
{
  "id": "123",
  "parent": "root",
  "name": "CPU",
  "period": "2025-01",
  "pm": 120,
  "metadata": {
    "region": "apac",
    "cluster": "cluster-a"
  }
}
```

---

## Validation Summary

| Layer | Validates |
|-------|-----------|
| Adapter | JSON parseable; required fields present; `pm` numeric |
| Store | Accepts only `ChartRecord[]`; no field mutation |
| Builder | Handles empty arrays; does not read `metadata` keys |
| Widget | Writes complete record to `selectedPayload`; no field stripping |

---

## Presentation Entities (Visual Refresh)

### ChartDesignTokens

Shared visual constants consumed by SCSS, Tailwind, and ECharts theme. Defined in `configs/chart-design-tokens.scss` and mirrored in TypeScript.

| Token | CSS Variable | Type | Default | Used By |
|-------|--------------|------|---------|---------|
| `primary` | `--iris-primary` | color | `#4F46E5` | Selection emphasis, links |
| `surface` | `--iris-surface` | color | `#FFFFFF` | Container background |
| `surfaceMuted` | `--iris-surface-muted` | color | `#F8FAFC` | Empty state background |
| `border` | `--iris-border` | color | `#E2E8F0` | Container border |
| `borderStrong` | `--iris-border-strong` | color | `#CBD5E1` | Hover borders |
| `textPrimary` | `--iris-text-primary` | color | `#0F172A` | Title text |
| `textSecondary` | `--iris-text-secondary` | color | `#64748B` | Axis labels, subtitle |
| `textMuted` | `--iris-text-muted` | color | `#94A3B8` | Empty state message |
| `gridLine` | `--iris-grid-line` | color | `#F1F5F9` | ECharts splitLine |
| `shadowSm` | `--iris-shadow-sm` | shadow | `0 1px 3px rgba(15,23,42,0.08)` | Container |
| `shadowMd` | `--iris-shadow-md` | shadow | `0 4px 12px rgba(15,23,42,0.10)` | Tooltip |
| `radiusLg` | `--iris-radius-lg` | length | `12px` | Container |
| `radiusSm` | `--iris-radius-sm` | length | `4px` | Bar top radius |
| `fontFamily` | `--iris-font-family` | string | system stack | All text |
| `series1..8` | `--iris-series-N` | color | see research §14 | ECharts series |

**Invariants**:
- Token values MUST NOT be duplicated as hardcoded hex in builders or TSX.
- Dark mode overrides live under `[data-theme="dark"]` selector only.

---

### ChartShellProps

Extended presentation props for `ChartContainer` (optional, backward compatible).

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `title` | `string` | No | — | Header text (existing) |
| `subtitle` | `string` | No | — | Muted text below title |
| `compact` | `boolean` | No | `false` | Reduced padding for dashboard tiles |
| `showHeaderDivider` | `boolean` | No | `true` | Border between header and chart body |
| `height` | `number` | Yes | — | Chart body height in px (existing) |
| `className` | `string` | No | — | Additional BEM modifier (existing) |

---

### EChartsStylePreset

Per-chart-type visual preset applied by builders.

| Preset | Chart Type | Key Properties |
|--------|------------|----------------|
| `barVertical` | ax-barchart | `barMaxWidth: 48`, top radius 4px, single gradient |
| `columnGrouped` | ax-columnchart | `barGap: '20%'`, `barCategoryGap: '30%'`, multi-color |
| `areaStacked` | ax-stackareachart | gradient area 0.4→0.05 opacity, line width 2, smooth |
| `reportCombo` | ax-reportchart | bar + line overlay, label on top N values |

---

### SelectionVisualState

Visual feedback when `selectedId` matches a data point (builder-level, not store change).

| State | Visual |
|-------|--------|
| `default` | Full opacity, no border |
| `selected` | `opacity: 1`, others `opacity: 0.35`, selected bar gets `--iris-primary` border |
| `hover` | Brightness +8% via ECharts `emphasis.itemStyle` |

**Data flow unchanged** — styling reads `options.selectedId` already passed to builders.
