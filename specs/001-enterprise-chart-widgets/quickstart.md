# Quickstart: Mendix Enterprise Chart Widget Suite

**Branch**: `001-enterprise-chart-widgets`

Developer onboarding for the chart widget monorepo.

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 10.30.0 (`corepack enable && corepack prepare pnpm@10.30.0 --activate`)
- Mendix Studio Pro 10.24.9+

## Repository Layout

```text
iris-widgets/
├── packages/chart-core      # Contracts, adapters, store, event bus
├── packages/chart-ui        # Theme provider, shared UI
├── packages/chart-echarts   # ECharts option builders
└── widgets/ax-*             # Mendix pluggable widgets
```

## Initial Setup

```bash
# From repo root
pnpm install
pnpm run build:packages
```

## Develop a Widget

```bash
# Start ax-barchart dev server (hot reload)
pnpm run dev:barchart

# Or directly — ports: barchart 3000, columnchart 3001, stackareachart 3002, reportchart 3003
pnpm --filter ax-barchart run start
pnpm --filter ax-columnchart run start
pnpm --filter ax-stackareachart run start
pnpm --filter ax-reportchart run start
```

## Build for Mendix

```bash
# Build all packages then a specific widget
pnpm run build:packages
pnpm --filter ax-barchart run build

# Release .mpk artifacts for deployment
pnpm --filter ax-barchart run release
```

Deploy the generated `.mpk` from `widgets/ax-barchart/dist/<version>/` into your Mendix app.

## Bind Data in Mendix

1. Create a String attribute (e.g., `ChartJSON`) on your page entity or use a non-persistable helper.
2. Populate it via microflow/nanoflow calling REST/Elasticsearch.
3. Drag `ax-barchart` onto the page.
4. Set **JSON Data** → `ChartJSON`.
5. Set **Data Format** → `Flat` or `Elastic`.

### Sample Flat JSON

```json
[
  { "id": "1", "name": "CPU", "period": "2025-01", "pm": 120 },
  { "id": "2", "name": "Memory", "period": "2025-01", "pm": 85 },
  { "id": "3", "name": "CPU", "period": "2025-02", "pm": 140 }
]
```

## Selection Wiring

1. Create writable String attributes: `SelectedId`, `SelectedName`, `SelectedPayload`.
2. Bind to widget selection properties.
3. Add microflow to **On Selection Changed** to react to clicks.

`SelectedPayload` contains the full record:

```json
{
  "id": "1",
  "name": "CPU",
  "period": "2025-01",
  "pm": 120,
  "metadata": { "region": "apac" }
}
```

## Studio Pro Preview

Each widget ships an `*.editorPreview.tsx` with mock data from `preview/previewConfig.ts`. Preview works without Mendix runtime — open the widget in Studio Pro to see a representative chart.

## Running Tests

```bash
# All packages and widgets
pnpm test

# Single package
pnpm --filter @iris/chart-core run test
```

## Adding a New Data Adapter

1. Implement `DataAdapter` in `packages/chart-core/src/adapters/`.
2. Register in `AdapterRegistry`.
3. Add enum value to `DataFormat` and widget XML enumeration.
4. No changes required in chart view components or ECharts builders.

## Package Dependency Graph

```text
widgets/ax-*
  ├── @iris/chart-core
  ├── @iris/chart-ui
  └── @iris/chart-echarts
        └── @iris/chart-core

chart-ui (standalone, optional chart-core types)
```

## Key Documents

| Document | Purpose |
|----------|---------|
| [plan.md](./plan.md) | Full architecture plan |
| [spec.md](./spec.md) | Feature requirements |
| [research.md](./research.md) | Technology decisions |
| [data-model.md](./data-model.md) | Entities and state transitions |
| [contracts/](./contracts/) | TypeScript interface contracts |

## Widgets

| Widget | Package | Description |
|--------|---------|-------------|
| ax-barchart | `widgets/ax-barchart` | Horizontal bar chart (reference widget) |
| ax-columnchart | `widgets/ax-columnchart` | Vertical column chart |
| ax-stackareachart | `widgets/ax-stackareachart` | Stacked area chart with legend/zoom |
| ax-reportchart | `widgets/ax-reportchart` | Report chart with drilldown |

---

## Styling Development (Visual Refresh)

The Iris design system uses a **token-first** approach: SCSS custom properties → Tailwind → ECharts theme.

### Token Files

| File | Purpose |
|------|---------|
| `configs/chart-design-tokens.scss` | CSS custom properties (`--iris-*`) |
| `configs/widget-styles.scss` | BEM component classes via `@apply` |
| `configs/tailwind.config.js` | Tailwind `theme.extend` mapping |
| `packages/chart-echarts/src/theme/` | ECharts theme + style helpers |

### Preview Styled Charts

```bash
# Fastest feedback loop — all 4 charts in browser tabs
pnpm run dev:mock-ui
# → http://localhost:5173

# Or individual widget dev servers
pnpm --filter ax-barchart run start    # port 3000
pnpm --filter ax-columnchart run start # port 3001
```

### Styling Workflow

1. **Change a token** in `configs/chart-design-tokens.scss`.
2. **Rebuild packages** if ECharts TS mirror changed: `pnpm run build:packages`.
3. **Hot reload** mock-ui or widget dev server to verify.
4. **Check all 4 chart types** — shared base styles must remain consistent.

### BEM Class Reference

| Class | Element |
|-------|---------|
| `.iris-chart-container` | Outer card shell |
| `.iris-chart-container__title` | Header title |
| `.iris-chart-container__subtitle` | Muted subtitle |
| `.iris-chart-container__body` | Chart canvas area |
| `.iris-chart-empty` | Empty state wrapper |
| `.iris-chart-loading` | Loading overlay |

### ECharts Theme

Charts use the registered theme `iris-enterprise`. In `*ChartView.tsx`:

```tsx
<ReactECharts theme="iris-enterprise" option={option} ... />
```

Do **not** add axis/grid/tooltip config in widget components — use `chartStyleHelpers.ts` in builders.

### Styling Contracts

| Contract | Path |
|----------|------|
| Design tokens | [contracts/chart-design-tokens.ts](./contracts/chart-design-tokens.ts) |
| ECharts theme | [contracts/echarts-theme.ts](./contracts/echarts-theme.ts) |
| Theme provider | [contracts/theme-provider.ts](./contracts/theme-provider.ts) |

### Validation Checklist

- [ ] Container: rounded card, subtle shadow, clean border
- [ ] Axes: muted labels, light grid lines, no heavy axis lines
- [ ] Tooltip: rounded card with color dot and formatted numbers
- [ ] Selection: dimmed non-selected bars/areas, highlighted active item
- [ ] Empty/loading: matches card aesthetic
- [ ] All 4 widgets visually consistent
- [ ] Studio Pro preview matches mock-ui
