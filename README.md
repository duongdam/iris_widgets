# Iris Widgets — Mendix Enterprise Chart Suite

PNPM monorepo containing four Mendix pluggable chart widgets and shared chart packages.

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 10.30.0

```bash
corepack enable && corepack prepare pnpm@10.30.0 --activate
```

- Mendix Studio Pro 10.24.9+ (for widget deployment)

## Repository Layout

```text
iris-widgets/
├── packages/
│   ├── chart-core/      # Contracts, adapters, MobX store, event bus
│   ├── chart-ui/        # Theme provider, shared UI components, hooks
│   └── chart-echarts/   # ECharts option builders (no React)
└── widgets/
    ├── ax-barchart/         # Horizontal bar chart
    ├── ax-columnchart/      # Vertical column chart
    ├── ax-stackareachart/   # Stacked area chart
    └── ax-reportchart/      # Report chart with drilldown
```

## Install

```bash
pnpm install
```

## Build

```bash
# Shared packages only
pnpm run build:packages

# All packages and widgets
pnpm run build

# Single widget
pnpm --filter ax-barchart run build
```

## Develop

Each widget has a hot-reload dev server via `@mendix/pluggable-widgets-tools`:

| Widget | Command | Dev port |
|--------|---------|----------|
| ax-barchart | `pnpm --filter ax-barchart run start` | 3000 |
| ax-columnchart | `pnpm --filter ax-columnchart run start` | 3001 |
| ax-stackareachart | `pnpm --filter ax-stackareachart run start` | 3002 |
| ax-reportchart | `pnpm --filter ax-reportchart run start` | 3003 |

```bash
# Shortcut for ax-barchart
pnpm run dev:barchart
```

### Mock UI (visual preview)

React + Vite app to preview all chart `main/components` with flat JSON and Elasticsearch mock data:

```bash
pnpm run dev:mock-ui
# → http://localhost:5173
```

Switch data source (Flat / Elasticsearch), dataset, and chart type in the sidebar.

## Code quality (widgets)

Shared tooling for all widgets under `widgets/`:

| Tool | Config | Commands |
|------|--------|----------|
| Prettier | `prettier.config.js` (root) | `pnpm format` |
| ESLint | `configs/eslint.widget.js` | `pnpm lint` / `pnpm lint:fix` |
| Tailwind CSS | `configs/tailwind.config.js` + `configs/widget-styles.scss` | Built via Rollup (`configs/widget-rollup.config.mjs`) |

```bash
# Format all widgets
pnpm format

# Lint all widgets
pnpm lint

# Auto-fix lint + format
pnpm lint:fix
```

## Deploy to Mendix

Build release artifacts (`.mpk` files) for all widgets:

```bash
pnpm run build:packages
pnpm run release:widgets
```

`.mpk` files are written to `widgets/<widget>/dist/<version>/` and collected into `builds/` after build or release.

Import each `.mpk` into Mendix Studio Pro via **App Store** → **Import**.

## Bind Data in Mendix

1. Create a String attribute (e.g. `ChartJSON`) on your page entity.
2. Populate it via microflow/nanoflow (REST, Elasticsearch, etc.).
3. Drag a chart widget onto the page.
4. Set **JSON Data** → your String attribute.
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
2. Bind them to the widget selection properties.
3. Add a microflow to **On Selection Changed** to react to chart clicks.

## Test

```bash
# All packages and widgets
pnpm test

# Single package
pnpm --filter @iris/chart-core run test

# Single widget unit tests
pnpm --filter ax-barchart run test
```

## Architecture

- Widgets consume data via a `jsonData` String attribute — no Mendix datasource.
- `FlatDataAdapter` / `ElasticAggregationAdapter` normalize JSON into `ChartRecord[]`.
- ECharts configuration lives in `@iris/chart-echarts` builders only.
- Selection lifecycle: click → MobX store → Mendix attributes → event bus → Mendix actions.

See [specs/001-enterprise-chart-widgets/quickstart.md](specs/001-enterprise-chart-widgets/quickstart.md) for full developer onboarding.

## Performance

For large datasets (5,000+ records), bar and column builders enable ECharts `large` mode with progressive rendering. Animation is disabled above 1,000 records. Stacked area charts use LTTB sampling at the same threshold.
